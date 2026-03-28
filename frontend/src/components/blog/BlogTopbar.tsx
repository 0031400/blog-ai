import { Link, NavLink } from "react-router-dom";

import { createAdminPath, homePath } from "../../lib/routes.ts";
import { siteMeta } from "../../data/site.ts";

export function BlogTopbar() {
    return (
        <header className="relative z-10 mx-auto max-w-[75rem] px-4 pt-5">
            <div className="fuwari-card flex flex-col gap-4 bg-white/95 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
                <Link
                    to={homePath}
                    className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.03em] text-sky-500"
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-sky-400 text-sm font-bold">
                        ⌂
                    </span>
                    <span>{siteMeta.title}</span>
                </Link>

                <nav className="flex flex-wrap items-center gap-8 text-[15px] font-semibold text-slate-700">
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
                    <a
                        href="#archives"
                        className="transition hover:text-slate-950"
                    >
                        归档
                    </a>
                    <a
                        href="#about"
                        className="transition hover:text-slate-950"
                    >
                        关于
                    </a>
                    <a
                        href="#links"
                        className="transition hover:text-slate-950"
                    >
                        友链
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <div className="flex min-w-[10.5rem] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-400">
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
                        className="fuwari-btn-plain h-10 px-4 text-sm"
                    >
                        写作
                    </Link>
                </div>
            </div>
        </header>
    );
}
