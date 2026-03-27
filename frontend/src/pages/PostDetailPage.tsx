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
            <section className="wing-widget">
                <div className="wing-widget-title-row">
                    <h3>阅读信息</h3>
                    <span>Meta</span>
                </div>
                <div className="wing-mini-list">
                    <div>
                        <strong>{post ? post.category : "未分类"}</strong>
                        <p>文章分类</p>
                    </div>
                    <div>
                        <strong>
                            {post ? `${post.readingTime} min` : "--"}
                        </strong>
                        <p>预计阅读时间</p>
                    </div>
                    <div>
                        <strong>
                            {post ? formatDate(post.publishedAt) : "--"}
                        </strong>
                        <p>发布时间</p>
                    </div>
                </div>
            </section>

            <section className="wing-widget">
                <div className="wing-widget-title-row">
                    <h3>状态</h3>
                    <span>Sync</span>
                </div>
                <div className="wing-mini-list">
                    <div>
                        <strong>{detailLoading ? "同步中" : "已加载"}</strong>
                        <p>
                            {detailLoading
                                ? "正在请求最新文章内容。"
                                : "当前显示的是可阅读正文。"}
                        </p>
                    </div>
                    <div>
                        <strong>Hash Route</strong>
                        <p>仍然沿用你现有的 `/#/posts/:slug` 路由方式。</p>
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
                    <section className="wing-tabbar">
                        <a
                            href={createHomeHref()}
                            className="wing-tab wing-tab-active"
                        >
                            返回首页
                        </a>
                        <span className="wing-tab wing-tab-static">
                            {detailLoading ? "正在同步" : "文章详情"}
                        </span>
                    </section>

                    {detailError ? (
                        <div className="wing-alert wing-alert-danger">
                            {detailError}
                        </div>
                    ) : null}

                    {post ? (
                        <article className="wing-post-panel">
                            <div className="wing-post-cover">
                                <img src={post.coverImage} alt={post.title} />
                            </div>

                            <div className="wing-post-body">
                                <div className="wing-post-meta">
                                    <span className="wing-tag">
                                        {post.category}
                                    </span>
                                    <span>{formatDate(post.publishedAt)}</span>
                                    <span>{post.readingTime} min read</span>
                                </div>

                                <h1>{post.title}</h1>
                                <p className="wing-post-excerpt">
                                    {post.excerpt}
                                </p>

                                <div className="wing-post-author">
                                    <div className="wing-post-author-avatar">
                                        B
                                    </div>
                                    <div>
                                        <strong>blog-ai</strong>
                                        <p>
                                            {detailLoading
                                                ? "正在同步最新内容..."
                                                : "独立开发 / 技术写作 / 个人博客实验"}
                                        </p>
                                    </div>
                                </div>

                                <div className="wing-post-content">
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
                        <div className="wing-empty-box">
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
