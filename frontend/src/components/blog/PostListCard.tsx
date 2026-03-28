import { Link } from "react-router-dom";

import { formatDate } from "../../lib/date";
import { createPostPath } from "../../lib/routes.ts";
import type { Post } from "../../types/post.ts";

type PostListCardProps = {
    post: Post;
};

export function PostListCard({ post }: PostListCardProps) {
    return (
        <article className="fuwari-card relative flex flex-col-reverse md:flex-row">
            <Link
                to={createPostPath(post.slug)}
                className="grid gap-4 px-6 py-6 md:grid-cols-[minmax(0,1fr)_28%] md:px-9 md:pr-3 md:pt-7"
            >
                <div className="min-w-0">
                    <h2 className="fuwari-title-bar relative mb-3 block w-full text-3xl font-bold tracking-[-0.04em] text-slate-900 transition hover:text-sky-500 md:text-[2rem]">
                        {post.title}
                    </h2>

                    <div className="mb-3 flex flex-wrap items-center gap-y-2 text-sm text-slate-400">
                        <span className="mr-4 inline-flex items-center">
                            <span className="fuwari-meta-icon">◫</span>
                            {formatDate(post.publishedAt)}
                        </span>
                        <span className="mr-4 inline-flex items-center before:mr-4 before:text-slate-300 before:content-['/']">
                            ◌ {post.category?.name ?? "未分类"}
                        </span>
                        {(post.tags ?? []).length > 0 ? (
                            <span className="inline-flex items-center before:mr-4 before:text-slate-300 before:content-['/']">
                                #{" "}
                                {(post.tags ?? [])
                                    .map((tag) => tag.name)
                                    .join(" / ")}
                            </span>
                        ) : null}
                    </div>

                    <p className="mb-3.5 pr-4 text-[15px] leading-8 text-slate-600">
                        {post.excerpt}
                    </p>

                    <div className="flex gap-4 text-sm text-slate-400">
                        <span>◎ {Math.max(post.readingTime * 218, 656)}</span>
                        <span>|</span>
                        <span>◌ {Math.max(post.readingTime * 2, 3)}</span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-slate-100 md:my-3">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-52.5 w-full object-cover"
                    />
                </div>
            </Link>
        </article>
    );
}
