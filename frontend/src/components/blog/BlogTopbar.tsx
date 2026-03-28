import { Link, NavLink } from "react-router-dom";

import { createAdminPath, homePath } from "../../lib/routes.ts";
import { siteMeta } from "../../data/site.ts";

export function BlogTopbar() {
    return (
        <header className="relative z-10 mx-auto max-w-[75rem] px-0 pt-0 transition sm:px-4 sm:pt-5">
            <div className="fuwari-card flex items-center justify-between gap-3 rounded-none bg-white/95 px-4 py-3 backdrop-blur sm:rounded-[var(--radius-large)] sm:px-5 sm:py-4 md:px-8">
                <Link
                    to={homePath}
                    className="fuwari-font-title flex min-w-0 items-center gap-3 text-[16px] font-semibold tracking-[-0.03em] text-sky-500 sm:text-[17px]"
                >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-sky-400 text-sm font-bold">
                        ⌂
                    </span>
                    <span className="truncate">{siteMeta.title}</span>
                </Link>

                <nav className="fuwari-font-ui hidden flex-wrap items-center gap-8 text-[15px] font-semibold text-slate-700 md:flex">
                    <NavLink
                        to={homePath}
                        end
                        className={({ isActive }) =>
                            isActive
                                ? "text-slate-950"
                                : "transition hover:text-slate-950"
                        }
                    >
                        首页
                    </NavLink>
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden min-w-[10.5rem] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-400 lg:flex">
                        <span>⌕</span>
                        <span>搜索文章...</span>
                    </div>
                    <button
                        type="button"
                        className="fuwari-btn-plain h-10 w-10 text-lg"
                    >
                        ◐
                    </button>
                    <Link
                        to={createAdminPath()}
                        className="fuwari-btn-plain h-10 px-3 text-sm sm:px-4"
                    >
                        管理面板
                    </Link>
                </div>
            </div>
        </header>
    );
}
