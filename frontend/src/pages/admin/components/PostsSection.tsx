import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import type { Post } from "../../../types/post.ts";
import {
    adminPanelClass,
    dangerButtonClass,
    inputClass,
    secondaryButtonClass,
    type StatusFilter,
    type ViewMode,
} from "../shared.ts";

type PostsSectionProps = {
    allSelected: boolean;
    batchRecycle: () => Promise<void>;
    batchToDraft: () => Promise<void>;
    busy: boolean;
    currentPage: number;
    filteredPosts: Post[];
    handlePermanentDelete: (post: Post) => Promise<void>;
    handleRestore: (post: Post) => Promise<void>;
    handleSoftDelete: (post: Post) => Promise<void>;
    keyword: string;
    onPageChange: Dispatch<SetStateAction<number>>;
    openEditEditor: (post: Post) => void;
    postsPerPage: number;
    quickUpdatePost: (
        post: Post,
        patch: Partial<Post>,
        successText: string,
    ) => Promise<void>;
    selectedPostIds: number[];
    setKeyword: Dispatch<SetStateAction<string>>;
    setStatusFilter: Dispatch<SetStateAction<StatusFilter>>;
    statusFilter: StatusFilter;
    totalItems: number;
    totalPages: number;
    toggleAll: () => void;
    togglePostSelection: (postId: number) => void;
    viewMode: ViewMode;
};

export function PostsSection({
    allSelected,
    batchRecycle,
    batchToDraft,
    busy,
    currentPage,
    filteredPosts,
    handlePermanentDelete,
    handleRestore,
    handleSoftDelete,
    keyword,
    onPageChange,
    openEditEditor,
    postsPerPage,
    quickUpdatePost,
    selectedPostIds,
    setKeyword,
    setStatusFilter,
    statusFilter,
    totalItems,
    totalPages,
    toggleAll,
    togglePostSelection,
    viewMode,
}: PostsSectionProps) {
    const hasSelection = selectedPostIds.length > 0;
    const [pageInput, setPageInput] = useState(String(currentPage));

    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

    const submitPage = () => {
        const nextPage = Number(pageInput);
        if (!Number.isInteger(nextPage) || nextPage < 1) {
            setPageInput(String(currentPage));
            return;
        }

        onPageChange(Math.min(nextPage, totalPages));
    };

    return (
        <section className={adminPanelClass}>
            <div className="border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="hidden lg:block">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-4 w-4 rounded border-slate-300"
                                />
                            </label>
                        </div>
                        <input
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="输入关键词搜索"
                            className={`${inputClass} min-w-60 max-w-xs bg-white`}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as StatusFilter,
                                )
                            }
                            className="rounded-xl border border-transparent bg-transparent px-3 py-2 text-slate-700 outline-none hover:border-slate-200 hover:bg-white"
                        >
                            <option value="all">状态: 全部</option>
                            <option value="published">状态: 已发布</option>
                            <option value="draft">状态: 草稿</option>
                        </select>
                        <button
                            type="button"
                            className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                            ↻
                        </button>
                    </div>
                </div>
                {viewMode === "posts" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <button
                            type="button"
                            onClick={() => {
                                void batchToDraft();
                            }}
                            disabled={busy || !hasSelection}
                            className={secondaryButtonClass}
                        >
                            批量转草稿
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                void batchRecycle();
                            }}
                            disabled={busy || !hasSelection}
                            className={dangerButtonClass}
                        >
                            批量回收
                        </button>
                        <span className="text-slate-500">
                            已选择 {selectedPostIds.length} 篇
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="hidden grid-cols-[minmax(0,1fr)_360px] gap-4 border-b border-slate-200 bg-slate-50/60 px-6 py-4 text-sm font-medium text-slate-500 lg:grid">
                <div>文章</div>
                <div className="text-right">操作</div>
            </div>

            <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                    <article
                        key={post.id}
                        className="px-4 py-4 transition hover:bg-slate-50/70 lg:px-6"
                    >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                            <div className="flex min-w-0 gap-4">
                                <div className="hidden pt-1 lg:block">
                                    <input
                                        type="checkbox"
                                        checked={selectedPostIds.includes(
                                            post.id,
                                        )}
                                        onChange={() =>
                                            togglePostSelection(post.id)
                                        }
                                        className="h-4 w-4 rounded border-slate-300"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400"></div>
                                    <h2 className="mt-1 truncate text-lg font-medium text-slate-900">
                                        {post.title}
                                    </h2>
                                </div>
                            </div>

                            <div className="flex flex-nowrap justify-start gap-2 overflow-x-auto lg:justify-end">
                                {!post.deleted ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => openEditEditor(post)}
                                            className={secondaryButtonClass}
                                        >
                                            编辑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quickUpdatePost(
                                                    post,
                                                    {
                                                        status:
                                                            post.status ===
                                                            "published"
                                                                ? "draft"
                                                                : "published",
                                                    },
                                                    post.status === "published"
                                                        ? "已转为草稿。"
                                                        : "已发布。",
                                                )
                                            }
                                            disabled={busy}
                                            className={secondaryButtonClass}
                                        >
                                            {post.status === "published"
                                                ? "转草稿"
                                                : "发布"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSoftDelete(post)
                                            }
                                            disabled={busy}
                                            className={dangerButtonClass}
                                        >
                                            回收
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleRestore(post)}
                                            disabled={busy}
                                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 disabled:opacity-60"
                                        >
                                            恢复
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePermanentDelete(post)
                                            }
                                            disabled={busy}
                                            className={dangerButtonClass}
                                        >
                                            删除
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {filteredPosts.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-slate-500">
                        {viewMode === "recycle"
                            ? "回收站为空。"
                            : "没有匹配的文章。"}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <div>共 {totalItems} 项数据</div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            onPageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage <= 1}
                        className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            onPageChange(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage >= totalPages}
                        className="rounded-md border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                    >
                        ›
                    </button>
                    <div className="flex items-center gap-2">
                        <input
                            value={pageInput}
                            onChange={(event) =>
                                setPageInput(
                                    event.target.value.replace(/\D/g, ""),
                                )
                            }
                            onBlur={submitPage}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    submitPage();
                                }
                            }}
                            className="w-14 rounded-md border border-slate-200 px-2 py-1 text-center text-slate-700 outline-none"
                        />
                        <span>/ {totalPages} 页</span>
                    </div>
                    <div>{postsPerPage} 条 / 页</div>
                </div>
            </div>
        </section>
    );
}
