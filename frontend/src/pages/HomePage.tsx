import { useEffect, useMemo, useState } from "react";

import { BlogFrame } from "../components/blog/BlogFrame.tsx";
import { BlogSidebar } from "../components/blog/BlogSidebar.tsx";
import { PostListCard } from "../components/blog/PostListCard.tsx";
import { fallbackPosts } from "../data/fallbackPosts.ts";
import { normalizePost } from "../lib/post.ts";
import type { Post } from "../types/post.ts";

type HomePageProps = {
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

export function HomePage({ apiBaseUrl }: HomePageProps) {
    const [posts, setPosts] = useState<Post[]>(() =>
        fallbackPosts
            .map(normalizePost)
            .filter(
                (post) =>
                    !post.deleted &&
                    post.status === "published" &&
                    post.visibility === "public",
            ),
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadPosts = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/api/posts`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload: { data: Post[] } = await response.json();
                setPosts(payload.data.map(normalizePost));
                setError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setPosts(
                    fallbackPosts
                        .map(normalizePost)
                        .filter(
                            (post) =>
                                !post.deleted &&
                                post.status === "published" &&
                                post.visibility === "public",
                        ),
                );
                setError("后端暂时未连接，当前展示的是本地示例内容。");
            } finally {
                setLoading(false);
            }
        };

        void loadPosts();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl]);

    const categoryItems = useMemo(() => buildCategoryItems(posts), [posts]);
    const tagItems = useMemo(() => buildTagItems(posts), [posts]);

    return (
        <BlogFrame
            leftAside={
                <BlogSidebar categories={categoryItems} tags={tagItems} />
            }
            main={
                <>
                    {error ? (
                        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            {error}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="rounded-[28px] bg-white px-5 py-6 text-sm text-slate-500 shadow-[0_10px_28px_rgba(96,121,148,0.10)]">
                            正在同步最新文章...
                        </div>
                    ) : null}

                    <section className="space-y-5">
                        {posts.map((post) => (
                            <PostListCard key={post.id} post={post} />
                        ))}
                    </section>

                    {!loading && posts.length === 0 ? (
                        <div className="rounded-[28px] bg-white px-5 py-6 text-sm text-slate-500 shadow-[0_10px_28px_rgba(96,121,148,0.10)]">
                            暂时没有文章内容。
                        </div>
                    ) : null}
                </>
            }
        />
    );
}
