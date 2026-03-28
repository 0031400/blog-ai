import type { Dispatch, SetStateAction } from "react";

import type { Tag } from "../../../types/tag.ts";
import {
    primaryButtonClass,
    dangerButtonClass,
    inputClass,
    secondaryButtonClass,
} from "../shared.ts";
import { Field } from "./Field.tsx";
import { TaxonomyFormCard } from "./TaxonomyFormCard.tsx";
import { TaxonomyListCard } from "./TaxonomyListCard.tsx";
import { TaxonomyRow } from "./TaxonomyRow.tsx";

type TagsSectionProps = {
    busy: boolean;
    deleteTag: (tag: Tag) => Promise<void>;
    editingTagId: number | null;
    resetTagForm: () => void;
    setEditingTagId: Dispatch<SetStateAction<number | null>>;
    setTagColor: Dispatch<SetStateAction<string>>;
    setTagName: Dispatch<SetStateAction<string>>;
    setTagSlug: Dispatch<SetStateAction<string>>;
    submitTag: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    tagColor: string;
    tagName: string;
    tagSlug: string;
    tagUsage: Map<string, number>;
    tags: Tag[];
};

export function TagsSection({
    busy,
    deleteTag,
    editingTagId,
    resetTagForm,
    setEditingTagId,
    setTagColor,
    setTagName,
    setTagSlug,
    submitTag,
    tagColor,
    tagName,
    tagSlug,
    tagUsage,
    tags,
}: TagsSectionProps) {
    return (
        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <TaxonomyFormCard title={editingTagId ? "编辑标签" : "新建标签"}>
                <form onSubmit={submitTag} className="space-y-4">
                    <Field label="名称">
                        <input
                            value={tagName}
                            onChange={(event) => setTagName(event.target.value)}
                            className={inputClass}
                            required
                        />
                    </Field>
                    <Field label="Slug">
                        <input
                            value={tagSlug}
                            onChange={(event) => setTagSlug(event.target.value)}
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
                            className={primaryButtonClass}
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
                                    className={secondaryButtonClass}
                                >
                                    编辑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteTag(tag)}
                                    className={dangerButtonClass}
                                >
                                    删除
                                </button>
                            </>
                        }
                        meta={`使用文章 ${tagUsage.get(tag.name) ?? 0} 篇`}
                        swatch={tag.color}
                        title={tag.name}
                    />
                ))}
            </TaxonomyListCard>
        </section>
    );
}
