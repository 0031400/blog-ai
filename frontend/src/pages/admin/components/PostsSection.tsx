import type { Dispatch, SetStateAction } from "react";

import type { Post } from "../../../types/post.ts";
import {
    dangerButtonClass,
    inputClass,
    secondaryButtonClass,
    type StatusFilter,
    type ViewMode,
    type VisibilityFilter,
} from "../shared.ts";

type PostsSectionProps = {
    busy: boolean;
    filteredPosts: Post[];
    formatPostDate: (value: string) => string;
    handleRestore: (post: Post) => Promise<void>;
    handleSoftDelete: (post: Post) => Promise<void>;
    keyword: string;
    openEditEditor: (post: Post) => void;
    quickUpdatePost: (
        post: Post,
        patch: Partial<Post>,
        successText: string,
    ) => Promise<void>;
    setKeyword: Dispatch<SetStateAction<string>>;
    setStatusFilter: Dispatch<SetStateAction<StatusFilter>>;
    setVisibilityFilter: Dispatch<SetStateAction<VisibilityFilter>>;
    statusFilter: StatusFilter;
    viewMode: ViewMode;
    visibilityFilter: VisibilityFilter;
};

export function PostsSection({
    busy,
    filteredPosts,
    formatPostDate,
    handleRestore,
    handleSoftDelete,
    keyword,
    openEditEditor,
    quickUpdatePost,
    setKeyword,
    setStatusFilter,
    setVisibilityFilter,
    statusFilter,
    viewMode,
    visibilityFilter,
}: PostsSectionProps) {
    return (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-sm font-medium text-slate-900">
                        文章列表
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        支持草稿/发布、可见性、标签和回收站筛选。
                    </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2 lg:flex">
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="搜索标题、分类、slug、标签"
                        className={`${inputClass} min-w-60`}
                    />
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value as StatusFilter)
                        }
                        className={inputClass}
                    >
                        <option value="all">全部状态</option>
                        <option value="published">已发布</option>
                        <option value="draft">草稿</option>
                    </select>
                    <select
                        value={visibilityFilter}
                        onChange={(event) =>
                            setVisibilityFilter(
                                event.target.value as VisibilityFilter,
                            )
                        }
                        className={inputClass}
                    >
                        <option value="all">全部可见性</option>
                        <option value="public">公开</option>
                        <option value="private">私密</option>
                    </select>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                    <article key={post.id} className="px-4 py-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex min-w-0 gap-3">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-20 w-20 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-slate-600">
                                            {post.category?.name ?? "未分类"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-1 normal-case tracking-normal ${
                                                post.status === "published"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {post.status === "published"
                                                ? "已发布"
                                                : "草稿"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-1 normal-case tracking-normal ${
                                                post.visibility === "public"
                                                    ? "bg-sky-50 text-sky-700"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {post.visibility === "public"
                                                ? "公开"
                                                : "私密"}
                                        </span>
                                        {post.pinned ? (
                                            <span className="rounded-full bg-rose-50 px-2 py-1 normal-case tracking-normal text-rose-700">
                                                置顶
                                            </span>
                                        ) : null}
                                        <span>
                                            {formatPostDate(post.publishedAt)}
                                        </span>
                                    </div>
                                    <h2 className="mt-2 truncate text-base font-semibold text-slate-900">
                                        {post.title}
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {post.excerpt}
                                    </p>
                                    {(post.tags ?? []).length ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(post.tags ?? []).map((tag) => (
                                                <span
                                                    key={`${post.id}-${tag.id}`}
                                                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                                >
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
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
                                                ? "转为草稿"
                                                : "发布"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                quickUpdatePost(
                                                    post,
                                                    {
                                                        visibility:
                                                            post.visibility ===
                                                            "public"
                                                                ? "private"
                                                                : "public",
                                                    },
                                                    post.visibility === "public"
                                                        ? "已设为私密。"
                                                        : "已设为公开。",
                                                )
                                            }
                                            disabled={busy}
                                            className={secondaryButtonClass}
                                        >
                                            {post.visibility === "public"
                                                ? "设为私密"
                                                : "设为公开"}
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
                                    <button
                                        type="button"
                                        onClick={() => handleRestore(post)}
                                        disabled={busy}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 disabled:opacity-60"
                                    >
                                        恢复
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {filteredPosts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                        {viewMode === "recycle"
                            ? "回收站为空。"
                            : "没有匹配的文章。"}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
