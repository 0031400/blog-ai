import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BlogFrame } from "../components/blog/BlogFrame.tsx";
import { BlogSidebar } from "../components/blog/BlogSidebar.tsx";
import { MarkdownContent } from "../components/MarkdownContent.tsx";
import { formatDate } from "../lib/date";
import { normalizePost } from "../lib/post.ts";
import { calculateReadingStats } from "../lib/readingStats.ts";
import { createCategoryPath, createTagPath } from "../lib/routes.ts";
import type { Category } from "../types/category.ts";
import type { Post } from "../types/post.ts";
import type { Tag } from "../types/tag.ts";

type PostDetailPageProps = {
    apiBaseUrl: string;
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

function buildTagItems(posts: Post[], tags: Tag[]) {
    const tagIds = new Set<number>();

    posts.forEach((post) => {
        (post.tags ?? []).forEach((tag) => tagIds.add(tag.id));
    });

    return tags.filter((tag) => tagIds.has(tag.id)).slice(0, 18);
}

export function PostDetailPage({ apiBaseUrl }: PostDetailPageProps) {
    const { slug = "" } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [publicPosts, setPublicPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    useEffect(() => {
        if (!slug) {
            setPost(null);
            setDetailError("暂时没有找到这篇文章。");
            return;
        }

        const controller = new AbortController();

        const loadData = async () => {
            setDetailLoading(true);

            try {
                const [
                    postResponse,
                    postsResponse,
                    categoriesResponse,
                    tagsResponse,
                ] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/posts/${slug}`, {
                        signal: controller.signal,
                    }),
                    fetch(`${apiBaseUrl}/api/posts`, {
                        signal: controller.signal,
                    }),
                    fetch(`${apiBaseUrl}/api/categories`, {
                        signal: controller.signal,
                    }),
                    fetch(`${apiBaseUrl}/api/tags`, {
                        signal: controller.signal,
                    }),
                ]);

                if (!postResponse.ok) {
                    throw new Error(
                        `Request failed with status ${postResponse.status}`,
                    );
                }

                const postPayload: { data: Post } = await postResponse.json();
                setPost(normalizePost(postPayload.data));

                if (postsResponse.ok) {
                    const postsPayload: { data: Post[] } =
                        await postsResponse.json();
                    setPublicPosts(postsPayload.data.map(normalizePost));
                }

                if (categoriesResponse.ok) {
                    const categoriesPayload: { data: Category[] } =
                        await categoriesResponse.json();
                    setCategories(categoriesPayload.data);
                }

                if (tagsResponse.ok) {
                    const tagsPayload: { data: Tag[] } =
                        await tagsResponse.json();
                    setTags(tagsPayload.data);
                }

                setDetailError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setPost(null);
                setPublicPosts([]);
                setCategories([]);
                setTags([]);
                setDetailError("这篇文章暂时无法加载。");
            } finally {
                setDetailLoading(false);
            }
        };

        void loadData();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl, slug]);

    const categoryItems = useMemo(
        () => buildCategoryItems(publicPosts, categories),
        [categories, publicPosts],
    );
    const tagItems = useMemo(
        () => buildTagItems(publicPosts, tags),
        [publicPosts, tags],
    );
    const readingStats = useMemo(
        () => calculateReadingStats(post?.content ?? ""),
        [post?.content],
    );

    return (
        <BlogFrame
            leftAside={
                <BlogSidebar categories={categoryItems} tags={tagItems} />
            }
            main={
                <>
                    {detailError ? (
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {detailError}
                        </div>
                    ) : null}

                    {post ? (
                        <article className="fuwari-card">
                            <div className="border-b border-slate-100 px-6 py-5 md:px-9 md:pt-6">
                                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="fuwari-meta-icon mr-0">
                                            ◫
                                        </span>
                                        {readingStats.characterCount} 字
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="fuwari-meta-icon mr-0">
                                            ◌
                                        </span>
                                        预计 {readingStats.minuteCount} 分钟
                                    </span>
                                </div>

                                <h1 className="fuwari-font-title relative mt-5 block text-[2rem] font-bold tracking-[-0.055em] text-slate-950 md:text-[2.75rem] md:leading-[2.75rem]">
                                    {post.title}
                                </h1>

                                <div className="mt-5 flex flex-wrap items-center gap-2.5 text-[15px] text-slate-400 md:gap-3">
                                    <span className="fuwari-tag">
                                        ◫ {formatDate(post.publishedAt)}
                                    </span>
                                    {post.category ? (
                                        <Link
                                            to={createCategoryPath(
                                                post.category.id,
                                            )}
                                            className="fuwari-tag transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                                        >
                                            ◌ {post.category.name}
                                        </Link>
                                    ) : (
                                        <span className="fuwari-tag">
                                            ◌ 未分类
                                        </span>
                                    )}
                                    {(post.tags ?? []).map((tag) => (
                                        <Link
                                            key={tag.id}
                                            to={createTagPath(tag.id)}
                                            className="fuwari-tag transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                                        >
                                            # {tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 py-8 md:px-9">
                                <MarkdownContent content={post.content} />
                            </div>
                        </article>
                    ) : (
                        <div className="fuwari-card-soft px-5 py-6 text-sm text-slate-500">
                            {detailLoading
                                ? "正在加载文章..."
                                : "暂时没有找到这篇文章。"}
                        </div>
                    )}
                </>
            }
        />
    );
}
