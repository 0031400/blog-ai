import { useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { fallbackPosts } from "./data/fallbackPosts.ts";
import { AdminPage, HomePage, PostDetailPage } from "./pages";
import { blogTheme } from "./theme/blogTheme";
import type { Category } from "./types/category.ts";
import type { Post } from "./types/post.ts";
import type { Tag } from "./types/tag.ts";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function normalizePost(post: Post): Post {
    const normalizedTags = Array.isArray(post.tags) ? post.tags : [];

    return {
        ...post,
        categoryId: Number(post.categoryId ?? post.category?.id ?? 0),
        category: post.category ?? null,
        tagIds: Array.isArray(post.tagIds)
            ? post.tagIds
            : normalizedTags.map((tag) => tag.id),
        tags: normalizedTags,
        status: post.status ?? "draft",
        visibility: post.visibility ?? "public",
        pinned: Boolean(post.pinned),
        allowComment: post.allowComment ?? true,
        deleted: Boolean(post.deleted),
    };
}

function PostDetailRoute({
    apiBaseUrl,
    posts,
}: {
    apiBaseUrl: string;
    posts: Post[];
}) {
    const { slug = "" } = useParams();
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    useEffect(() => {
        if (!slug) {
            setActivePost(null);
            setDetailError("");
            return;
        }

        const cachedPost = posts.find(
            (post) =>
                post.slug === slug &&
                !post.deleted &&
                post.status === "published" &&
                post.visibility === "public",
        );
        if (cachedPost) {
            setActivePost(cachedPost);
        }

        const controller = new AbortController();

        const loadPost = async () => {
            setDetailLoading(true);

            try {
                const response = await fetch(`${apiBaseUrl}/api/posts/${slug}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload: { data: Post } = await response.json();
                setActivePost(normalizePost(payload.data));
                setDetailError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                if (!cachedPost) {
                    setDetailError("这篇文章暂时无法加载。");
                }
            } finally {
                setDetailLoading(false);
            }
        };

        void loadPost();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl, posts, slug]);

    return (
        <PostDetailPage
            detailError={detailError}
            detailLoading={detailLoading}
            post={activePost}
        />
    );
}

function App() {
    const [posts, setPosts] = useState<Post[]>(() =>
        fallbackPosts.map(normalizePost),
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadData = async () => {
            try {
                const [postsResponse, categoriesResponse, tagsResponse] =
                    await Promise.all([
                        fetch(`${apiBaseUrl}/api/posts?scope=admin`, {
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

                const payload: { data: Post[] } = await postsResponse.json();
                setPosts(payload.data.map(normalizePost));
                setError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setError("后端暂时未连接，当前展示的是本地示例内容。");
            } finally {
                setLoading(false);
            }
        };

        void loadData();

        return () => {
            controller.abort();
        };
    }, []);

    const publicPosts = useMemo(
        () =>
            posts.filter(
                (post) =>
                    !post.deleted &&
                    post.status === "published" &&
                    post.visibility === "public",
            ),
        [posts],
    );

    const featuredPost = publicPosts[0];
    const latestPosts = useMemo(() => publicPosts.slice(1), [publicPosts]);

    const handlePostCreated = (post: Post) => {
        const normalizedPost = normalizePost(post);
        setPosts((currentPosts) => [
            normalizedPost,
            ...currentPosts.filter(
                (currentPost) => currentPost.slug !== normalizedPost.slug,
            ),
        ]);
    };

    const handlePostUpdated = (post: Post) => {
        const normalizedPost = normalizePost(post);
        setPosts((currentPosts) =>
            currentPosts
                .map((currentPost) =>
                    currentPost.id === normalizedPost.id
                        ? normalizedPost
                        : currentPost,
                )
                .sort(
                    (left, right) =>
                        new Date(right.publishedAt).getTime() -
                        new Date(left.publishedAt).getTime(),
                ),
        );
    };

    return (
        <ThemeProvider theme={blogTheme}>
            <CssBaseline />
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            error={error}
                            featuredPost={featuredPost}
                            latestPosts={latestPosts}
                            loading={loading}
                        />
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <AdminPage
                            apiBaseUrl={apiBaseUrl}
                            categories={categories}
                            onPostCreated={handlePostCreated}
                            onPostUpdated={handlePostUpdated}
                            posts={posts}
                            setCategories={setCategories}
                            setTags={setTags}
                            tags={tags}
                        />
                    }
                />
                <Route
                    path="/posts/:slug"
                    element={<PostDetailRoute apiBaseUrl={apiBaseUrl} posts={posts} />}
                />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </ThemeProvider>
    );
}

export default App;
