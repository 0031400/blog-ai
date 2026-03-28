import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

import { adminPath, homePath } from "../lib/routes.ts";

type WingLayoutProps = {
    main: ReactNode;
    rightAside: ReactNode;
};

const panelClass =
    "rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm";

export function WingLayout({ main, rightAside }: WingLayoutProps) {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f3f4f6_100%)] text-slate-800">
            <div className="mx-auto w-full max-w-340 px-3 py-3 md:px-4 md:py-4">
                <div className="rounded-[28px] border border-white/80 bg-white/55 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-4">
                    <header className="mb-3 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-5">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                                Long Form Notes
                            </p>
                            <Link
                                to={homePath}
                                className="mt-1 inline-block text-[26px] font-semibold tracking-[-0.04em] text-slate-900"
                            >
                                blog-ai
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 md:w-90">
                            <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                <input
                                    type="text"
                                    placeholder="搜索内容..."
                                    readOnly
                                    aria-label="搜索内容"
                                    className="w-full border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                                />
                                <span className="text-xs">⌕</span>
                            </div>
                            <button
                                type="button"
                                aria-label="主题切换占位"
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                            </button>
                        </div>
                    </header>

                    <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
                        <aside className="space-y-3">
                            <nav className={`${panelClass} p-2`}>
                                <NavLink
                                    to={homePath}
                                    className={({ isActive }) =>
                                        `block rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-rose-50 font-medium text-rose-600" : "text-slate-600 hover:bg-slate-50"}`
                                    }
                                    end
                                >
                                    文章
                                </NavLink>
                                <Link
                                    to={homePath}
                                    className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                >
                                    笔记
                                </Link>
                                <NavLink
                                    to={adminPath}
                                    className={({ isActive }) =>
                                        `mt-1 block rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-rose-50 text-rose-600" : "text-slate-600 hover:bg-slate-50"}`
                                    }
                                >
                                    写文章
                                </NavLink>
                            </nav>

                            <section
                                className={`${panelClass} overflow-hidden`}
                            >
                                <div className="h-20 bg-[linear-gradient(135deg,#fb7185,#f59e0b)]" />
                                <div className="px-4 pb-4">
                                    <div className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-sm font-semibold text-white">
                                        B
                                    </div>
                                    <h2 className="mt-2 text-base font-semibold text-slate-900">
                                        blog-ai
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        一个把
                                        Go、写作和独立开发过程持续记录下来的个人博客。
                                    </p>

                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {[
                                            ["12", "Like"],
                                            ["3", "Posts"],
                                            ["1.2K", "Views"],
                                        ].map(([value, label]) => (
                                            <div
                                                key={label}
                                                className="rounded-xl bg-slate-50 px-2 py-2 text-center"
                                            >
                                                <div className="text-sm font-semibold text-slate-900">
                                                    {value}
                                                </div>
                                                <div className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                                                    {label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Link
                                            to={homePath}
                                            className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-center text-sm text-slate-600"
                                        >
                                            主页
                                        </Link>
                                        <Link
                                            to={adminPath}
                                            className="flex-1 rounded-full bg-rose-500 px-3 py-2 text-center text-sm text-white"
                                        >
                                            发布
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </aside>

                        <main className="min-w-0">{main}</main>

                        <aside className="space-y-3">{rightAside}</aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
