import { Link } from "react-router-dom";

import { formatDate } from "../../lib/date";
import { createPostPath } from "../../lib/routes.ts";
import type { Post } from "../../types/post.ts";

type PostListCardProps = {
    post: Post;
};

export function PostListCard({ post }: PostListCardProps) {
    return (
        <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_12px_28px_rgba(96,121,148,0.12)]">
            <Link
                to={createPostPath(post.slug)}
                className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_260px] md:px-7"
            >
                <div className="min-w-0">
                    <h2 className="flex items-center gap-3 text-[24px] font-semibold tracking-[-0.04em] text-slate-950 md:text-[28px]">
                        <span className="inline-block h-8 w-1 rounded-full bg-sky-400" />
                        <span className="truncate">{post.title}</span>
                    </h2>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-500">
                            ◫ {formatDate(post.publishedAt)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            ◌ {post.category?.name ?? "未分类"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                            # {(post.tags ?? []).map((tag) => tag.name).join(" / ")}
                        </span>
                    </div>

                    <p className="mt-5 line-clamp-3 text-[15px] leading-8 text-slate-600">
                        {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center gap-5 text-sm text-slate-400">
                        <span>◎ {Math.max(post.readingTime * 218, 656)}</span>
                        <span>|</span>
                        <span>◌ {Math.max(post.readingTime * 2, 3)}</span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[24px] bg-slate-100">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-[210px] w-full object-cover"
                    />
                </div>
            </Link>
        </article>
    );
}
