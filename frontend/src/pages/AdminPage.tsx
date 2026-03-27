import { type ReactNode, useEffect, useMemo, useState } from "react";

import { formatDate } from "../lib/date";
import { createHomeHref, createPostHref } from "../lib/hashRoute";
import type { Post } from "../types/post";
import type { PostFormValues } from "../types/postForm";
import { WingLayout } from "../components/WingLayout";

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

    useEffect(() => {
        if (!selectedPost && selectedPostId !== null) {
            setSelectedPostId(null);
            setValues(createInitialValues());
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
        setError("");
        setSuccessMessage("");
    };

    const loadPostIntoForm = (
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

            loadPostIntoForm(payload.data, { preserveMessage: true });
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

    const handleDelete = async () => {
        if (!selectedPost) {
            return;
        }

        const confirmed = window.confirm(
            `确认删除《${selectedPost.title}》吗？此操作不可撤销。`,
        );
        if (!confirmed) {
            return;
        }

        setDeleting(true);
        setError("");
        setSuccessMessage("");

        try {
            const response = await fetch(
                `${apiBaseUrl}/api/posts/${selectedPost.id}`,
                { method: "DELETE" },
            );
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(
                    payload.error ??
                        `Request failed with status ${response.status}`,
                );
            }

            onPostDeleted(selectedPost.id);
            resetForm();
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

    const rightAside = (
        <>
            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        管理状态
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Admin
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            {posts.length}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            当前文章总数
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            {isEditing ? "编辑模式" : "新建模式"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {isEditing
                                ? "当前表单会更新现有文章。"
                                : "当前表单会新建文章。"}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            {submitting || deleting ? "处理中" : "空闲"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {submitting || deleting
                                ? "正在与后端同步。"
                                : "可以继续管理内容。"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        快捷入口
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Jump
                    </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <a
                        href={createHomeHref()}
                        className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
                    >
                        返回首页
                    </a>
                    {selectedPost ? (
                        <a
                            href={createPostHref(selectedPost.slug)}
                            className="rounded-full bg-rose-500 px-3 py-2 text-sm text-white"
                        >
                            查看文章
                        </a>
                    ) : null}
                </div>
            </section>
        </>
    );

    return (
        <WingLayout
            rightAside={rightAside}
            main={
                <>
                    <section className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm">
                        <a
                            href={createHomeHref()}
                            className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            首页
                        </a>
                        <span className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">
                            内容管理
                        </span>
                        <button
                            type="button"
                            className="ml-auto rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                            onClick={resetForm}
                        >
                            新建文章
                        </button>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
                        <div>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                Admin
                            </span>
                            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-slate-900 md:text-[34px]">
                                收紧后的三栏后台
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                左侧站点信息，中间单列编辑区，右侧状态和快捷入口，不再把主内容拆成两栏。
                            </p>
                        </div>

                        {error ? (
                            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {error}
                            </div>
                        ) : null}
                        {successMessage ? (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                {successMessage}
                            </div>
                        ) : null}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {isEditing ? "编辑文章" : "新建文章"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Slug 预览：`/#/posts/{slugPreview}`
                                    </p>
                                </div>
                                {isEditing ? (
                                    <button
                                        type="button"
                                        className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                        onClick={resetForm}
                                    >
                                        退出编辑
                                    </button>
                                ) : null}
                            </div>

                            <div className="mt-4 space-y-4">
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
                                        rows={10}
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
                                        className="rounded-full bg-rose-500 px-4 py-2 text-sm text-white disabled:opacity-60"
                                    >
                                        {submitting
                                            ? "提交中..."
                                            : isEditing
                                              ? "保存修改"
                                              : "发布文章"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting || deleting}
                                        className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 disabled:opacity-60"
                                        onClick={resetForm}
                                    >
                                        重置
                                    </button>
                                    {isEditing ? (
                                        <button
                                            type="button"
                                            disabled={submitting || deleting}
                                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 disabled:opacity-60"
                                            onClick={handleDelete}
                                        >
                                            {deleting
                                                ? "删除中..."
                                                : "删除文章"}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </form>

                        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-900">
                                    文章列表
                                </h2>
                                <p className="text-sm text-slate-500">
                                    点击任意文章进入编辑
                                </p>
                            </div>

                            <div className="mt-3 space-y-2">
                                {posts.map((post) => (
                                    <button
                                        key={post.id}
                                        type="button"
                                        onClick={() => loadPostIntoForm(post)}
                                        className={`grid w-full gap-3 rounded-xl border p-3 text-left transition md:grid-cols-[96px_minmax(0,1fr)] ${
                                            post.id === selectedPostId
                                                ? "border-rose-200 bg-rose-50/60"
                                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                                        }`}
                                    >
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="h-24 w-full rounded-lg object-cover md:w-24"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-rose-600">
                                                    {post.category}
                                                </span>
                                                <span>
                                                    {formatDate(
                                                        post.publishedAt,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-slate-900">
                                                {post.title}
                                            </div>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </button>
                                ))}

                                {posts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                                        当前还没有文章，先发布第一篇。
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    </section>
                </>
            }
        />
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
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100";

function toSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}
