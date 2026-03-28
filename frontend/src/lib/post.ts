import type { Post } from "../types/post.ts";

export function normalizePost(post: Post): Post {
    const normalizedTags = Array.isArray(post.tags) ? post.tags : [];

    return {
        ...post,
        category: post.category ?? null,
        tags: normalizedTags,
        status: post.status ?? "draft",
        visibility: post.visibility ?? "public",
        pinned: Boolean(post.pinned),
        allowComment: post.allowComment ?? true,
        deleted: Boolean(post.deleted),
    };
}
