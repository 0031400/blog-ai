import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { BlogFrame } from "../components/blog/BlogFrame.tsx";
import { BlogSidebar } from "../components/blog/BlogSidebar.tsx";
import { MarkdownContent } from "../components/MarkdownContent.tsx";
import { fallbackPosts } from "../data/fallbackPosts.ts";
import { formatDate } from "../lib/date";
import { normalizePost } from "../lib/post.ts";
import type { Post } from "../types/post.ts";

type PostDetailPageProps = {
    apiBaseUrl: string;
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

export function PostDetailPage({ apiBaseUrl }: PostDetailPageProps) {
    const { slug = "" } = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [publicPosts, setPublicPosts] = useState<Post[]>(
        fallbackPosts
            .map(normalizePost)
            .filter(
                (item) =>
                    !item.deleted &&
                    item.status === "published" &&
                    item.visibility === "public",
            ),
    );
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
                const [postResponse, postsResponse] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/posts/${slug}`, {
                        signal: controller.signal,
                    }),
                    fetch(`${apiBaseUrl}/api/posts`, {
                        signal: controller.signal,
                    }),
                ]);

                if (!postResponse.ok) {
                    throw new Error(`Request failed with status ${postResponse.status}`);
                }

                const postPayload: { data: Post } = await postResponse.json();
                setPost(normalizePost(postPayload.data));

                if (postsResponse.ok) {
                    const postsPayload: { data: Post[] } =
                        await postsResponse.json();
                    setPublicPosts(postsPayload.data.map(normalizePost));
                }

                setDetailError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                const fallbackPost =
                    fallbackPosts
                        .map(normalizePost)
                        .find((item) => item.slug === slug) ?? null;
                setPost(fallbackPost);
                setPublicPosts(
                    fallbackPosts
                        .map(normalizePost)
                        .filter(
                            (item) =>
                                !item.deleted &&
                                item.status === "published" &&
                                item.visibility === "public",
                        ),
                );
                setDetailError("这篇文章暂时无法加载，当前展示的是本地示例内容。");
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
        () => buildCategoryItems(publicPosts),
        [publicPosts],
    );
    const tagItems = useMemo(() => buildTagItems(publicPosts), [publicPosts]);

    return (
        <BlogFrame
            leftAside={<BlogSidebar categories={categoryItems} tags={tagItems} />}
            main={
                <>
                    {detailError ? (
                        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {detailError}
                        </div>
                    ) : null}

                    {post ? (
                        <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_12px_28px_rgba(96,121,148,0.12)]">
                            <div className="border-b border-slate-100 px-6 py-5 md:px-8">
                                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
                                    <span className="inline-flex items-center gap-2">
                                        ◫ {Math.max(post.readingTime * 285, 854)} words
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        ◌ {post.readingTime} minutes
                                    </span>
                                </div>

                                <h1 className="mt-5 flex items-center gap-3 text-[34px] font-semibold tracking-[-0.05em] text-slate-950 md:text-[44px]">
                                    <span className="inline-block h-9 w-1 rounded-full bg-sky-400" />
                                    <span>{post.title}</span>
                                </h1>

                                <div className="mt-5 flex flex-wrap items-center gap-3 text-[15px] text-slate-400">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-500">
                                        ◫ {formatDate(post.publishedAt)}
                                    </span>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-500">
                                        ◌ {post.category?.name ?? "未分类"}
                                    </span>
                                    {(post.tags ?? []).map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
                                        >
                                            # {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="px-6 py-8 md:px-8">
                                <div className="mb-8 overflow-hidden rounded-[24px]">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="h-[260px] w-full object-cover"
                                    />
                                </div>

                                <MarkdownContent content={post.content} />
                            </div>
                        </article>
                    ) : (
                        <div className="rounded-[28px] bg-white px-5 py-6 text-sm text-slate-500 shadow-[0_10px_28px_rgba(96,121,148,0.10)]">
                            {detailLoading ? "正在加载文章..." : "暂时没有找到这篇文章。"}
                        </div>
                    )}
                </>
            }
        />
    );
}
