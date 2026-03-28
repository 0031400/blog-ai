import { Link } from "react-router-dom";

import { formatDate } from "../../lib/date";
import { getPostCoverImage } from "../../lib/postCover.ts";
import { calculateReadingStats } from "../../lib/readingStats.ts";
import {
    createCategoryPath,
    createPostPath,
    createTagPath,
} from "../../lib/routes.ts";
import type { Post } from "../../types/post.ts";

type PostListCardProps = {
    post: Post;
};

export function PostListCard({ post }: PostListCardProps) {
    const readingStats = calculateReadingStats(post.content);

    return (
        <article className="fuwari-card relative flex w-full flex-col-reverse overflow-hidden">
            <div className="relative grid gap-4 px-6 py-6 md:grid-cols-[minmax(0,1fr)_17rem] md:px-9 md:pr-3 md:pt-7">
                <div className="min-w-0">
                    <h2 className="mb-3">
                        <Link
                            to={createPostPath(post.slug)}
                            className="fuwari-font-title relative block w-full text-[1.9rem] font-bold tracking-[-0.045em] text-slate-900 transition hover:text-sky-500 md:text-[2rem]"
                        >
                            {post.title}
                        </Link>
                    </h2>

                    <div className="mb-3 flex flex-wrap items-center gap-y-2 text-sm text-slate-400">
                        <span className="mr-4 inline-flex items-center">
                            <span className="fuwari-meta-icon">◫</span>
                            {formatDate(post.publishedAt)}
                        </span>
                        <span className="mr-4 inline-flex items-center before:mr-4 before:text-slate-300 before:content-['/']">
                            ◌{" "}
                            {post.category ? (
                                <Link
                                    to={createCategoryPath(post.category.id)}
                                    className="transition hover:text-sky-500"
                                >
                                    {post.category.name}
                                </Link>
                            ) : (
                                "未分类"
                            )}
                        </span>
                        {(post.tags ?? []).length > 0 ? (
                            <span className="inline-flex items-center before:mr-4 before:text-slate-300 before:content-['/']">
                                #{" "}
                                {(post.tags ?? []).map((tag, index) => (
                                    <span key={tag.id}>
                                        {index > 0 ? " / " : ""}
                                        <Link
                                            to={createTagPath(tag.id)}
                                            className="transition hover:text-sky-500"
                                        >
                                            {tag.name}
                                        </Link>
                                    </span>
                                ))}
                            </span>
                        ) : null}
                    </div>

                    <p className="fuwari-font-reading mb-3.5 text-[16px] leading-8 text-slate-600 md:pr-4">
                        {post.excerpt}
                    </p>

                    <div className="flex gap-4 text-sm text-slate-400">
                        <span>◎ {readingStats.characterCount} 字</span>
                        <span>|</span>
                        <span>◌ 预计 {readingStats.minuteCount} 分钟</span>
                    </div>
                </div>

                <Link
                    to={createPostPath(post.slug)}
                    className="relative mx-1 -mb-1 mt-1 overflow-hidden rounded-2xl bg-slate-100 md:mx-0 md:mb-0 md:mt-0 md:my-3"
                >
                    <img
                        src={getPostCoverImage(post.coverImage)}
                        alt={post.title}
                        className="max-h-[20vh] w-full object-cover md:h-full md:max-h-none"
                    />
                </Link>
            </div>
        </article>
    );
}
