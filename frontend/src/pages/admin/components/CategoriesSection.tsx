import type { Dispatch, SetStateAction } from "react";

import type { Category } from "../../../types/category.ts";
import {
    dangerButtonClass,
    inputClass,
    secondaryButtonClass,
} from "../shared.ts";
import { Field } from "./Field.tsx";
import { TaxonomyFormCard } from "./TaxonomyFormCard.tsx";
import { TaxonomyListCard } from "./TaxonomyListCard.tsx";
import { TaxonomyRow } from "./TaxonomyRow.tsx";

type CategoriesSectionProps = {
    busy: boolean;
    categories: Category[];
    categoryName: string;
    categorySlug: string;
    categoryUsage: Map<string, number>;
    deleteCategory: (category: Category) => Promise<void>;
    editingCategoryId: number | null;
    resetCategoryForm: () => void;
    setCategoryName: Dispatch<SetStateAction<string>>;
    setCategorySlug: Dispatch<SetStateAction<string>>;
    setEditingCategoryId: Dispatch<SetStateAction<number | null>>;
    submitCategory: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function CategoriesSection({
    busy,
    categories,
    categoryName,
    categorySlug,
    categoryUsage,
    deleteCategory,
    editingCategoryId,
    resetCategoryForm,
    setCategoryName,
    setCategorySlug,
    setEditingCategoryId,
    submitCategory,
}: CategoriesSectionProps) {
    return (
        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <TaxonomyFormCard
                title={editingCategoryId ? "编辑分类" : "新建分类"}
            >
                <form onSubmit={submitCategory} className="space-y-4">
                    <Field label="名称">
                        <input
                            value={categoryName}
                            onChange={(event) =>
                                setCategoryName(event.target.value)
                            }
                            className={inputClass}
                            required
                        />
                    </Field>
                    <Field label="Slug">
                        <input
                            value={categorySlug}
                            onChange={(event) =>
                                setCategorySlug(event.target.value)
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
                                        setEditingCategoryId(category.id);
                                        setCategoryName(category.name);
                                        setCategorySlug(category.slug);
                                    }}
                                    className={secondaryButtonClass}
                                >
                                    编辑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteCategory(category)}
                                    className={dangerButtonClass}
                                >
                                    删除
                                </button>
                            </>
                        }
                        meta={`使用文章 ${categoryUsage.get(category.name) ?? 0} 篇`}
                        title={category.name}
                    />
                ))}
            </TaxonomyListCard>
        </section>
    );
}
