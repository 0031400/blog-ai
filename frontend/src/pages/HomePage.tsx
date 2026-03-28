import { createAdminHref, createPostHref } from "../lib/hashRoute";
import { formatDate } from "../lib/date";
import type { Post } from "../types/post";
import { WingLayout } from "../components/WingLayout";

type HomePageProps = {
    error: string;
    featuredPost: Post | undefined;
    latestPosts: Post[];
    loading: boolean;
};

function ArticleCard({
    post,
    featured = false,
}: {
    post: Post;
    featured?: boolean;
}) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
            <a
                href={createPostHref(post.slug)}
                className={`grid items-start gap-4 ${featured ? "md:grid-cols-[minmax(0,1fr)_220px]" : "md:grid-cols-[minmax(0,1fr)_160px]"}`}
            >
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium normal-case tracking-normal text-rose-600">
                            {post.category?.name ?? "未分类"}
                        </span>
                        <span>
                            {formatDate(post.publishedAt)} · {post.readingTime}{" "}
                            min
                        </span>
                    </div>
                    <h3
                        className={`mt-3 font-semibold tracking-[-0.03em] text-slate-900 ${featured ? "text-2xl" : "text-lg"}`}
                    >
                        {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {post.excerpt}
                    </p>
                    <div className="mt-3 text-sm font-medium text-rose-600">
                        阅读全文
                    </div>
                </div>
                <div
                    className={`overflow-hidden rounded-xl ${featured ? "h-40 md:h-full" : "h-28"}`}
                >
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            </a>
        </article>
    );
}

export function HomePage({
    error,
    featuredPost,
    latestPosts,
    loading,
}: HomePageProps) {
    const rightAside = (
        <>
            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        精选文章
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Feature
                    </span>
                </div>
                {featuredPost ? (
                    <a
                        href={createPostHref(featuredPost.slug)}
                        className="mt-3 block overflow-hidden rounded-xl border border-slate-200"
                    >
                        <div className="h-36">
                            <img
                                src={featuredPost.coverImage}
                                alt={featuredPost.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                                {featuredPost.category?.name ?? "未分类"}
                            </div>
                            <div className="mt-2 text-base font-semibold tracking-[-0.03em] text-slate-900">
                                {featuredPost.title}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {featuredPost.excerpt}
                            </p>
                        </div>
                    </a>
                ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                        暂无精选文章
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                        站点状态
                    </h3>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        Status
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            Go + React
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            保留现有接口驱动和 hash 路由。
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            Wing 风格
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            布局、卡片和边栏压缩到更接近主题的密度。
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                        <div className="text-sm font-medium text-slate-900">
                            {loading ? "同步中" : "已就绪"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            {loading
                                ? "正在拉取后端内容。"
                                : "可以继续细化后台和详情页。"}
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
                            href="/#/"
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
                        >
                            文章
                        </a>
                        <a
                            href="/#/"
                            className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                            笔记
                        </a>
                        <a
                            href={createAdminHref()}
                            className="ml-auto rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        >
                            写新文章
                        </a>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                    Homepage
                                </span>
                                <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-slate-900 md:text-[34px]">
                                    更接近 Wing 的三栏博客首页
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    收紧字号、边距和圆角，只保留左侧信息、中间文章流、右侧辅助栏这三个主要区域。
                                </p>
                            </div>
                            {featuredPost ? (
                                <a
                                    href={createPostHref(featuredPost.slug)}
                                    className="rounded-full bg-rose-500 px-4 py-2 text-sm text-white"
                                >
                                    进入精选文章
                                </a>
                            ) : null}
                        </div>

                        {error ? (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-4 space-y-3">
                            {featuredPost ? (
                                <ArticleCard post={featuredPost} featured />
                            ) : null}
                            {latestPosts.map((post) => (
                                <ArticleCard key={post.id} post={post} />
                            ))}
                        </div>

                        {!featuredPost && latestPosts.length === 0 ? (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                                暂时没有文章内容
                            </div>
                        ) : null}
                    </section>
                </>
            }
        />
    );
}
