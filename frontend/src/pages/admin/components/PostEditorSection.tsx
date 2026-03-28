import { useMemo, useState } from "react";

import { MarkdownContent } from "../../../components/MarkdownContent.tsx";
import type { Category } from "../../../types/category.ts";
import type { Post } from "../../../types/post.ts";
import type { PostFormValues } from "../../../types/postForm.ts";
import type { Tag } from "../../../types/tag.ts";
import { EditorSettingsModal } from "./EditorSettingsModal.tsx";

type PostEditorSectionProps = {
    applyValues: (patch: Partial<PostFormValues>) => void;
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
    values: PostFormValues;
};

export function PostEditorSection({
    applyValues,
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
    values,
}: PostEditorSectionProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    const previewContent = useMemo(
        () => values.content.trim(),
        [values.content],
    );

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex min-h-[calc(100vh-180px)] flex-col">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-[30px] font-semibold tracking-[-0.05em] text-slate-900">
                                    文章
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                                >
                                    预览
                                </button>
                                <button
                                    type="submit"
                                    form="post-editor-form"
                                    disabled={submitting || busy}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                >
                                    保存
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettingsOpen(true)}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                                >
                                    设置
                                </button>
                                <button
                                    type="button"
                                    onClick={resetPostForm}
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
                                >
                                    发布
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-slate-200 px-5 py-3 text-slate-500">
                        <div className="flex flex-wrap items-center gap-5 text-lg">
                            {[
                                "H",
                                "B",
                                "I",
                                "❝",
                                "🔗",
                                "</>",
                                "{ }",
                                "≣",
                                "☑",
                                "⊞",
                                "Σ",
                                "🖼",
                            ].map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    className="text-slate-500 transition hover:text-slate-800"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form
                        id="post-editor-form"
                        onSubmit={onSubmit}
                        className="grid min-h-0 flex-1 lg:grid-cols-2"
                    >
                        <div className="min-h-105 border-b border-slate-200 lg:border-b-0 lg:border-r">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <input
                                    value={values.title}
                                    onChange={handleChange("title")}
                                    placeholder="请输入文章标题"
                                    className="w-full border-0 p-0 text-[28px] font-semibold tracking-[-0.04em] text-slate-900 outline-none placeholder:text-slate-300"
                                />
                            </div>
                            <div className="px-5 py-4">
                                <textarea
                                    value={values.content}
                                    onChange={handleChange("content")}
                                    placeholder="开始编写你的 Markdown 内容..."
                                    className="min-h-130 w-full resize-none border-0 p-0 font-mono text-[16px] leading-8 text-slate-800 outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="min-h-105 bg-white">
                            <div className="border-b border-slate-100 px-6 py-4 text-sm text-slate-400">
                                Slug: `/posts/{slugPreview}`
                            </div>
                            <div className="px-6 py-5">
                                <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-slate-900">
                                    {values.title || "未命名文章"}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                    <span>
                                        {categories.find(
                                            (category) =>
                                                String(category.id) ===
                                                values.categoryId,
                                        )?.name ?? "未分类"}
                                    </span>
                                    <span>·</span>
                                    <span>{values.readingTime || "0"} min</span>
                                    <span>·</span>
                                    <span>
                                        {values.status === "published"
                                            ? "已发布"
                                            : "草稿"}
                                    </span>
                                </div>

                                <div className="mt-6">
                                    {previewContent ? (
                                        <MarkdownContent
                                            content={previewContent}
                                            className="prose-p:my-4"
                                        />
                                    ) : (
                                        <div className="text-sm text-slate-400">
                                            右侧将在这里实时预览 Markdown 内容。
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-400">
                        <div>
                            Words: {values.content.trim().length} Lines:{" "}
                            {Math.max(values.content.split("\n").length, 1)}
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked readOnly />
                                <span>Scroll sync</span>
                            </label>
                            <button type="button">Scroll to top</button>
                        </div>
                    </div>
                </div>
            </section>

            {isEditingPost && !selectedPost?.deleted ? (
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            selectedPost && handleSoftDelete(selectedPost)
                        }
                        disabled={busy}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600 disabled:opacity-60"
                    >
                        移入回收站
                    </button>
                </div>
            ) : null}

            {settingsOpen ? (
                <EditorSettingsModal
                    categories={categories}
                    onApply={applyValues}
                    onClose={() => setSettingsOpen(false)}
                    tags={tags}
                    values={values}
                />
            ) : null}
        </>
    );
}
