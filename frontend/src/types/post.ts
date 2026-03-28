import type { Category } from "./category";
import type { Tag } from "./tag";

export type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    categoryId: number;
    category: Category | null;
    tagIds: number[];
    tags: Tag[];
    readingTime: number;
    status: "draft" | "published";
    visibility: "public" | "private";
    pinned: boolean;
    allowComment: boolean;
    deleted: boolean;
    publishedAt: string;
    createdAt?: string;
    updatedAt?: string;
};
