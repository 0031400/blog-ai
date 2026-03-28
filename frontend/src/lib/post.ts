import type { Post } from "../types/post.ts";

export function normalizePost(post: Post): Post {
    const normalizedTags = Array.isArray(post.tags) ? post.tags : [];

    return {
        ...post,
        categoryId: Number(post.categoryId ?? post.category?.id ?? 0),
        category: post.category ?? null,
        tagIds: Array.isArray(post.tagIds)
            ? post.tagIds
            : normalizedTags.map((tag) => tag.id),
        tags: normalizedTags,
        status: post.status ?? "draft",
        visibility: post.visibility ?? "public",
        pinned: Boolean(post.pinned),
        allowComment: post.allowComment ?? true,
        deleted: Boolean(post.deleted),
    };
}
