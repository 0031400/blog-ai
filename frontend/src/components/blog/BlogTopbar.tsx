import { Link, NavLink } from "react-router-dom";

import { createAdminPath, homePath } from "../../lib/routes.ts";
import { siteMeta } from "../../data/site.ts";

export function BlogTopbar() {
    return (
        <header className="relative z-10 mx-auto max-w-[1160px] px-4 pt-5 md:px-6">
            <div className="flex flex-col gap-4 rounded-[28px] bg-white/96 px-5 py-4 shadow-[0_14px_40px_rgba(74,103,140,0.14)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
                <Link
                    to={homePath}
                    className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.03em] text-sky-500"
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky-400 text-sm">
                        ⌂
                    </span>
                    <span>{siteMeta.title}</span>
                </Link>

                <nav className="flex flex-wrap items-center gap-6 text-[15px] font-medium text-slate-700">
                    <NavLink
                        to={homePath}
                        end
                        className={({ isActive }) =>
                            isActive ? "text-slate-950" : "hover:text-slate-950"
                        }
                    >
                        首页
                    </NavLink>
                    <a href="#archives" className="hover:text-slate-950">
                        归档
                    </a>
                    <a href="#about" className="hover:text-slate-950">
                        关于
                    </a>
                    <a href="#links" className="hover:text-slate-950">
                        友链
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <div className="flex min-w-[180px] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-400">
                        <span>⌕</span>
                        <span>搜索文章...</span>
                    </div>
                    <Link
                        to={createAdminPath()}
                        className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                    >
                        写作
                    </Link>
                </div>
            </div>
        </header>
    );
}
