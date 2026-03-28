import { useMemo } from "react";

import { MarkdownContent } from "../../../components/MarkdownContent.tsx";
import type { Category } from "../../../types/category.ts";
import type { PostFormValues } from "../../../types/postForm.ts";
import type { Tag } from "../../../types/tag.ts";
import { adminPanelClass } from "../shared.ts";
import { EditorSettingsModal } from "./EditorSettingsModal.tsx";

type PostEditorSectionProps = {
    applyValues: (patch: Partial<PostFormValues>) => void;
    categories: Category[];
    handleChange: (
        field: keyof PostFormValues,
    ) => (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => void;
    onCloseSettings: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    settingsOpen: boolean;
    tags: Tag[];
    values: PostFormValues;
};

export function PostEditorSection({
    applyValues,
    categories,
    handleChange,
    onCloseSettings,
    onSubmit,
    settingsOpen,
    tags,
    values,
}: PostEditorSectionProps) {
    const previewContent = useMemo(
        () => values.content.trim(),
        [values.content],
    );

    return (
        <>
            <section className={adminPanelClass}>
                <div className="flex min-h-[calc(100vh-9rem)] flex-col">
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
                                    className="w-full border-0 p-0 text-[2.25rem] font-semibold tracking-[-0.05em] text-slate-900 outline-none placeholder:text-slate-300"
                                />
                            </div>
                            <div className="px-5 py-4">
                                <textarea
                                    value={values.content}
                                    onChange={handleChange("content")}
                                    placeholder="开始编写你的 Markdown 内容..."
                                    className="min-h-130 w-full resize-none border-0 p-0 font-mono text-base leading-8 text-slate-800 outline-none placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="min-h-105 border-l border-slate-200 bg-white">
                            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto px-6 py-5">
                                <h1 className="text-[1.375rem] font-semibold tracking-[-0.03em] text-slate-900">
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

            {settingsOpen ? (
                <EditorSettingsModal
                    categories={categories}
                    onApply={applyValues}
                    onClose={onCloseSettings}
                    tags={tags}
                    values={values}
                />
            ) : null}
        </>
    );
}
