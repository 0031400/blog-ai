export const siteMeta = {
    title: import.meta.env.VITE_SITE_TITLE ?? "lxz07' blog",
    heroImage:
        import.meta.env.VITE_SITE_HERO_IMAGE ??
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80",
    author: {
        name: import.meta.env.VITE_SITE_AUTHOR_NAME ?? "lxz07",
        tagline:
            import.meta.env.VITE_SITE_AUTHOR_TAGLINE ??
            "独立开发 / 技术写作 / 设计记录",
        avatar:
            import.meta.env.VITE_SITE_AUTHOR_AVATAR ??
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    },
} as const;
