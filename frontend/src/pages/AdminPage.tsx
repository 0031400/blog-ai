import { type ReactNode, useEffect, useMemo, useState } from "react";

import { formatDate } from "../lib/date";
import { createHomeHref, createPostHref } from "../lib/hashRoute";
import type { Post } from "../types/post";
import type { PostFormValues } from "../types/postForm";

type AdminPageProps = {
    apiBaseUrl: string;
    onPostCreated: (post: Post) => void;
    onPostDeleted: (postId: number) => void;
    onPostUpdated: (post: Post) => void;
    posts: Post[];
};

const createInitialValues = (): PostFormValues => ({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    readingTime: "5",
    publishedAt: new Date().toISOString().slice(0, 16),
});

export function AdminPage({
    apiBaseUrl,
    onPostCreated,
    onPostDeleted,
    onPostUpdated,
    posts,
}: AdminPageProps) {
    const [values, setValues] = useState<PostFormValues>(createInitialValues);
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
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
        if (!normalizedKeyword) {
            return posts;
        }

        return posts.filter((post) =>
            [post.title, post.excerpt, post.category, post.slug].some((value) =>
                value.toLowerCase().includes(normalizedKeyword),
            ),
        );
    }, [keyword, posts]);

    useEffect(() => {
        if (!selectedPost && selectedPostId !== null) {
            setSelectedPostId(null);
            setValues(createInitialValues());
            setEditorOpen(false);
        }
    }, [selectedPost, selectedPostId]);

    const handleChange =
        (field: keyof PostFormValues) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const nextValue = event.target.value;

            setValues((currentValues) => {
                const nextValues = { ...currentValues, [field]: nextValue };

                if (field === "title") {
                    const autoSlug = toSlug(nextValue);
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
        setSelectedPostId(null);
        setValues(createInitialValues());
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
            readingTime: String(post.readingTime),
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
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(endpoint, {
                method,
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
                setSuccessMessage("文章已发布。");
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

    const handleDelete = async (post?: Post | null) => {
        const targetPost = post ?? selectedPost;
        if (!targetPost) {
            return;
        }

        const confirmed = window.confirm(
            `确认删除《${targetPost.title}》吗？此操作不可撤销。`,
        );
        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${apiBaseUrl}/api/posts/${targetPost.id}`,
                { method: "DELETE" },
            );
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            onPostDeleted(targetPost.id);
            if (selectedPostId === targetPost.id) {
                resetForm();
            }
            setSuccessMessage("文章已删除。");
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
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg bg-slate-100 px-3 py-2 text-left text-sm text-slate-500"
                    >
                        <span>⌕</span>
                        <span>搜索菜单与内容</span>
                        <span className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px]">
                            Ctrl+K
                        </span>
                    </button>
                </div>

                <nav className="mt-4 px-3">
                    <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Content
                    </div>
                    <a
                        href="/#/admin"
                        className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white"
                    >
                        <span>▣</span>
                        <span>文章</span>
                    </a>
                    <a
                        href="/#/admin"
                        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        <span>◌</span>
                        <span>草稿</span>
                    </a>
                    <a
                        href="/#/admin"
                        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        <span>◌</span>
                        <span>设置</span>
                    </a>
                </nav>

                <div className="mt-auto border-t border-slate-200 p-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                                B
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-900">
                                    blog-ai
                                </div>
                                <div className="text-xs text-slate-500">
                                    内容管理后台
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="md:ml-64">
                <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
                    <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="text-sm text-slate-500">
                                Contents / Posts
                            </div>
                            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
                                文章
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

                    <section className="mt-4 grid gap-3 md:grid-cols-3">
                        {[
                            ["文章总数", `${posts.length}`],
                            [
                                "当前模式",
                                editorOpen
                                    ? isEditing
                                        ? "编辑中"
                                        : "新建中"
                                    : "浏览中",
                            ],
                            [
                                "同步状态",
                                submitting || deleting ? "处理中" : "空闲",
                            ],
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
                                    {isEditing ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(selectedPost)
                                            }
                                            disabled={submitting || deleting}
                                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60"
                                        >
                                            {deleting
                                                ? "删除中..."
                                                : "删除文章"}
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

                                <Field label="摘要">
                                    <textarea
                                        value={values.excerpt}
                                        onChange={handleChange("excerpt")}
                                        required
                                        rows={3}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="正文">
                                    <textarea
                                        value={values.content}
                                        onChange={handleChange("content")}
                                        required
                                        rows={12}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="封面图 URL">
                                    <input
                                        value={values.coverImage}
                                        onChange={handleChange("coverImage")}
                                        required
                                        className={inputClass}
                                    />
                                </Field>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="分类">
                                        <input
                                            value={values.category}
                                            onChange={handleChange("category")}
                                            required
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
                                              : "发布文章"}
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
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-sm font-medium text-slate-900">
                                    文章列表
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                    参考 Halo 控制台的列表型后台结构
                                </div>
                            </div>
                            <div className="flex w-full items-center gap-2 md:w-[320px]">
                                <input
                                    value={keyword}
                                    onChange={(event) =>
                                        setKeyword(event.target.value)
                                    }
                                    placeholder="搜索标题、分类、slug"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {filteredPosts.map((post) => (
                                <article key={post.id} className="px-4 py-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                                                    <span>
                                                        {formatDate(
                                                            post.publishedAt,
                                                        )}
                                                    </span>
                                                    <span>
                                                        {post.readingTime} min
                                                    </span>
                                                </div>
                                                <h2 className="mt-2 truncate text-base font-semibold text-slate-900">
                                                    {post.title}
                                                </h2>
                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                    {post.excerpt}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditEditor(post)
                                                }
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                            >
                                                编辑
                                            </button>
                                            <a
                                                href={createPostHref(post.slug)}
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                            >
                                                预览
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(post)
                                                }
                                                disabled={deleting}
                                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {filteredPosts.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-slate-500">
                                    没有匹配的文章，可以调整搜索词或新建一篇。
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
