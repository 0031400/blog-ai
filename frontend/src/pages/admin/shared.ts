export type ViewMode = "posts" | "recycle" | "categories" | "tags";
export type StatusFilter = "all" | "draft" | "published";
export type VisibilityFilter = "all" | "public" | "private";

export const inputClass =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-50";

export const secondaryButtonClass =
    "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60";

export const dangerButtonClass =
    "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-100 disabled:opacity-60";

export const primaryButtonClass =
    "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60";

export const ghostButtonClass =
    "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60";

export const adminPanelClass =
    "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm";

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
