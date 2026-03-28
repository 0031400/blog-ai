import { useEffect, useMemo, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import { formatDate } from "../lib/date";
import { normalizePost } from "../lib/post.ts";
import {
    adminPostEditorPath,
    createAdminPath,
    createAdminCategoriesPath,
    createAdminPostEditorPath,
    createAdminRecyclePath,
    createAdminTagsPath,
    createHomePath,
    createPostPath,
} from "../lib/routes.ts";
import {
    type StatusFilter,
    type ViewMode,
    type VisibilityFilter,
    viewTitle,
} from "./admin/shared.ts";
import { CategoriesSection } from "./admin/components/CategoriesSection.tsx";
import { AdminLoginSection } from "./admin/components/AdminLoginSection.tsx";
import { PostEditorSection } from "./admin/components/PostEditorSection.tsx";
import { PostsSection } from "./admin/components/PostsSection.tsx";
import { TagsSection } from "./admin/components/TagsSection.tsx";
import type { Category } from "../types/category.ts";
import type { Post } from "../types/post.ts";
import type { PostFormValues } from "../types/postForm.ts";
import type { Tag } from "../types/tag.ts";

type AdminPageProps = {
    apiBaseUrl: string;
};

const createInitialValues = (): PostFormValues => ({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categoryId: "",
    tagIds: [],
    readingTime: "5",
    status: "draft",
    visibility: "public",
    pinned: false,
    allowComment: true,
    deleted: false,
    publishedAt: new Date().toISOString().slice(0, 16),
});

function formatAdminError(error: unknown, fallback: string) {
    if (!(error instanceof Error)) {
        return fallback;
    }

    if (error.message === "AUTH_REQUIRED") {
        return "登录状态已失效，请重新登录。";
    }

    return error.message || fallback;
}

export function AdminPage({ apiBaseUrl }: AdminPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [values, setValues] = useState<PostFormValues>(createInitialValues);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [visibilityFilter, setVisibilityFilter] =
        useState<VisibilityFilter>("all");
    const [submitting, setSubmitting] = useState(false);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [authError, setAuthError] = useState("");
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [categoryName, setCategoryName] = useState("");
    const [categorySlug, setCategorySlug] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
        null,
    );

    const [tagName, setTagName] = useState("");
    const [tagSlug, setTagSlug] = useState("");
    const [tagColor, setTagColor] = useState("");
    const [editingTagId, setEditingTagId] = useState<number | null>(null);

    const selectedPost = useMemo(
        () => posts.find((post) => post.id === selectedPostId) ?? null,
        [posts, selectedPostId],
    );
    const editorPostId = useMemo(() => {
        const rawPostId = searchParams.get("postId");
        if (!rawPostId) return null;

        const parsedPostId = Number(rawPostId);
        return Number.isInteger(parsedPostId) && parsedPostId > 0
            ? parsedPostId
            : null;
    }, [searchParams]);
    const editorOpen = location.pathname === adminPostEditorPath;
    const activeViewMode = useMemo<ViewMode>(() => {
        switch (location.pathname) {
            case "/admin/recycle":
                return "recycle";
            case "/admin/categories":
                return "categories";
            case "/admin/tags":
                return "tags";
            default:
                return "posts";
        }
    }, [location.pathname]);
    const slugPreview = useMemo(
        () => values.slug.trim() || "your-post-slug",
        [values.slug],
    );
    const isEditingPost = selectedPost !== null;

    const filteredPosts = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return posts.filter((post) => {
            if (activeViewMode === "posts" && post.deleted) return false;
            if (activeViewMode === "recycle" && !post.deleted) return false;
            if (statusFilter !== "all" && post.status !== statusFilter)
                return false;
            if (
                visibilityFilter !== "all" &&
                post.visibility !== visibilityFilter
            )
                return false;
            if (!normalizedKeyword) return true;

            return [
                post.title,
                post.excerpt,
                post.category?.name ?? "",
                post.slug,
                (post.tags ?? []).map((tag) => tag.name).join(" "),
            ].some((value) => value.toLowerCase().includes(normalizedKeyword));
        });
    }, [activeViewMode, keyword, posts, statusFilter, visibilityFilter]);

    const categoryUsage = useMemo(() => {
        const usage = new Map<string, number>();
        posts.forEach((post) => {
            const categoryName = post.category?.name;
            if (!categoryName) return;
            usage.set(categoryName, (usage.get(categoryName) ?? 0) + 1);
        });
        return usage;
    }, [posts]);

    const tagUsage = useMemo(() => {
        const usage = new Map<string, number>();
        posts.forEach((post) => {
            (post.tags ?? []).forEach((tag) => {
                usage.set(tag.name, (usage.get(tag.name) ?? 0) + 1);
            });
        });
        return usage;
    }, [posts]);

    const stats = useMemo(
        () => ({
            total: posts.length,
            published: posts.filter(
                (post) => !post.deleted && post.status === "published",
            ).length,
            drafts: posts.filter(
                (post) => !post.deleted && post.status === "draft",
            ).length,
            recycled: posts.filter((post) => post.deleted).length,
        }),
        [posts],
    );

    const adminFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await fetch(input, {
            ...init,
            credentials: "include",
        });

        if (response.status === 401) {
            setAuthenticated(false);
            setPosts([]);
            setCategories([]);
            setTags([]);
            setSelectedPostId(null);
            setValues(createInitialValues());
            setSuccessMessage("");
            throw new Error("AUTH_REQUIRED");
        }

        return response;
    };

    useEffect(() => {
        const controller = new AbortController();

        const checkSession = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/admin/session`,
                    {
                        credentials: "include",
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        setAuthenticated(false);
                        setAuthError("");
                        return;
                    }

                    throw new Error(
                        `Request failed with status ${response.status}`,
                    );
                }

                setAuthenticated(true);
                setAuthError("");
            } catch (fetchError) {
                if (
                    fetchError instanceof DOMException &&
                    fetchError.name === "AbortError"
                ) {
                    return;
                }

                setAuthenticated(false);
                setAuthError("管理员认证状态暂时无法确认。");
            } finally {
                setAuthChecking(false);
            }
        };

        void checkSession();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl]);

    useEffect(() => {
        if (!authenticated) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const loadData = async () => {
            setLoading(true);
            try {
                const [postsResponse, categoriesResponse, tagsResponse] =
                    await Promise.all([
                        adminFetch(`${apiBaseUrl}/api/posts?scope=admin`, {
                            signal: controller.signal,
                        }),
                        adminFetch(`${apiBaseUrl}/api/categories`, {
                            signal: controller.signal,
                        }),
                        adminFetch(`${apiBaseUrl}/api/tags`, {
                            signal: controller.signal,
                        }),
                    ]);

                if (!postsResponse.ok) {
                    throw new Error(
                        `Request failed with status ${postsResponse.status}`,
                    );
                }

                const postPayload: { data: Post[] } =
                    await postsResponse.json();
                setPosts(postPayload.data.map(normalizePost));

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

                if (
                    fetchError instanceof Error &&
                    fetchError.message === "AUTH_REQUIRED"
                ) {
                    setAuthError("登录状态已失效，请重新登录。");
                    setError("");
                    return;
                }

                setError("后台数据暂时无法加载。");
            } finally {
                setLoading(false);
            }
        };

        void loadData();

        return () => {
            controller.abort();
        };
    }, [apiBaseUrl, authenticated]);

    const fillPostForm = (
        post: Post,
        options?: { preserveMessage?: boolean },
    ) => {
        setSelectedPostId(post.id);
        setValues({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            categoryId: String(post.categoryId),
            tagIds: [...(post.tagIds ?? [])],
            readingTime: String(post.readingTime),
            status: post.status,
            visibility: post.visibility,
            pinned: post.pinned,
            allowComment: post.allowComment,
            deleted: post.deleted,
            publishedAt: new Date(post.publishedAt).toISOString().slice(0, 16),
        });
        setError("");
        if (!options?.preserveMessage) {
            setSuccessMessage("");
        }
    };

    useEffect(() => {
        if (!editorOpen) {
            setSelectedPostId(null);
            return;
        }

        if (editorPostId !== null) {
            return;
        }

        setSelectedPostId(null);
        setValues(createInitialValues());
        setError("");
    }, [activeViewMode, editorOpen, editorPostId]);

    useEffect(() => {
        if (!editorOpen || editorPostId === null) {
            return;
        }

        const post = posts.find((item) => item.id === editorPostId);
        if (post) {
            if (selectedPostId !== post.id) {
                fillPostForm(post);
            }
            return;
        }

        if (!loading) {
            setError("文章不存在或暂时无法加载。");
            navigate(createAdminPath(), { replace: true });
        }
    }, [editorOpen, editorPostId, loading, navigate, posts, selectedPostId]);

    const handleChange =
        (field: keyof PostFormValues) =>
        (
            event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >,
        ) => {
            const target = event.target;
            const nextValue =
                target instanceof HTMLInputElement && target.type === "checkbox"
                    ? target.checked
                    : target.value;

            setValues((currentValues) => {
                const nextValues = { ...currentValues, [field]: nextValue };

                if (field === "title") {
                    const autoSlug = toSlug(String(nextValue));
                    if (
                        !currentValues.slug ||
                        currentValues.slug === toSlug(currentValues.title)
                    ) {
                        nextValues.slug = autoSlug;
                    }
                }

                return nextValues;
            });
        };

    const resetPostForm = () => {
        setError("");
        navigate(createAdminPath());
    };

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoginSubmitting(true);
        setAuthError("");

        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username: username.trim(),
                    password,
                }),
            });

            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            setAuthenticated(true);
            setPassword("");
            setAuthError("");
        } catch (loginError) {
            setAuthenticated(false);
            setAuthError(
                loginError instanceof Error
                    ? loginError.message
                    : "登录失败，请稍后重试。",
            );
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleLogout = async () => {
        setBusy(true);
        setSuccessMessage("");
        setError("");

        try {
            await fetch(`${apiBaseUrl}/api/admin/logout`, {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setAuthenticated(false);
            setPassword("");
            setPosts([]);
            setCategories([]);
            setTags([]);
            setSelectedPostId(null);
            setValues(createInitialValues());
            navigate(createAdminPath());
            setBusy(false);
        }
    };

    const resetCategoryForm = () => {
        setCategoryName("");
        setCategorySlug("");
        setEditingCategoryId(null);
    };

    const resetTagForm = () => {
        setTagName("");
        setTagSlug("");
        setTagColor("");
        setEditingTagId(null);
    };

    const upsertPost = (post: Post) => {
        const normalizedPost = normalizePost(post);
        setPosts((currentPosts) => {
            const exists = currentPosts.some(
                (currentPost) => currentPost.id === normalizedPost.id,
            );
            const nextPosts = exists
                ? currentPosts.map((currentPost) =>
                      currentPost.id === normalizedPost.id
                          ? normalizedPost
                          : currentPost,
                  )
                : [normalizedPost, ...currentPosts];

            return nextPosts.sort(
                (left, right) =>
                    new Date(right.publishedAt).getTime() -
                    new Date(left.publishedAt).getTime(),
            );
        });
    };

    const openCreateEditor = () => {
        setError("");
        setSuccessMessage("");
        navigate(createAdminPostEditorPath());
    };

    const openEditEditor = (
        post: Post,
        options?: { preserveMessage?: boolean },
    ) => {
        fillPostForm(post, options);
        navigate(createAdminPostEditorPath(post.id));
    };

    const buildPostPayload = () => ({
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        coverImage: values.coverImage,
        categoryId: Number(values.categoryId),
        tagIds: values.tagIds,
        readingTime: Number(values.readingTime),
        status: values.status,
        visibility: values.visibility,
        pinned: values.pinned,
        allowComment: values.allowComment,
        deleted: values.deleted,
        publishedAt: new Date(values.publishedAt).toISOString(),
    });

    const buildPostPayloadFromPost = (
        post: Post,
        patch: Partial<Post> = {},
    ) => {
        const nextPost = { ...post, ...patch };

        return {
            title: nextPost.title,
            slug: nextPost.slug,
            excerpt: nextPost.excerpt,
            content: nextPost.content,
            coverImage: nextPost.coverImage,
            categoryId: nextPost.categoryId,
            tagIds: nextPost.tagIds,
            readingTime: nextPost.readingTime,
            status: nextPost.status,
            visibility: nextPost.visibility,
            pinned: nextPost.pinned,
            allowComment: nextPost.allowComment,
            deleted: nextPost.deleted,
            publishedAt: new Date(nextPost.publishedAt).toISOString(),
        };
    };

    const toggleTagSelection = (tagId: number) => {
        setValues((currentValues) => ({
            ...currentValues,
            tagIds: currentValues.tagIds.includes(tagId)
                ? currentValues.tagIds.filter(
                      (currentTagId) => currentTagId !== tagId,
                  )
                : [...currentValues.tagIds, tagId],
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const endpoint = isEditingPost
                ? `${apiBaseUrl}/api/posts/${selectedPost.id}`
                : `${apiBaseUrl}/api/posts`;
            const response = await adminFetch(endpoint, {
                method: isEditingPost ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPostPayload()),
            });

            const payload = (await response.json()) as {
                data?: Post;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            if (isEditingPost) {
                upsertPost(payload.data);
                setSuccessMessage("文章已更新。");
            } else {
                upsertPost(payload.data);
                setSuccessMessage("文章已创建。");
            }

            fillPostForm(payload.data, { preserveMessage: true });
            navigate(createAdminPostEditorPath(payload.data.id), {
                replace: true,
            });
        } catch (submitError) {
            setError(formatAdminError(submitError, "提交失败，请稍后重试。"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleSoftDelete = async (post: Post) => {
        if (!window.confirm(`确认将《${post.title}》移入回收站吗？`)) return;
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await adminFetch(
                `${apiBaseUrl}/api/posts/${post.id}`,
                {
                    method: "DELETE",
                },
            );
            const payload = (await response.json()) as {
                data?: Post;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }
            upsertPost(payload.data);
            if (selectedPostId === post.id) {
                resetPostForm();
            }
            setSuccessMessage("文章已移入回收站。");
        } catch (deleteError) {
            setError(formatAdminError(deleteError, "删除失败，请稍后重试。"));
        } finally {
            setBusy(false);
        }
    };

    const handleRestore = async (post: Post) => {
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await adminFetch(
                `${apiBaseUrl}/api/posts/${post.id}/restore`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deleted: false }),
                },
            );
            const payload = (await response.json()) as {
                data?: Post;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }
            upsertPost(payload.data);
            setSuccessMessage("文章已恢复。");
        } catch (restoreError) {
            setError(formatAdminError(restoreError, "恢复失败，请稍后重试。"));
        } finally {
            setBusy(false);
        }
    };

    const quickUpdatePost = async (
        post: Post,
        patch: Partial<Post>,
        successText: string,
    ) => {
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await adminFetch(
                `${apiBaseUrl}/api/posts/${post.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(buildPostPayloadFromPost(post, patch)),
                },
            );
            const payload = (await response.json()) as {
                data?: Post;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }
            upsertPost(payload.data);
            if (selectedPostId === post.id) {
                fillPostForm(payload.data, { preserveMessage: true });
            }
            setSuccessMessage(successText);
        } catch (updateError) {
            setError(formatAdminError(updateError, "更新失败，请稍后重试。"));
        } finally {
            setBusy(false);
        }
    };

    const submitCategory = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await adminFetch(
                editingCategoryId
                    ? `${apiBaseUrl}/api/categories/${editingCategoryId}`
                    : `${apiBaseUrl}/api/categories`,
                {
                    method: editingCategoryId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: categoryName,
                        slug: categorySlug || toSlug(categoryName),
                        description: "",
                    }),
                },
            );
            const payload = (await response.json()) as {
                data?: Category;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            const nextCategory = payload.data;
            setCategories((current) =>
                editingCategoryId
                    ? current.map((item) =>
                          item.id === nextCategory.id ? nextCategory : item,
                      )
                    : [...current, nextCategory].sort((a, b) =>
                          a.name.localeCompare(b.name),
                      ),
            );
            setSuccessMessage(
                editingCategoryId ? "分类已更新。" : "分类已创建。",
            );
            resetCategoryForm();
        } catch (submitError) {
            setError(formatAdminError(submitError, "分类保存失败。"));
        } finally {
            setBusy(false);
        }
    };

    const submitTag = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await adminFetch(
                editingTagId
                    ? `${apiBaseUrl}/api/tags/${editingTagId}`
                    : `${apiBaseUrl}/api/tags`,
                {
                    method: editingTagId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: tagName,
                        slug: tagSlug || toSlug(tagName),
                        color: tagColor,
                    }),
                },
            );
            const payload = (await response.json()) as {
                data?: Tag;
                error?: string;
            };
            if (!response.ok || !payload.data) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            const nextTag = payload.data;
            setTags((current) =>
                editingTagId
                    ? current.map((item) =>
                          item.id === nextTag.id ? nextTag : item,
                      )
                    : [...current, nextTag].sort((a, b) =>
                          a.name.localeCompare(b.name),
                      ),
            );
            setSuccessMessage(editingTagId ? "标签已更新。" : "标签已创建。");
            resetTagForm();
        } catch (submitError) {
            setError(formatAdminError(submitError, "标签保存失败。"));
        } finally {
            setBusy(false);
        }
    };

    const deleteCategory = async (category: Category) => {
        if (!window.confirm(`确认删除分类「${category.name}」吗？`)) return;
        setBusy(true);
        setError("");
        setSuccessMessage("");
        try {
            const response = await adminFetch(
                `${apiBaseUrl}/api/categories/${category.id}`,
                { method: "DELETE" },
            );
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }
            setCategories((current) =>
                current.filter((item) => item.id !== category.id),
            );
            setSuccessMessage("分类已删除。");
        } catch (deleteError) {
            setError(formatAdminError(deleteError, "分类删除失败。"));
        } finally {
            setBusy(false);
        }
    };

    const deleteTag = async (tag: Tag) => {
        if (!window.confirm(`确认删除标签「${tag.name}」吗？`)) return;
        setBusy(true);
        setError("");
        setSuccessMessage("");
        try {
            const response = await adminFetch(
                `${apiBaseUrl}/api/tags/${tag.id}`,
                {
                    method: "DELETE",
                },
            );
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }
            setTags((current) => current.filter((item) => item.id !== tag.id));
            setSuccessMessage("标签已删除。");
        } catch (deleteError) {
            setError(formatAdminError(deleteError, "标签删除失败。"));
        } finally {
            setBusy(false);
        }
    };

    if (authChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 text-sm text-slate-500">
                正在检查管理员登录状态...
            </div>
        );
    }

    if (!authenticated) {
        return (
            <AdminLoginSection
                error={authError}
                onSubmit={handleLogin}
                password={password}
                setPassword={setPassword}
                setUsername={setUsername}
                submitting={loginSubmitting}
                username={username}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
                <div className="px-5 py-5">
                    <Link
                        to={createHomePath()}
                        className="text-[28px] font-semibold tracking-[-0.05em] text-slate-900"
                    >
                        blog-ai
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        Console
                    </p>
                </div>

                <nav className="mt-4 px-3">
                    <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Content
                    </div>
                    {[
                        ["posts", "文章", createAdminPath()],
                        ["recycle", "回收站", createAdminRecyclePath()],
                        ["categories", "分类", createAdminCategoriesPath()],
                        ["tags", "标签", createAdminTagsPath()],
                    ].map(([key, label, path]) => (
                        <Link
                            key={key}
                            to={path}
                            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                activeViewMode === key
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <span>▣</span>
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            <main className="md:ml-64">
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
                    <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm text-slate-500">
                                Contents / Management
                            </div>
                            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
                                {viewTitle(
                                    editorOpen ? "posts" : activeViewMode,
                                )}
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={createHomePath()}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                            >
                                返回首页
                            </Link>
                            {selectedPost ? (
                                <Link
                                    to={createPostPath(selectedPost.slug)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                                >
                                    预览文章
                                </Link>
                            ) : null}
                            <button
                                type="button"
                                onClick={openCreateEditor}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                            >
                                新建文章
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                            >
                                退出登录
                            </button>
                        </div>
                    </header>

                    <section className="mt-4 grid gap-3 md:grid-cols-4">
                        {[
                            ["总文章", `${stats.total}`],
                            ["已发布", `${stats.published}`],
                            ["草稿", `${stats.drafts}`],
                            ["回收站", `${stats.recycled}`],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                    {label}
                                </div>
                                <div className="mt-2 text-lg font-semibold text-slate-900">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </section>

                    {error ? (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}
                    {successMessage ? (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {successMessage}
                        </div>
                    ) : null}
                    {loading ? (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-4 text-sm text-slate-500 shadow-sm">
                            正在加载后台内容...
                        </div>
                    ) : null}

                    {editorOpen ? (
                        <PostEditorSection
                            busy={busy}
                            categories={categories}
                            handleChange={handleChange}
                            handleSoftDelete={handleSoftDelete}
                            isEditingPost={isEditingPost}
                            resetPostForm={resetPostForm}
                            selectedPost={selectedPost}
                            slugPreview={slugPreview}
                            submitting={submitting}
                            tags={tags}
                            toggleTagSelection={toggleTagSelection}
                            values={values}
                            onSubmit={handleSubmit}
                        />
                    ) : null}

                    {!editorOpen &&
                        (activeViewMode === "posts" ||
                            activeViewMode === "recycle") && (
                            <PostsSection
                                busy={busy}
                                filteredPosts={filteredPosts}
                                formatPostDate={formatDate}
                                handleRestore={handleRestore}
                                handleSoftDelete={handleSoftDelete}
                                keyword={keyword}
                                openEditEditor={openEditEditor}
                                quickUpdatePost={quickUpdatePost}
                                setKeyword={setKeyword}
                                setStatusFilter={setStatusFilter}
                                setVisibilityFilter={setVisibilityFilter}
                                statusFilter={statusFilter}
                                viewMode={activeViewMode}
                                visibilityFilter={visibilityFilter}
                            />
                        )}

                    {!editorOpen && activeViewMode === "categories" && (
                        <CategoriesSection
                            busy={busy}
                            categories={categories}
                            categoryName={categoryName}
                            categorySlug={categorySlug}
                            categoryUsage={categoryUsage}
                            deleteCategory={deleteCategory}
                            editingCategoryId={editingCategoryId}
                            resetCategoryForm={resetCategoryForm}
                            setCategoryName={setCategoryName}
                            setCategorySlug={setCategorySlug}
                            setEditingCategoryId={setEditingCategoryId}
                            submitCategory={submitCategory}
                        />
                    )}

                    {!editorOpen && activeViewMode === "tags" && (
                        <TagsSection
                            busy={busy}
                            deleteTag={deleteTag}
                            editingTagId={editingTagId}
                            resetTagForm={resetTagForm}
                            setEditingTagId={setEditingTagId}
                            setTagColor={setTagColor}
                            setTagName={setTagName}
                            setTagSlug={setTagSlug}
                            submitTag={submitTag}
                            tagColor={tagColor}
                            tagName={tagName}
                            tagSlug={tagSlug}
                            tagUsage={tagUsage}
                            tags={tags}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
