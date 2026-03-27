import { useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { fallbackPosts } from "./data/fallbackPosts";
import { getPostSlugFromHash, isAdminRoute } from "./lib/hashRoute";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { blogTheme } from "./theme/blogTheme";
import type { Post } from "./types/post";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

function App() {
    const [posts, setPosts] = useState<Post[]>(fallbackPosts);
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
                const response = await fetch(`${apiBaseUrl}/api/posts`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Request failed with status ${response.status}`,
                    );
                }

                const payload: { data: Post[] } = await response.json();
                if (payload.data.length > 0) {
                    setPosts(payload.data);
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

        const cachedPost = posts.find((post) => post.slug === activeSlug);
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

    const featuredPost = posts[0];
    const latestPosts = useMemo(() => posts.slice(1), [posts]);

    const handlePostCreated = (post: Post) => {
        setPosts((currentPosts) => [
            post,
            ...currentPosts.filter(
                (currentPost) => currentPost.slug !== post.slug,
            ),
        ]);
        setActivePost(post);
    };

    const handlePostUpdated = (post: Post) => {
        setPosts((currentPosts) =>
            currentPosts
                .map((currentPost) =>
                    currentPost.id === post.id ? post : currentPost,
                )
                .sort(
                    (left, right) =>
                        new Date(right.publishedAt).getTime() -
                        new Date(left.publishedAt).getTime(),
                ),
        );
        setActivePost((currentPost) =>
            currentPost?.id === post.id ? post : currentPost,
        );
    };

    const handlePostDeleted = (postId: number) => {
        setPosts((currentPosts) =>
            currentPosts.filter((currentPost) => currentPost.id !== postId),
        );
        setActivePost((currentPost) =>
            currentPost?.id === postId ? null : currentPost,
        );
    };

    return (
        <ThemeProvider theme={blogTheme}>
            <CssBaseline />
            {isAdminView ? (
                <AdminPage
                    apiBaseUrl={apiBaseUrl}
                    onPostCreated={handlePostCreated}
                    onPostDeleted={handlePostDeleted}
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
