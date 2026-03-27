import { useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { fallbackPosts } from "./data/fallbackPosts";
import { getPostSlugFromHash, isAdminRoute } from "./lib/hashRoute";
import { AdminPage, HomePage, PostDetailPage } from "./pages";
import { blogTheme } from "./theme/blogTheme";
import type { Post } from "./types/post";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function normalizePost(post: Post): Post {
    return {
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        status: post.status ?? "draft",
        visibility: post.visibility ?? "public",
        pinned: Boolean(post.pinned),
        allowComment: post.allowComment ?? true,
        deleted: Boolean(post.deleted),
    };
}

function App() {
    const [posts, setPosts] = useState<Post[]>(() =>
        fallbackPosts.map(normalizePost),
    );
    const [activeSlug, setActiveSlug] = useState(() =>
        getPostSlugFromHash(window.location.hash),
    );
    const [isAdminView, setIsAdminView] = useState(() =>
        isAdminRoute(window.location.hash),
    );
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [detailError, setDetailError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const loadPosts = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/posts?scope=admin`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Request failed with status ${response.status}`,
                    );
                }

                const payload: { data: Post[] } = await response.json();
                if (payload.data.length > 0) {
                    setPosts(payload.data.map(normalizePost));
                }
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

        void loadPosts();

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const syncFromHash = () => {
            setActiveSlug(getPostSlugFromHash(window.location.hash));
            setIsAdminView(isAdminRoute(window.location.hash));
        };

        window.addEventListener("hashchange", syncFromHash);
        return () => {
            window.removeEventListener("hashchange", syncFromHash);
        };
    }, []);

    useEffect(() => {
        if (!activeSlug) {
            setActivePost(null);
            setDetailError("");
            return;
        }

        const cachedPost = posts.find(
            (post) =>
                post.slug === activeSlug &&
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
                const response = await fetch(
                    `${apiBaseUrl}/api/posts/${activeSlug}`,
                    {
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Request failed with status ${response.status}`,
                    );
                }

                const payload: { data: Post } = await response.json();
                setActivePost(payload.data);
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
    }, [activeSlug, posts]);

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
        setActivePost(normalizedPost);
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
        setActivePost((currentPost) =>
            currentPost?.id === normalizedPost.id
                ? normalizedPost
                : currentPost,
        );
    };

    return (
        <ThemeProvider theme={blogTheme}>
            <CssBaseline />
            {isAdminView ? (
                <AdminPage
                    apiBaseUrl={apiBaseUrl}
                    onPostCreated={handlePostCreated}
                    onPostUpdated={handlePostUpdated}
                    posts={posts}
                />
            ) : activeSlug ? (
                <PostDetailPage
                    detailError={detailError}
                    detailLoading={detailLoading}
                    post={activePost}
                />
            ) : (
                <HomePage
                    error={error}
                    featuredPost={featuredPost}
                    latestPosts={latestPosts}
                    loading={loading}
                />
            )}
        </ThemeProvider>
    );
}

export default App;
