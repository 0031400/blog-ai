import { useState } from "react";

import type { Category } from "../../../types/category.ts";
import type { PostFormValues } from "../../../types/postForm.ts";
import type { Tag } from "../../../types/tag.ts";
import { ghostButtonClass, inputClass, primaryButtonClass } from "../shared.ts";

type EditorSettingsModalProps = {
    categories: Category[];
    onApply: (patch: Partial<PostFormValues>) => void;
    onClose: () => void;
    tags: Tag[];
    values: PostFormValues;
};

export function EditorSettingsModal({
    categories,
    onApply,
    onClose,
    tags,
    values,
}: EditorSettingsModalProps) {
    const [draft, setDraft] = useState(values);
    const [autoExcerpt, setAutoExcerpt] = useState(!values.excerpt.trim());

    const apply = () => {
        const nextExcerpt =
            autoExcerpt && !draft.excerpt.trim()
                ? draft.content.replace(/\s+/g, " ").trim().slice(0, 120)
                : draft.excerpt;

        onApply({
            ...draft,
            excerpt: nextExcerpt,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-8 backdrop-blur-[2px]">
            <div className="w-full max-w-180 overflow-hidden rounded-lg bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div className="text-[1.5rem] font-semibold tracking-[-0.04em] text-slate-900">
                        文章设置
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                    >
                        ×
                    </button>
                </div>

                <div className="grid gap-6 px-5 py-5 md:grid-cols-[140px_minmax(0,1fr)]">
                    <div className="text-sm font-medium text-slate-700">
                        常规设置
                    </div>

                    <div className="space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                标题 *
                            </span>
                            <input
                                value={draft.title}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        title: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                别名 *
                            </span>
                            <div className="flex overflow-hidden rounded-md border border-slate-200">
                                <input
                                    value={draft.slug}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            slug: event.target.value,
                                        }))
                                    }
                                    className="min-w-0 flex-1 border-0 px-3 py-2 text-sm outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraft((current) => ({
                                            ...current,
                                            slug: current.title
                                                .toLowerCase()
                                                .trim()
                                                .replace(/[^a-z0-9\s-]/g, "")
                                                .replace(/\s+/g, "-")
                                                .replace(/-+/g, "-"),
                                        }))
                                    }
                                    className="border-l border-slate-200 px-4 text-slate-500"
                                >
                                    ↻
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                通常用于生成文章的固定链接
                            </div>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                分类目录
                            </span>
                            <select
                                value={draft.categoryId}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        categoryId: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            >
                                <option value="">请选择分类</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                标签
                            </span>
                            <select
                                value=""
                                onChange={(event) => {
                                    const selectedTagId = Number(
                                        event.target.value,
                                    );
                                    if (!selectedTagId) return;
                                    setDraft((current) => ({
                                        ...current,
                                        tagIds: current.tagIds.includes(
                                            selectedTagId,
                                        )
                                            ? current.tagIds
                                            : [
                                                  ...current.tagIds,
                                                  selectedTagId,
                                              ],
                                    }));
                                }}
                                className={inputClass}
                            >
                                <option value="">请选择标签</option>
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {draft.tagIds.map((tagId) => {
                                    const tag = tags.find(
                                        (item) => item.id === tagId,
                                    );
                                    if (!tag) return null;

                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() =>
                                                setDraft((current) => ({
                                                    ...current,
                                                    tagIds: current.tagIds.filter(
                                                        (item) =>
                                                            item !== tag.id,
                                                    ),
                                                }))
                                            }
                                            className="rounded-full bg-sky-50 px-3 py-1.5 text-sm text-sky-600"
                                        >
                                            {tag.name} ×
                                        </button>
                                    );
                                })}
                            </div>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={autoExcerpt}
                                onChange={(event) =>
                                    setAutoExcerpt(event.target.checked)
                                }
                            />
                            <span>自动生成摘要</span>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                封面图
                            </span>
                            <input
                                value={draft.coverImage}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        coverImage: event.target.value,
                                    }))
                                }
                                className={inputClass}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
                    <button
                        type="button"
                        onClick={apply}
                        className={primaryButtonClass}
                    >
                        保存
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className={ghostButtonClass}
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
}
