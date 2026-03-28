export type ViewMode = "posts" | "recycle" | "categories" | "tags";
export type StatusFilter = "all" | "draft" | "published";
export type VisibilityFilter = "all" | "public" | "private";

export const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

export const secondaryButtonClass =
    "rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-60";

export const dangerButtonClass =
    "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 disabled:opacity-60";

export function viewTitle(viewMode: ViewMode) {
    switch (viewMode) {
        case "posts":
            return "文章管理";
        case "recycle":
            return "回收站";
        case "categories":
            return "分类管理";
        case "tags":
            return "标签管理";
    }
}
