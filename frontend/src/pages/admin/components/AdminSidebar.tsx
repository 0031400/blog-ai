import { Link } from "react-router-dom";

import {
    createAdminCategoriesPath,
    createAdminPath,
    createAdminRecyclePath,
    createAdminTagsPath,
    createHomePath,
} from "../../../lib/routes.ts";
import type { ViewMode } from "../shared.ts";

type AdminSidebarProps = {
    activeViewMode: ViewMode;
};

const navItems: Array<{
    label: string;
    path: string;
    symbol: string;
    value: ViewMode;
}> = [
    { label: "文章", path: createAdminPath(), symbol: "▣", value: "posts" },
    {
        label: "回收站",
        path: createAdminRecyclePath(),
        symbol: "⌫",
        value: "recycle",
    },
    {
        label: "分类",
        path: createAdminCategoriesPath(),
        symbol: "◫",
        value: "categories",
    },
    { label: "标签", path: createAdminTagsPath(), symbol: "#", value: "tags" },
];

export function AdminSidebar({ activeViewMode }: AdminSidebarProps) {
    return (
        <aside className="hidden w-[264px] shrink-0 border-r border-slate-200 bg-white/95 md:flex md:flex-col">
            <div className="border-b border-slate-200 px-6 py-5">
                <Link
                    to={createHomePath()}
                    className="text-[30px] font-semibold tracking-[-0.06em] text-sky-600"
                >
                    blog-ai
                </Link>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">
                    Admin Console
                </div>
            </div>

            <div className="px-4 py-4">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                    <span className="text-base">⌕</span>
                    <span>搜索</span>
                    <span className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-400">
                        Ctrl+K
                    </span>
                </div>
            </div>

            <nav className="px-3 pb-4">
                <div className="px-3 pb-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    内容
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.value}
                        to={item.path}
                        className={`mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] transition ${
                            activeViewMode === item.value
                                ? "bg-slate-100 font-medium text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <span className="w-4 text-center text-sm">
                            {item.symbol}
                        </span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 px-4 py-4">
                <div className="text-sm font-medium text-slate-900">
                    Administrator
                </div>
                <div className="mt-1 text-xs text-slate-500">超级管理员</div>
            </div>
        </aside>
    );
}
