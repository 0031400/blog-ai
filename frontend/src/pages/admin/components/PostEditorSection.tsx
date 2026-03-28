import type { Category } from "../../../types/category.ts";
import type { Post } from "../../../types/post.ts";
import type { PostFormValues } from "../../../types/postForm.ts";
import type { Tag } from "../../../types/tag.ts";
import { inputClass } from "../shared.ts";
import { Field } from "./Field.tsx";

type PostEditorSectionProps = {
    busy: boolean;
    categories: Category[];
    handleChange: (
        field: keyof PostFormValues,
    ) => (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    handleSoftDelete: (post: Post) => Promise<void>;
    isEditingPost: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    resetPostForm: () => void;
    selectedPost: Post | null;
    slugPreview: string;
    submitting: boolean;
    tags: Tag[];
    toggleTagSelection: (tagId: number) => void;
    values: PostFormValues;
};

export function PostEditorSection({
    busy,
    categories,
    handleChange,
    handleSoftDelete,
    isEditingPost,
    onSubmit,
    resetPostForm,
    selectedPost,
    slugPreview,
    submitting,
    tags,
    toggleTagSelection,
    values,
}: PostEditorSectionProps) {
    return (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="text-sm font-medium text-slate-900">
                        {isEditingPost ? "编辑文章" : "新建文章"}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        Slug 预览：`/posts/{slugPreview}`
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

            <form onSubmit={onSubmit} className="space-y-4 px-4 py-4">
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
                            onChange={handleChange("coverImage")}
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
                            onChange={handleChange("categoryId")}
                            className={inputClass}
                        >
                            <option value="">选择分类</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
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
                                        const selected = values.tagIds.includes(
                                            tag.id,
                                        );

                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleTagSelection(tag.id)
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
                            onChange={handleChange("readingTime")}
                            required
                            className={inputClass}
                        />
                    </Field>
                    <Field label="发布时间">
                        <input
                            type="datetime-local"
                            value={values.publishedAt}
                            onChange={handleChange("publishedAt")}
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
                            <option value="published">已发布</option>
                        </select>
                    </Field>
                    <Field label="可见性">
                        <select
                            value={values.visibility}
                            onChange={handleChange("visibility")}
                            className={inputClass}
                        >
                            <option value="public">公开</option>
                            <option value="private">私密</option>
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
                            onChange={handleChange("allowComment")}
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
                                selectedPost && handleSoftDelete(selectedPost)
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
    );
}
