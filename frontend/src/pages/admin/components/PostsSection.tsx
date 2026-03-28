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
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="输入关键词搜索"
                        className={`${inputClass} min-w-60 max-w-xs bg-white`}
                    />
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value as StatusFilter)
                            }
                            className="rounded-xl border border-transparent bg-transparent px-3 py-2 text-slate-700 outline-none hover:border-slate-200 hover:bg-white"
                        >
                            <option value="all">状态: 全部</option>
                            <option value="published">状态: 已发布</option>
                            <option value="draft">状态: 草稿</option>
                        </select>
                        <select
                            value={visibilityFilter}
                            onChange={(event) =>
                                setVisibilityFilter(
                                    event.target.value as VisibilityFilter,
                                )
                            }
                            className="rounded-xl border border-transparent bg-transparent px-3 py-2 text-slate-700 outline-none hover:border-slate-200 hover:bg-white"
                        >
                            <option value="all">可见性: 全部</option>
                            <option value="public">可见性: 公开</option>
                            <option value="private">可见性: 私密</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="hidden grid-cols-[minmax(0,1.7fr)_130px_130px_120px_170px] gap-4 border-b border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-500 lg:grid">
                <div>文章</div>
                <div>分类</div>
                <div>状态</div>
                <div>发布时间</div>
                <div className="text-right">操作</div>
            </div>

            <div className="divide-y divide-slate-100">
                {filteredPosts.map((post) => (
                    <article key={post.id} className="px-4 py-4 lg:px-6">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_130px_130px_120px_170px] lg:items-center">
                            <div className="flex min-w-0 gap-4">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-16 w-16 rounded-xl object-cover"
                                />
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                        <span className="truncate font-medium uppercase tracking-[0.14em]">
                                            {post.slug}
                                        </span>
                                        {post.pinned ? (
                                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
                                                置顶
                                            </span>
                                        ) : null}
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                                            {post.visibility === "public"
                                                ? "公开"
                                                : "私密"}
                                        </span>
                                    </div>
                                    <h2 className="mt-1 truncate text-base font-semibold text-slate-900">
                                        {post.title}
                                    </h2>
                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                        {post.excerpt}
                                    </p>
                                    {(post.tags ?? []).length ? (
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {(post.tags ?? []).map((tag) => (
                                                <span
                                                    key={`${post.id}-${tag.id}`}
                                                    className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600"
                                                >
                                                    #{tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="text-sm text-slate-700">
                                {post.category?.name ?? "未分类"}
                            </div>

                            <div>
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        post.status === "published"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    {post.status === "published"
                                        ? "已发布"
                                        : "草稿"}
                                </span>
                            </div>

                            <div className="text-sm text-slate-500">
                                {formatPostDate(post.publishedAt)}
                            </div>

                            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
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
                                                ? "私密"
                                                : "公开"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSoftDelete(post)}
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
                    <div className="px-4 py-10 text-center text-sm text-slate-500">
                        {viewMode === "recycle"
                            ? "回收站为空。"
                            : "没有匹配的文章。"}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
