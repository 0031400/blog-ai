import { useEffect, useMemo, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";

import { BlogFrame } from "../components/blog/BlogFrame.tsx";
import { BlogSidebar } from "../components/blog/BlogSidebar.tsx";
import { PostListCard } from "../components/blog/PostListCard.tsx";
import {
    createCategoryPath,
    createHomePath,
    createTagPath,
} from "../lib/routes.ts";
import { normalizePost } from "../lib/post.ts";
import type { Category } from "../types/category.ts";
import type { Post } from "../types/post.ts";
import type { Tag } from "../types/tag.ts";

type HomePageProps = {
    apiBaseUrl: string;
};

const POSTS_PER_PAGE = 5;

type PostListPayload = {
    data: Post[];
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
    };
};

function buildCategoryItems(posts: Post[], categories: Category[]) {
    const counts = new Map<string, number>();

    posts.forEach((post) => {
        const name = post.category?.name ?? "未分类";
        counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    return categories
        .map((category) => ({
            id: category.id,
            name: category.name,
            count: counts.get(category.name) ?? 0,
        }))
        .filter((category) => category.count > 0)
        .sort((left, right) => right.count - left.count)
        .slice(0, 6);
}

function buildTagItems(tags: Tag[]) {
    return tags.slice(0, 18);
}

export function HomePage({ apiBaseUrl }: HomePageProps) {
    const navigate = useNavigate();
    const { id: taxonomyId = "" } = useParams();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const isCategoryView = location.pathname.startsWith("/category/");
    const isTagView = location.pathname.startsWith("/tag/");
    const currentPage = useMemo(() => {
        const rawPage = Number(searchParams.get("page") ?? "1");
        return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    }, [searchParams]);
    const selectedCategory = useMemo(
        () =>
            categories.find((category) => String(category.id) === taxonomyId) ??
            null,
        [categories, taxonomyId],
    );
    const selectedTag = useMemo(
        () => tags.find((tag) => String(tag.id) === taxonomyId) ?? null,
        [tags, taxonomyId],
    );

    useEffect(() => {
        const controller = new AbortController();

        const loadPosts = async () => {
            try {
                const search = new URLSearchParams({
                    page: String(currentPage),
                    pageSize: String(POSTS_PER_PAGE),
                });
                if (isCategoryView && taxonomyId) {
                    search.set("categoryId", taxonomyId);
                }
                if (isTagView && taxonomyId) {
                    search.set("tagId", taxonomyId);
                }

                const [postsResponse, categoriesResponse, tagsResponse] =
                    await Promise.all([
                        fetch(`${apiBaseUrl}/api/posts?${search.toString()}`, {
                            signal: controller.signal,
                        }),
                        fetch(`${apiBaseUrl}/api/categories`, {
                            signal: controller.signal,
                        }),
                        fetch(`${apiBaseUrl}/api/tags`, {
                            signal: controller.signal,
                        }),
                    ]);

                if (!postsResponse.ok) {
                    throw new Error(
                        `Request failed with status ${postsResponse.status}`,
                    );
                }

                const payload: PostListPayload = await postsResponse.json();
                setPosts(payload.data.map(normalizePost));
                setTotalPosts(payload.pagination?.total ?? payload.data.length);

                if (categoriesResponse.ok) {
                    const categoryPayload: { data: Category[] } =
                        await categoriesResponse.json();
                    setCategories(categoryPayload.data);
                }

                if (tagsResponse.ok) {
                    const tagPayload: { data: Tag[] } =
                        await tagsResponse.json();
                    setTags(tagPayload.data);
                }

                setError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setPosts([]);
                setTotalPosts(0);
                setCategories([]);
                setTags([]);
                setError("后端暂时未连接，无法加载文章内容。");
            } finally {
                setLoading(false);
            }
        };

        void loadPosts();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl, currentPage, isCategoryView, isTagView, taxonomyId]);

    const categoryItems = useMemo(
        () => buildCategoryItems(posts, categories),
        [categories, posts],
    );
    const tagItems = useMemo(() => buildTagItems(tags), [tags]);
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE)),
        [totalPosts],
    );
    const safePage = Math.min(currentPage, totalPages);
    const [pageInput, setPageInput] = useState(String(safePage));

    useEffect(() => {
        setPageInput(String(safePage));
    }, [safePage]);

    const submitPage = () => {
        const nextPage = Number(pageInput);
        if (!Number.isInteger(nextPage) || nextPage < 1) {
            setPageInput(String(safePage));
            return;
        }

        const nextSafePage = Math.min(nextPage, totalPages);
        if (isCategoryView && taxonomyId) {
            navigate(createCategoryPath(taxonomyId, nextSafePage));
            return;
        }
        if (isTagView && taxonomyId) {
            navigate(createTagPath(taxonomyId, nextSafePage));
            return;
        }
        navigate(createHomePath(nextSafePage));
    };

    return (
        <BlogFrame
            leftAside={
                <BlogSidebar categories={categoryItems} tags={tagItems} />
            }
            main={
                <>
                    {error ? (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {error}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="fuwari-card-soft px-5 py-6 text-sm text-slate-500">
                            正在同步最新文章...
                        </div>
                    ) : null}

                    <section className="space-y-5">
                        {selectedCategory ? (
                            <div className="fuwari-card-soft px-5 py-4 text-sm text-slate-500">
                                当前分类：{selectedCategory.name}
                            </div>
                        ) : null}

                        {selectedTag ? (
                            <div className="fuwari-card-soft px-5 py-4 text-sm text-slate-500">
                                当前标签：{selectedTag.name}
                            </div>
                        ) : null}

                        {posts.map((post) => (
                            <PostListCard key={post.id} post={post} />
                        ))}
                    </section>

                    {!loading && totalPosts > POSTS_PER_PAGE ? (
                        <section className="fuwari-card-soft flex flex-col gap-3 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>
                                第 {safePage} / {totalPages} 页
                            </div>
                            <div className="flex items-center gap-3 self-start md:self-auto">
                                <Link
                                    to={
                                        isCategoryView && taxonomyId
                                            ? createCategoryPath(
                                                  taxonomyId,
                                                  safePage - 1,
                                              )
                                            : isTagView && taxonomyId
                                              ? createTagPath(
                                                    taxonomyId,
                                                    safePage - 1,
                                                )
                                              : createHomePath(safePage - 1)
                                    }
                                    className={`rounded-md border px-3 py-1.5 ${
                                        safePage === 1
                                            ? "pointer-events-none border-slate-100 text-slate-300"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    上一页
                                </Link>
                                <Link
                                    to={
                                        isCategoryView && taxonomyId
                                            ? createCategoryPath(
                                                  taxonomyId,
                                                  safePage + 1,
                                              )
                                            : isTagView && taxonomyId
                                              ? createTagPath(
                                                    taxonomyId,
                                                    safePage + 1,
                                                )
                                              : createHomePath(safePage + 1)
                                    }
                                    className={`rounded-md border px-3 py-1.5 ${
                                        safePage === totalPages
                                            ? "pointer-events-none border-slate-100 text-slate-300"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    下一页
                                </Link>
                                <div className="flex items-center gap-2">
                                    <input
                                        value={pageInput}
                                        onChange={(event) =>
                                            setPageInput(
                                                event.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        onBlur={submitPage}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                submitPage();
                                            }
                                        }}
                                        className="w-14 rounded-md border border-slate-200 px-2 py-1.5 text-center text-slate-700 outline-none"
                                    />
                                    <span>页</span>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {!loading && posts.length === 0 ? (
                        <div className="fuwari-card-soft px-5 py-6 text-sm text-slate-500">
                            {selectedCategory
                                ? `分类「${selectedCategory.name}」下暂时没有文章。`
                                : selectedTag
                                  ? `标签「${selectedTag.name}」下暂时没有文章。`
                                  : "暂时没有文章内容。"}
                        </div>
                    ) : null}
                </>
            }
        />
    );
}
