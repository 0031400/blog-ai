import { type ReactNode, useEffect, useMemo, useState } from "react";

import { formatDate } from "../lib/date";
import { createHomeHref, createPostHref } from "../lib/hashRoute";
import type { Post } from "../types/post";
import type { PostFormValues } from "../types/postForm";

type AdminPageProps = {
    apiBaseUrl: string;
    onPostCreated: (post: Post) => void;
    onPostUpdated: (post: Post) => void;
    posts: Post[];
};

type ViewMode = "active" | "recycle";
type StatusFilter = "all" | "draft" | "published";
type VisibilityFilter = "all" | "public" | "private";

const createInitialValues = (): PostFormValues => ({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: "",
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
    onPostCreated,
    onPostUpdated,
    posts,
}: AdminPageProps) {
    const [values, setValues] = useState<PostFormValues>(createInitialValues);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("active");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [visibilityFilter, setVisibilityFilter] =
        useState<VisibilityFilter>("all");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const selectedPost = useMemo(
        () => posts.find((post) => post.id === selectedPostId) ?? null,
        [posts, selectedPostId],
    );
    const slugPreview = useMemo(
        () => values.slug.trim() || "your-post-slug",
        [values.slug],
    );
    const isEditing = selectedPost !== null;

    const filteredPosts = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();

        return posts.filter((post) => {
            if (viewMode === "active" && post.deleted) return false;
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
                post.category,
                post.slug,
                (post.tags ?? []).join(" "),
            ].some((value) => value.toLowerCase().includes(normalizedKeyword));
        });
    }, [keyword, posts, statusFilter, viewMode, visibilityFilter]);

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
            setSelectedPostId(null);
            setValues(createInitialValues());
            setEditorOpen(false);
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

    const resetForm = () => {
        setSelectedPostId(null);
        setValues(createInitialValues());
        setEditorOpen(false);
        setError("");
        setSuccessMessage("");
    };

    const openCreateEditor = () => {
        setValues(createInitialValues());
        setSelectedPostId(null);
        setEditorOpen(true);
        setError("");
        setSuccessMessage("");
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
            category: post.category,
            tags: (post.tags ?? []).join(", "),
            readingTime: String(post.readingTime),
            status: post.status,
            visibility: post.visibility,
            pinned: post.pinned,
            allowComment: post.allowComment,
            deleted: post.deleted,
            publishedAt: new Date(post.publishedAt).toISOString().slice(0, 16),
        });
        setEditorOpen(true);
        setError("");
        if (!options?.preserveMessage) {
            setSuccessMessage("");
        }
    };

    const buildPayload = () => ({
        ...values,
        tags: values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        readingTime: Number(values.readingTime),
        publishedAt: new Date(values.publishedAt).toISOString(),
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            const endpoint = isEditing
                ? `${apiBaseUrl}/api/posts/${selectedPost.id}`
                : `${apiBaseUrl}/api/posts`;
            const response = await fetch(endpoint, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
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

            if (isEditing) {
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
        const confirmed = window.confirm(
            `确认将《${post.title}》移入回收站吗？`,
        );
        if (!confirmed) return;

        setDeleting(true);
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
                resetForm();
            }
            setSuccessMessage("文章已移入回收站。");
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "删除失败，请稍后重试。",
            );
        } finally {
            setDeleting(false);
        }
    };

    const handleRestore = async (post: Post) => {
        setDeleting(true);
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
            setDeleting(false);
        }
    };

    const quickUpdatePost = async (
        post: Post,
        patch: Partial<Post>,
        successText: string,
    ) => {
        setDeleting(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(`${apiBaseUrl}/api/posts/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...post,
                    ...patch,
                }),
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
            setDeleting(false);
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

                <div className="px-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-left text-sm text-slate-500">
                        <span>⌕</span>
                        <span>内容管理</span>
                    </div>
                </div>

                <nav className="mt-4 px-3">
                    <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Content
                    </div>
                    <button
                        type="button"
                        onClick={() => setViewMode("active")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${viewMode === "active" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                        <span>▣</span>
                        <span>文章</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("recycle")}
                        className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${viewMode === "recycle" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                        <span>◌</span>
                        <span>回收站</span>
                    </button>
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        参考 Halo 的文章内容管理：状态、可见性、标签、回收站。
                    </div>
                </div>
            </aside>

            <main className="md:ml-64">
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
                    <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm text-slate-500">
                                Contents / Posts
                            </div>
                            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
                                {viewMode === "active" ? "文章管理" : "回收站"}
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
                                        {isEditing ? "编辑文章" : "新建文章"}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        Slug 预览：`/#/posts/{slugPreview}`
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                    >
                                        关闭编辑器
                                    </button>
                                    {isEditing && !selectedPost.deleted ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSoftDelete(selectedPost)
                                            }
                                            disabled={submitting || deleting}
                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60"
                                        >
                                            移入回收站
                                        </button>
                                    ) : null}
                                </div>
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
                                        <input
                                            value={values.category}
                                            onChange={handleChange("category")}
                                            required
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="标签">
                                        <input
                                            value={values.tags}
                                            onChange={handleChange("tags")}
                                            placeholder="React, Go, 设计"
                                            className={inputClass}
                                        />
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
                                        disabled={submitting || deleting}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                                    >
                                        {submitting
                                            ? "提交中..."
                                            : isEditing
                                              ? "保存修改"
                                              : "创建文章"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={submitting || deleting}
                                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 disabled:opacity-60"
                                    >
                                        重置
                                    </button>
                                </div>
                            </form>
                        </section>
                    ) : null}

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
                                    onChange={(event) =>
                                        setKeyword(event.target.value)
                                    }
                                    placeholder="搜索标题、分类、slug、标签"
                                    className={`${inputClass} min-w-[240px]`}
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as StatusFilter,
                                        )
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
                                            event.target
                                                .value as VisibilityFilter,
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
                                                        {post.category}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-1 normal-case tracking-normal ${post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                                                    >
                                                        {post.status ===
                                                        "published"
                                                            ? "已发布"
                                                            : "草稿"}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2 py-1 normal-case tracking-normal ${post.visibility === "public" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-700"}`}
                                                    >
                                                        {post.visibility ===
                                                        "public"
                                                            ? "公开"
                                                            : "私密"}
                                                    </span>
                                                    {post.pinned ? (
                                                        <span className="rounded-full bg-rose-50 px-2 py-1 normal-case tracking-normal text-rose-700">
                                                            置顶
                                                        </span>
                                                    ) : null}
                                                    <span>
                                                        {formatDate(
                                                            post.publishedAt,
                                                        )}
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
                                                        {(post.tags ?? []).map(
                                                            (tag) => (
                                                                <span
                                                                    key={`${post.id}-${tag}`}
                                                                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {!post.deleted ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditEditor(post)
                                                        }
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
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
                                                                post.status ===
                                                                    "published"
                                                                    ? "已转为草稿。"
                                                                    : "已发布。",
                                                            )
                                                        }
                                                        disabled={deleting}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-60"
                                                    >
                                                        {post.status ===
                                                        "published"
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
                                                                post.visibility ===
                                                                    "public"
                                                                    ? "已设为私密。"
                                                                    : "已设为公开。",
                                                            )
                                                        }
                                                        disabled={deleting}
                                                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-60"
                                                    >
                                                        {post.visibility ===
                                                        "public"
                                                            ? "设为私密"
                                                            : "设为公开"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSoftDelete(
                                                                post,
                                                            )
                                                        }
                                                        disabled={deleting}
                                                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60"
                                                    >
                                                        回收
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestore(post)
                                                    }
                                                    disabled={deleting}
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
                                    没有匹配的文章。
                                </div>
                            ) : null}
                        </div>
                    </section>
                </div>
            </main>
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

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
