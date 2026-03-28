import { Link } from "react-router-dom";

import { createHomePath, createPostPath } from "../../../lib/routes.ts";
import type { Post } from "../../../types/post.ts";
import type { ViewMode } from "../shared.ts";
import { viewTitle } from "../shared.ts";

type AdminTopbarProps = {
    editorOpen: boolean;
    onCreatePost: () => void;
    onLogout: () => void;
    selectedPost: Post | null;
    viewMode: ViewMode;
};

export function AdminTopbar({
    editorOpen,
    onCreatePost,
    onLogout,
    selectedPost,
    viewMode,
}: AdminTopbarProps) {
    return (
        <header className="border-b border-slate-200 bg-white px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 md:hidden">
                        ▣
                    </div>
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-3 truncate text-[1.875rem] font-semibold tracking-[-0.05em] text-slate-900">
                            <span className="text-[1.6rem] leading-none">
                                ◫
                            </span>
                            <span>
                                {editorOpen ? "文章" : viewTitle(viewMode)}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to={createHomePath()}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        首页
                    </Link>
                    {selectedPost ? (
                        <Link
                            to={createPostPath(selectedPost.slug)}
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                            预览
                        </Link>
                    ) : null}
                    <button
                        type="button"
                        onClick={onCreatePost}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <span className="text-base leading-none">＋</span>
                        <span>新建</span>
                    </button>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                        退出
                    </button>
                </div>
            </div>
        </header>
    );
}
