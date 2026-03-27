export type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    tags: string[];
    readingTime: number;
    status: "draft" | "published";
    visibility: "public" | "private";
    pinned: boolean;
    allowComment: boolean;
    deleted: boolean;
    publishedAt: string;
};
