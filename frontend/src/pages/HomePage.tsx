import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { BlogFrame } from "../components/blog/BlogFrame.tsx";
import { BlogSidebar } from "../components/blog/BlogSidebar.tsx";
import { PostListCard } from "../components/blog/PostListCard.tsx";
import { createHomePath } from "../lib/routes.ts";
import { normalizePost } from "../lib/post.ts";
import type { Post } from "../types/post.ts";

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

function buildCategoryItems(posts: Post[]) {
    const counts = new Map<string, number>();

    posts.forEach((post) => {
        const name = post.category?.name ?? "未分类";
        counts.set(name, (counts.get(name) ?? 0) + 1);
    });

    return [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6);
}

function buildTagItems(posts: Post[]) {
    const tags = new Set<string>();

    posts.forEach((post) => {
        (post.tags ?? []).forEach((tag) => tags.add(tag.name));
    });

    return [...tags].slice(0, 18);
}

export function HomePage({ apiBaseUrl }: HomePageProps) {
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const currentPage = useMemo(() => {
        const rawPage = Number(searchParams.get("page") ?? "1");
        return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    }, [searchParams]);

    useEffect(() => {
        const controller = new AbortController();

        const loadPosts = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/posts?page=${currentPage}&pageSize=${POSTS_PER_PAGE}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Request failed with status ${response.status}`,
                    );
                }

                const payload: PostListPayload = await response.json();
                setPosts(payload.data.map(normalizePost));
                setTotalPosts(payload.pagination?.total ?? payload.data.length);
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
                setError("后端暂时未连接，无法加载文章内容。");
            } finally {
                setLoading(false);
            }
        };

        void loadPosts();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl, currentPage]);

    const categoryItems = useMemo(() => buildCategoryItems(posts), [posts]);
    const tagItems = useMemo(() => buildTagItems(posts), [posts]);
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE)),
        [totalPosts],
    );
    const safePage = Math.min(currentPage, totalPages);

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
                                    to={createHomePath(safePage - 1)}
                                    className={`rounded-md border px-3 py-1.5 ${
                                        safePage === 1
                                            ? "pointer-events-none border-slate-100 text-slate-300"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    上一页
                                </Link>
                                <Link
                                    to={createHomePath(safePage + 1)}
                                    className={`rounded-md border px-3 py-1.5 ${
                                        safePage === totalPages
                                            ? "pointer-events-none border-slate-100 text-slate-300"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    下一页
                                </Link>
                            </div>
                        </section>
                    ) : null}

                    {!loading && posts.length === 0 ? (
                        <div className="fuwari-card-soft px-5 py-6 text-sm text-slate-500">
                            暂时没有文章内容。
                        </div>
                    ) : null}
                </>
            }
        />
    );
}
