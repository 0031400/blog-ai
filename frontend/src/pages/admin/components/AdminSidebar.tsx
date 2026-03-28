import type { ReactElement } from "react";
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

type SidebarIconProps = {
    className?: string;
};

function SearchIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

function PostsIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <rect x="4" y="3.5" width="16" height="17" rx="2" />
            <path d="M9 3.5v17" />
            <path d="M12.5 8h4" />
            <path d="M12.5 12h4" />
        </svg>
    );
}

function RecycleIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M8 7h8" />
            <path d="M10 4.5h4" />
            <path d="M6 7.5h12l-1 11a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8z" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
        </svg>
    );
}

function CategoryIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4 7.5h16" />
            <path d="M7.5 4v16" />
            <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
    );
}

function TagIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M11 4H6a2 2 0 0 0-2 2v5l8.5 8.5a2.1 2.1 0 0 0 3 0l4-4a2.1 2.1 0 0 0 0-3z" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

function ProfileIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
    );
}

function LogoutIcon({ className = "" }: Readonly<SidebarIconProps>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M10 6H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
            <path d="M13 16l4-4-4-4" />
            <path d="M17 12H9" />
        </svg>
    );
}

const navItems: Array<{
    icon: (props: Readonly<SidebarIconProps>) => ReactElement;
    label: string;
    path: string;
    value: ViewMode;
}> = [
    { label: "文章", path: createAdminPath(), icon: PostsIcon, value: "posts" },
    {
        label: "回收站",
        path: createAdminRecyclePath(),
        icon: RecycleIcon,
        value: "recycle",
    },
    {
        label: "分类",
        path: createAdminCategoriesPath(),
        icon: CategoryIcon,
        value: "categories",
    },
    {
        label: "标签",
        path: createAdminTagsPath(),
        icon: TagIcon,
        value: "tags",
    },
];

export function AdminSidebar({ activeViewMode }: AdminSidebarProps) {
    return (
        <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col">
            <div className="flex justify-center border-b border-slate-200 px-6 py-5">
                <Link
                    to={createHomePath()}
                    className="text-[2.75rem] font-semibold tracking-[-0.06em] text-sky-600"
                >
                    Halo
                </Link>
            </div>

            <div className="px-3 py-4">
                <div className="flex items-center gap-2 rounded bg-slate-100 px-3 py-2.5 text-sm text-slate-400 transition hover:text-slate-900">
                    <SearchIcon className="h-4 w-4" />
                    <span className="text-[15px] font-normal">搜索</span>
                    <span className="ml-auto text-xs text-slate-400">
                        Ctrl+K
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-4">
                <div className="px-3 pb-2 text-sm font-medium text-slate-400">
                    内容
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.value}
                        to={item.path}
                        className={`mt-1 flex items-center gap-3 rounded-md px-4 py-3 text-[15px] transition ${
                            activeViewMode === item.value
                                ? "relative bg-slate-100 font-medium text-slate-900 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">
                            Administrator
                        </div>
                        <div className="mt-1 inline-flex rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                            超级管理员
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                        <button
                            type="button"
                            className="transition hover:text-slate-900"
                        >
                            <ProfileIcon className="h-[18px] w-[18px]" />
                        </button>
                        <button
                            type="button"
                            className="transition hover:text-slate-900"
                        >
                            <LogoutIcon className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
