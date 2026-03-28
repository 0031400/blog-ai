export type PostFormValues = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    categoryId: string;
    tagIds: number[];
    readingTime: string;
    status: "draft" | "published";
    visibility: "public" | "private";
    pinned: boolean;
    allowComment: boolean;
    deleted: boolean;
    publishedAt: string;
};
