import {
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react";

import { formatDate } from "../lib/date";
import { createHomeHref, createPostHref } from "../lib/hashRoute";
import type { Category } from "../types/category.ts";
import type { Post } from "../types/post.ts";
import type { PostFormValues } from "../types/postForm.ts";
import type { Tag } from "../types/tag.ts";

type AdminPageProps = {
    apiBaseUrl: string;
    categories: Category[];
    onPostCreated: (post: Post) => void;
    onPostUpdated: (post: Post) => void;
    posts: Post[];
    setCategories: Dispatch<SetStateAction<Category[]>>;
    setTags: Dispatch<SetStateAction<Tag[]>>;
    tags: Tag[];
};

type ViewMode = "posts" | "recycle" | "categories" | "tags";
type StatusFilter = "all" | "draft" | "published";
type VisibilityFilter = "all" | "public" | "private";

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

export function AdminPage({
    apiBaseUrl,
    categories,
    onPostCreated,
    onPostUpdated,
    posts,
    setCategories,
    setTags,
    tags,
}: AdminPageProps) {
    const [values, setValues] = useState<PostFormValues>(createInitialValues);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("posts");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [visibilityFilter, setVisibilityFilter] =
        useState<VisibilityFilter>("all");
    const [submitting, setSubmitting] = useState(false);
    const [busy, setBusy] = useState(false);
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
    const slugPreview = useMemo(
        () => values.slug.trim() || "your-post-slug",
        [values.slug],
    );
    const isEditingPost = selectedPost !== null;

    const filteredPosts = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return posts.filter((post) => {
            if (viewMode === "posts" && post.deleted) return false;
            if (viewMode === "recycle" && !post.deleted) return false;
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
    }, [keyword, posts, statusFilter, viewMode, visibilityFilter]);

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

    useEffect(() => {
        if (!selectedPost && selectedPostId !== null) {
            resetPostForm();
        }
    }, [selectedPost, selectedPostId]);

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
        setSelectedPostId(null);
        setValues(createInitialValues());
        setEditorOpen(false);
        setError("");
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

    const openCreateEditor = () => {
        setValues(createInitialValues());
        setSelectedPostId(null);
        setEditorOpen(true);
        setError("");
        setSuccessMessage("");
        setViewMode("posts");
    };

    const openEditEditor = (
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
        setEditorOpen(true);
        setViewMode(post.deleted ? "recycle" : "posts");
        setError("");
        if (!options?.preserveMessage) {
            setSuccessMessage("");
        }
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
            const response = await fetch(endpoint, {
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
                onPostUpdated(payload.data);
                setSuccessMessage("文章已更新。");
            } else {
                onPostCreated(payload.data);
                setSuccessMessage("文章已创建。");
            }

            openEditEditor(payload.data, { preserveMessage: true });
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "提交失败，请稍后重试。",
            );
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
            const response = await fetch(`${apiBaseUrl}/api/posts/${post.id}`, {
                method: "DELETE",
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
            onPostUpdated(payload.data);
            if (selectedPostId === post.id) {
                resetPostForm();
            }
            setSuccessMessage("文章已移入回收站。");
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "删除失败，请稍后重试。",
            );
        } finally {
            setBusy(false);
        }
    };

    const handleRestore = async (post: Post) => {
        setBusy(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
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
            onPostUpdated(payload.data);
            setSuccessMessage("文章已恢复。");
        } catch (restoreError) {
            setError(
                restoreError instanceof Error
                    ? restoreError.message
                    : "恢复失败，请稍后重试。",
            );
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
            const response = await fetch(`${apiBaseUrl}/api/posts/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPostPayloadFromPost(post, patch)),
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
            onPostUpdated(payload.data);
            if (selectedPostId === post.id) {
                openEditEditor(payload.data, { preserveMessage: true });
            }
            setSuccessMessage(successText);
        } catch (updateError) {
            setError(
                updateError instanceof Error
                    ? updateError.message
                    : "更新失败，请稍后重试。",
            );
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
            const response = await fetch(
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
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "分类保存失败。",
            );
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
            const response = await fetch(
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
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "标签保存失败。",
            );
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
            const response = await fetch(
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
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "分类删除失败。",
            );
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
            const response = await fetch(`${apiBaseUrl}/api/tags/${tag.id}`, {
                method: "DELETE",
            });
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
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "标签删除失败。",
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
                <div className="px-5 py-5">
                    <a
                        href={createHomeHref()}
                        className="text-[28px] font-semibold tracking-[-0.05em] text-slate-900"
                    >
                        blog-ai
                    </a>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        Console
                    </p>
                </div>

                <nav className="mt-4 px-3">
                    <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Content
                    </div>
                    {[
                        ["posts", "文章"],
                        ["recycle", "回收站"],
                        ["categories", "分类"],
                        ["tags", "标签"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setViewMode(key as ViewMode)}
                            className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                viewMode === key
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            <span>▣</span>
                            <span>{label}</span>
                        </button>
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
                                {viewTitle(viewMode)}
                            </h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={createHomeHref()}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                            >
                                返回首页
                            </a>
                            {selectedPost ? (
                                <a
                                    href={createPostHref(selectedPost.slug)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                                >
                                    预览文章
                                </a>
                            ) : null}
                            <button
                                type="button"
                                onClick={openCreateEditor}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                            >
                                新建文章
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

                    {editorOpen ? (
                        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="text-sm font-medium text-slate-900">
                                        {isEditingPost
                                            ? "编辑文章"
                                            : "新建文章"}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        Slug 预览：`/#/posts/{slugPreview}`
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetPostForm}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                >
                                    关闭编辑器
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 px-4 py-4"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="标题">
                                        <input
                                            value={values.title}
                                            onChange={handleChange("title")}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="Slug">
                                        <input
                                            value={values.slug}
                                            onChange={handleChange("slug")}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="摘要">
                                        <textarea
                                            value={values.excerpt}
                                            onChange={handleChange("excerpt")}
                                            required
                                            rows={3}
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="封面图 URL">
                                        <input
                                            value={values.coverImage}
                                            onChange={handleChange(
                                                "coverImage",
                                            )}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>

                                <Field label="正文">
                                    <textarea
                                        value={values.content}
                                        onChange={handleChange("content")}
                                        required
                                        rows={10}
                                        className={inputClass}
                                    />
                                </Field>

                                <div className="grid gap-4 md:grid-cols-4">
                                    <Field label="分类">
                                        <select
                                            value={values.categoryId}
                                            onChange={handleChange(
                                                "categoryId",
                                            )}
                                            className={inputClass}
                                        >
                                            <option value="">选择分类</option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="标签">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            {tags.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {tags.map((tag) => {
                                                        const selected =
                                                            values.tagIds.includes(
                                                                tag.id,
                                                            );

                                                        return (
                                                            <button
                                                                key={tag.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleTagSelection(
                                                                        tag.id,
                                                                    )
                                                                }
                                                                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                                                    selected
                                                                        ? "border-slate-900 bg-slate-900 text-white"
                                                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                                                }`}
                                                            >
                                                                #{tag.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-500">
                                                    还没有可用标签，请先去“标签”里创建。
                                                </div>
                                            )}
                                        </div>
                                    </Field>
                                    <Field label="阅读时长">
                                        <input
                                            min="1"
                                            type="number"
                                            value={values.readingTime}
                                            onChange={handleChange(
                                                "readingTime",
                                            )}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="发布时间">
                                        <input
                                            type="datetime-local"
                                            value={values.publishedAt}
                                            onChange={handleChange(
                                                "publishedAt",
                                            )}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="发布状态">
                                        <select
                                            value={values.status}
                                            onChange={handleChange("status")}
                                            className={inputClass}
                                        >
                                            <option value="draft">草稿</option>
                                            <option value="published">
                                                已发布
                                            </option>
                                        </select>
                                    </Field>
                                    <Field label="可见性">
                                        <select
                                            value={values.visibility}
                                            onChange={handleChange(
                                                "visibility",
                                            )}
                                            className={inputClass}
                                        >
                                            <option value="public">公开</option>
                                            <option value="private">
                                                私密
                                            </option>
                                        </select>
                                    </Field>
                                </div>

                                <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 px-4 py-3">
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={values.pinned}
                                            onChange={handleChange("pinned")}
                                        />
                                        <span>置顶文章</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={values.allowComment}
                                            onChange={handleChange(
                                                "allowComment",
                                            )}
                                        />
                                        <span>允许评论</span>
                                    </label>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        disabled={submitting || busy}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                                    >
                                        {submitting
                                            ? "提交中..."
                                            : isEditingPost
                                              ? "保存修改"
                                              : "创建文章"}
                                    </button>
                                    {isEditingPost && !selectedPost?.deleted ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                selectedPost &&
                                                handleSoftDelete(selectedPost)
                                            }
                                            disabled={busy}
                                            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 disabled:opacity-60"
                                        >
                                            移入回收站
                                        </button>
                                    ) : null}
                                </div>
                            </form>
                        </section>
                    ) : null}

                    {(viewMode === "posts" || viewMode === "recycle") && (
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
                            viewMode={viewMode}
                            visibilityFilter={visibilityFilter}
                        />
                    )}

                    {viewMode === "categories" && (
                        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <TaxonomyFormCard
                                title={
                                    editingCategoryId ? "编辑分类" : "新建分类"
                                }
                            >
                                <form
                                    onSubmit={submitCategory}
                                    className="space-y-4"
                                >
                                    <Field label="名称">
                                        <input
                                            value={categoryName}
                                            onChange={(event) =>
                                                setCategoryName(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                    <Field label="Slug">
                                        <input
                                            value={categorySlug}
                                            onChange={(event) =>
                                                setCategorySlug(
                                                    event.target.value,
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </Field>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={busy}
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                                        >
                                            保存
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetCategoryForm}
                                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                        >
                                            重置
                                        </button>
                                    </div>
                                </form>
                            </TaxonomyFormCard>

                            <TaxonomyListCard title="分类列表">
                                {categories.map((category) => (
                                    <TaxonomyRow
                                        key={category.id}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(
                                                            category.id,
                                                        );
                                                        setCategoryName(
                                                            category.name,
                                                        );
                                                        setCategorySlug(
                                                            category.slug,
                                                        );
                                                    }}
                                                    className={
                                                        secondaryButtonClass
                                                    }
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteCategory(category)
                                                    }
                                                    className={
                                                        dangerButtonClass
                                                    }
                                                >
                                                    删除
                                                </button>
                                            </>
                                        }
                                        meta={`使用文章 ${
                                            categoryUsage.get(category.name) ??
                                            0
                                        } 篇`}
                                        title={category.name}
                                    />
                                ))}
                            </TaxonomyListCard>
                        </section>
                    )}

                    {viewMode === "tags" && (
                        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <TaxonomyFormCard
                                title={editingTagId ? "编辑标签" : "新建标签"}
                            >
                                <form
                                    onSubmit={submitTag}
                                    className="space-y-4"
                                >
                                    <Field label="名称">
                                        <input
                                            value={tagName}
                                            onChange={(event) =>
                                                setTagName(event.target.value)
                                            }
                                            className={inputClass}
                                            required
                                        />
                                    </Field>
                                    <Field label="Slug">
                                        <input
                                            value={tagSlug}
                                            onChange={(event) =>
                                                setTagSlug(event.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="颜色">
                                        <input
                                            value={tagColor}
                                            onChange={(event) =>
                                                setTagColor(event.target.value)
                                            }
                                            className={inputClass}
                                            placeholder="#0f172a"
                                        />
                                    </Field>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={busy}
                                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                                        >
                                            保存
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetTagForm}
                                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600"
                                        >
                                            重置
                                        </button>
                                    </div>
                                </form>
                            </TaxonomyFormCard>

                            <TaxonomyListCard title="标签列表">
                                {tags.map((tag) => (
                                    <TaxonomyRow
                                        key={tag.id}
                                        actions={
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingTagId(tag.id);
                                                        setTagName(tag.name);
                                                        setTagSlug(tag.slug);
                                                        setTagColor(tag.color);
                                                    }}
                                                    className={
                                                        secondaryButtonClass
                                                    }
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteTag(tag)
                                                    }
                                                    className={
                                                        dangerButtonClass
                                                    }
                                                >
                                                    删除
                                                </button>
                                            </>
                                        }
                                        meta={`使用文章 ${
                                            tagUsage.get(tag.name) ?? 0
                                        } 篇`}
                                        swatch={tag.color}
                                        title={tag.name}
                                    />
                                ))}
                            </TaxonomyListCard>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

function PostsSection({
    busy,
    filteredPosts,
    formatPostDate,
    handleRestore,
    handleSoftDelete,
    keyword,
    openEditEditor,
    quickUpdatePost,
    setKeyword,
    setStatusFilter,
    setVisibilityFilter,
    statusFilter,
    viewMode,
    visibilityFilter,
}: {
    busy: boolean;
    filteredPosts: Post[];
    formatPostDate: (value: string) => string;
    handleRestore: (post: Post) => Promise<void>;
    handleSoftDelete: (post: Post) => Promise<void>;
    keyword: string;
    openEditEditor: (post: Post) => void;
    quickUpdatePost: (
        post: Post,
        patch: Partial<Post>,
        successText: string,
    ) => Promise<void>;
    setKeyword: Dispatch<SetStateAction<string>>;
    setStatusFilter: Dispatch<SetStateAction<StatusFilter>>;
    setVisibilityFilter: Dispatch<SetStateAction<VisibilityFilter>>;
    statusFilter: StatusFilter;
    viewMode: ViewMode;
    visibilityFilter: VisibilityFilter;
}) {
    return (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-sm font-medium text-slate-900">
                        文章列表
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        支持草稿/发布、可见性、标签和回收站筛选。
                    </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:flex">
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="搜索标题、分类、slug、标签"
                        className={`${inputClass} min-w-60`}
                    />
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value as StatusFilter)
                        }
                        className={inputClass}
                    >
                        <option value="all">全部状态</option>
                        <option value="published">已发布</option>
                        <option value="draft">草稿</option>
                    </select>
                    <select
                        value={visibilityFilter}
                        onChange={(event) =>
                            setVisibilityFilter(
                                event.target.value as VisibilityFilter,
                            )
                        }
                        className={inputClass}
                    >
                        <option value="all">全部可见性</option>
                        <option value="public">公开</option>
                        <option value="private">私密</option>
                    </select>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                    <article key={post.id} className="px-4 py-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 gap-3">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-20 w-20 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-slate-600">
                                            {post.category?.name ?? "未分类"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-1 normal-case tracking-normal ${
                                                post.status === "published"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {post.status === "published"
                                                ? "已发布"
                                                : "草稿"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-1 normal-case tracking-normal ${
                                                post.visibility === "public"
                                                    ? "bg-sky-50 text-sky-700"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {post.visibility === "public"
                                                ? "公开"
                                                : "私密"}
                                        </span>
                                        {post.pinned ? (
                                            <span className="rounded-full bg-rose-50 px-2 py-1 normal-case tracking-normal text-rose-700">
                                                置顶
                                            </span>
                                        ) : null}
                                        <span>
                                            {formatPostDate(post.publishedAt)}
                                        </span>
                                    </div>
                                    <h2 className="mt-2 truncate text-base font-semibold text-slate-900">
                                        {post.title}
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {post.excerpt}
                                    </p>
                                    {(post.tags ?? []).length ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(post.tags ?? []).map((tag) => (
                                                <span
                                                    key={`${post.id}-${tag.id}`}
                                                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                                >
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!post.deleted ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => openEditEditor(post)}
                                            className={secondaryButtonClass}
                                        >
                                            编辑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quickUpdatePost(
                                                    post,
                                                    {
                                                        status:
                                                            post.status ===
                                                            "published"
                                                                ? "draft"
                                                                : "published",
                                                    },
                                                    post.status === "published"
                                                        ? "已转为草稿。"
                                                        : "已发布。",
                                                )
                                            }
                                            disabled={busy}
                                            className={secondaryButtonClass}
                                        >
                                            {post.status === "published"
                                                ? "转为草稿"
                                                : "发布"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quickUpdatePost(
                                                    post,
                                                    {
                                                        visibility:
                                                            post.visibility ===
                                                            "public"
                                                                ? "private"
                                                                : "public",
                                                    },
                                                    post.visibility === "public"
                                                        ? "已设为私密。"
                                                        : "已设为公开。",
                                                )
                                            }
                                            disabled={busy}
                                            className={secondaryButtonClass}
                                        >
                                            {post.visibility === "public"
                                                ? "设为私密"
                                                : "设为公开"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSoftDelete(post)
                                            }
                                            disabled={busy}
                                            className={dangerButtonClass}
                                        >
                                            回收
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleRestore(post)}
                                        disabled={busy}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 disabled:opacity-60"
                                    >
                                        恢复
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {filteredPosts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                        {viewMode === "recycle"
                            ? "回收站为空。"
                            : "没有匹配的文章。"}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function TaxonomyFormCard({
    children,
    title,
}: {
    children: ReactNode;
    title: string;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function TaxonomyListCard({
    children,
    title,
}: {
    children: ReactNode;
    title: string;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4 text-base font-semibold text-slate-900">
                {title}
            </div>
            <div className="divide-y divide-slate-100">{children}</div>
        </section>
    );
}

function TaxonomyRow({
    actions,
    meta,
    swatch,
    title,
}: {
    actions: ReactNode;
    meta: string;
    swatch?: string;
    title: string;
}) {
    return (
        <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                {swatch ? (
                    <span
                        className="h-4 w-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: swatch }}
                    />
                ) : null}
                <div>
                    <div className="text-sm font-medium text-slate-900">
                        {title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{meta}</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </span>
            {children}
        </label>
    );
}

function viewTitle(viewMode: ViewMode) {
    switch (viewMode) {
        case "posts":
            return "文章管理";
        case "recycle":
            return "回收站";
        case "categories":
            return "分类管理";
        case "tags":
            return "标签管理";
    }
}

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

const secondaryButtonClass =
    "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-60";

const dangerButtonClass =
    "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60";

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
