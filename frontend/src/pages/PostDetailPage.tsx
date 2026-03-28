import { createHomeHref } from "../lib/hashRoute";
import { formatDate } from "../lib/date";
import type { Post } from "../types/post";
import { WingLayout } from "../components/WingLayout";

type PostDetailPageProps = {
    detailError: string;
    detailLoading: boolean;
    post: Post | null;
};

export function PostDetailPage({
    detailError,
    detailLoading,
    post,
}: PostDetailPageProps) {
    const rightAside = (
        <>
            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        阅读信息
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Meta
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    {[
                        [post?.category?.name ?? "未分类", "文章分类"],
                        [
                            post ? `${post.readingTime} min` : "--",
                            "预计阅读时间",
                        ],
                        [
                            post ? formatDate(post.publishedAt) : "--",
                            "发布时间",
                        ],
                    ].map(([value, label]) => (
                        <div
                            key={label}
                            className="rounded-xl bg-slate-50 px-3 py-3"
                        >
                            <div className="text-sm font-medium text-slate-900">
                                {value}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        状态
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Sync
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            {detailLoading ? "同步中" : "已加载"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {detailLoading
                                ? "正在请求最新文章内容。"
                                : "当前显示的是可阅读正文。"}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            Hash Route
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            仍然沿用 `/#/posts/:slug` 路由。
                        </p>
                    </div>
                </div>
            </section>
        </>
    );

    return (
        <WingLayout
            rightAside={rightAside}
            main={
                <>
                    <section className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 p-2 shadow-sm">
                        <a
                            href={createHomeHref()}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
                        >
                            返回首页
                        </a>
                        <span className="rounded-xl px-3 py-2 text-sm text-slate-500">
                            {detailLoading ? "正在同步" : "文章详情"}
                        </span>
                    </section>

                    {detailError ? (
                        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {detailError}
                        </div>
                    ) : null}

                    {post ? (
                        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm">
                            <div className="h-52 overflow-hidden md:h-64">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="p-5 md:p-6">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-rose-600">
                                        {post.category?.name ?? "未分类"}
                                    </span>
                                    <span>{formatDate(post.publishedAt)}</span>
                                    <span>{post.readingTime} min read</span>
                                </div>

                                <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.05em] text-slate-900 md:text-[34px]">
                                    {post.title}
                                </h1>
                                <p className="mt-3 text-sm leading-7 text-slate-500">
                                    {post.excerpt}
                                </p>

                                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-sm font-semibold text-white">
                                        B
                                    </div>
                                    <div>
                                        <strong className="text-sm text-slate-900">
                                            blog-ai
                                        </strong>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {detailLoading
                                                ? "正在同步最新内容..."
                                                : "独立开发 / 技术写作 / 个人博客实验"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-4 text-[15px] leading-8 text-slate-700">
                                    {post.content
                                        .split("。")
                                        .map((paragraph) => paragraph.trim())
                                        .filter(Boolean)
                                        .map((paragraph, index) => (
                                            <p key={`${post.slug}-${index}`}>
                                                {paragraph}。
                                            </p>
                                        ))}
                                </div>
                            </div>
                        </article>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-sm text-slate-500">
                            {detailLoading
                                ? "正在加载文章..."
                                : "暂时没有找到这篇文章"}
                        </div>
                    )}
                </>
            }
        />
    );
}
