import { useEffect, useMemo, useState } from "react";

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
                setSelectedPostId(payload.data.id);
            } else {
                onPostCreated(payload.data);
                setSuccessMessage("文章已发布，可以继续写下一篇。");
                setSelectedPostId(payload.data.id);
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
            <section className="wing-widget">
                <div className="wing-widget-title-row">
                    <h3>管理状态</h3>
                    <span>Admin</span>
                </div>
                <div className="wing-mini-list">
                    <div>
                        <strong>{posts.length}</strong>
                        <p>当前文章总数</p>
                    </div>
                    <div>
                        <strong>{isEditing ? "编辑模式" : "新建模式"}</strong>
                        <p>
                            {isEditing
                                ? "表单会直接覆盖当前文章。"
                                : "表单会新建一篇文章。"}
                        </p>
                    </div>
                    <div>
                        <strong>
                            {submitting || deleting ? "处理中" : "空闲"}
                        </strong>
                        <p>
                            {submitting || deleting
                                ? "正在与后端同步。"
                                : "可以继续管理内容。"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="wing-widget">
                <div className="wing-widget-title-row">
                    <h3>快捷入口</h3>
                    <span>Jump</span>
                </div>
                <div className="wing-admin-shortcuts">
                    <a href={createHomeHref()} className="wing-pill-button">
                        返回首页
                    </a>
                    {selectedPost ? (
                        <a
                            href={createPostHref(selectedPost.slug)}
                            className="wing-pill-button wing-pill-button-strong"
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
                    <section className="wing-tabbar">
                        <a href={createHomeHref()} className="wing-tab">
                            首页
                        </a>
                        <span className="wing-tab wing-tab-active">
                            内容管理
                        </span>
                        <button
                            type="button"
                            className="wing-tab wing-tab-ghost wing-tab-button"
                            onClick={resetForm}
                        >
                            新建文章
                        </button>
                    </section>

                    <section className="wing-content-panel">
                        <div className="wing-section-head">
                            <div>
                                <span className="wing-kicker">Admin</span>
                                <h1>管理现有文章，而不是只会新增</h1>
                                <p>
                                    现在这个后台已经支持新建、选中编辑、更新保存和删除文章，数据直接同步到后端
                                    SQLite。
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <div className="wing-alert wing-alert-danger">
                                {error}
                            </div>
                        ) : null}
                        {successMessage ? (
                            <div className="wing-alert">{successMessage}</div>
                        ) : null}

                        <div className="wing-admin-grid">
                            <form
                                className="wing-admin-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="wing-admin-form-head">
                                    <div>
                                        <h2>
                                            {isEditing
                                                ? "编辑文章"
                                                : "新建文章"}
                                        </h2>
                                        <p>
                                            Slug 预览：`/#/posts/{slugPreview}`
                                        </p>
                                    </div>
                                    {isEditing ? (
                                        <button
                                            type="button"
                                            className="wing-pill-button"
                                            onClick={resetForm}
                                        >
                                            退出编辑
                                        </button>
                                    ) : null}
                                </div>

                                <label className="wing-field">
                                    <span>标题</span>
                                    <input
                                        value={values.title}
                                        onChange={handleChange("title")}
                                        required
                                    />
                                </label>

                                <label className="wing-field">
                                    <span>Slug</span>
                                    <input
                                        value={values.slug}
                                        onChange={handleChange("slug")}
                                        required
                                    />
                                </label>

                                <label className="wing-field">
                                    <span>摘要</span>
                                    <textarea
                                        value={values.excerpt}
                                        onChange={handleChange("excerpt")}
                                        required
                                        rows={3}
                                    />
                                </label>

                                <label className="wing-field">
                                    <span>正文</span>
                                    <textarea
                                        value={values.content}
                                        onChange={handleChange("content")}
                                        required
                                        rows={12}
                                    />
                                </label>

                                <label className="wing-field">
                                    <span>封面图 URL</span>
                                    <input
                                        value={values.coverImage}
                                        onChange={handleChange("coverImage")}
                                        required
                                    />
                                </label>

                                <div className="wing-field-grid">
                                    <label className="wing-field">
                                        <span>分类</span>
                                        <input
                                            value={values.category}
                                            onChange={handleChange("category")}
                                            required
                                        />
                                    </label>

                                    <label className="wing-field">
                                        <span>阅读时长</span>
                                        <input
                                            min="1"
                                            type="number"
                                            value={values.readingTime}
                                            onChange={handleChange(
                                                "readingTime",
                                            )}
                                            required
                                        />
                                    </label>

                                    <label className="wing-field">
                                        <span>发布时间</span>
                                        <input
                                            type="datetime-local"
                                            value={values.publishedAt}
                                            onChange={handleChange(
                                                "publishedAt",
                                            )}
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="wing-admin-actions">
                                    <button
                                        type="submit"
                                        className="wing-pill-button wing-pill-button-strong"
                                        disabled={submitting || deleting}
                                    >
                                        {submitting
                                            ? "提交中..."
                                            : isEditing
                                              ? "保存修改"
                                              : "发布文章"}
                                    </button>
                                    <button
                                        type="button"
                                        className="wing-pill-button"
                                        onClick={resetForm}
                                        disabled={submitting || deleting}
                                    >
                                        重置
                                    </button>
                                    {isEditing ? (
                                        <button
                                            type="button"
                                            className="wing-pill-button wing-pill-button-danger"
                                            onClick={handleDelete}
                                            disabled={submitting || deleting}
                                        >
                                            {deleting
                                                ? "删除中..."
                                                : "删除文章"}
                                        </button>
                                    ) : null}
                                </div>
                            </form>

                            <div className="wing-admin-list">
                                <div className="wing-admin-list-head">
                                    <h2>文章列表</h2>
                                    <p>点击任意文章进入编辑</p>
                                </div>

                                <div className="wing-admin-posts">
                                    {posts.map((post) => (
                                        <button
                                            key={post.id}
                                            type="button"
                                            className={`wing-admin-post-item${post.id === selectedPostId ? " wing-admin-post-item-active" : ""}`}
                                            onClick={() =>
                                                loadPostIntoForm(post)
                                            }
                                        >
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                            />
                                            <div className="wing-admin-post-copy">
                                                <div className="wing-admin-post-meta">
                                                    <span className="wing-tag">
                                                        {post.category}
                                                    </span>
                                                    <span>
                                                        {formatDate(
                                                            post.publishedAt,
                                                        )}
                                                    </span>
                                                </div>
                                                <strong>{post.title}</strong>
                                                <p>{post.excerpt}</p>
                                            </div>
                                        </button>
                                    ))}

                                    {posts.length === 0 ? (
                                        <div className="wing-empty-box">
                                            当前还没有文章，先发布第一篇。
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            }
        />
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
