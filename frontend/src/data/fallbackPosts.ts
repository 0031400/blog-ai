import type { Post } from "../types/post.ts";

export const fallbackPosts: Post[] = [
    {
        id: 1,
        title: "把博客当成长期作品来写",
        slug: "write-blog-as-long-term-work",
        excerpt:
            "从选题、结构到复盘，给独立开发者一个可以长期坚持的个人博客写作方法。",
        content:
            "个人博客最有价值的地方，不是发布速度，而是持续积累自己的判断。把文章写成一份长期作品，意味着每次动笔都围绕真实问题、真实经验和真实结论展开。这样写出来的内容，几年后回头看仍然有参考价值。",
        coverImage:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
        categoryId: 1,
        category: {
            id: 1,
            name: "写作",
            slug: "writing",
            description: "",
        },
        tagIds: [1, 2],
        tags: [
            { id: 1, name: "博客", slug: "blog", color: "" },
            { id: 2, name: "写作", slug: "writing", color: "" },
        ],
        readingTime: 6,
        status: "published",
        visibility: "public",
        pinned: true,
        allowComment: true,
        deleted: false,
        publishedAt: "2026-03-24T09:00:00Z",
    },
    {
        id: 2,
        title: "用 Go 和 SQLite 搭一个够用的内容后台",
        slug: "go-sqlite-content-backend",
        excerpt: "不追求过度设计，先把模型、迁移、查询接口和部署方式做稳定。",
        content:
            "小型博客最适合从简单架构开始。Go 提供了直接、可靠的服务端能力，SQLite 则降低了部署和备份成本。先把文章模型、列表接口和初始化流程打通，再逐步加入鉴权、草稿和搜索，是更稳妥的节奏。",
        coverImage:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        categoryId: 2,
        category: {
            id: 2,
            name: "后端",
            slug: "backend",
            description: "",
        },
        tagIds: [3, 4],
        tags: [
            { id: 3, name: "Go", slug: "go", color: "" },
            { id: 4, name: "SQLite", slug: "sqlite", color: "" },
        ],
        readingTime: 8,
        status: "published",
        visibility: "public",
        pinned: false,
        allowComment: true,
        deleted: false,
        publishedAt: "2026-03-19T13:30:00Z",
    },
    {
        id: 3,
        title: "给个人博客做一个舒服的首页信息层级",
        slug: "design-better-blog-homepage-hierarchy",
        excerpt:
            "首页不需要堆满组件，关键是让读者一眼知道你写什么、为什么值得读。",
        content:
            "博客首页应该承担品牌介绍、内容筛选和最新更新三个任务。清晰的首屏、重点文章卡片和精简的文章列表，通常比复杂的瀑布流更有效。设计上先解决信息层级，再考虑装饰细节。",
        coverImage:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        categoryId: 3,
        category: {
            id: 3,
            name: "前端",
            slug: "frontend",
            description: "",
        },
        tagIds: [5, 6],
        tags: [
            { id: 5, name: "React", slug: "react", color: "" },
            { id: 6, name: "设计", slug: "design", color: "" },
        ],
        readingTime: 5,
        status: "draft",
        visibility: "private",
        pinned: false,
        allowComment: false,
        deleted: false,
        publishedAt: "2026-03-11T08:15:00Z",
    },
];
