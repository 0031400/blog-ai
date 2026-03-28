import { siteMeta } from "../../data/site.ts";

type BlogSidebarProps = {
    categories: Array<{ count: number; name: string }>;
    tags: string[];
};

function SidebarCard({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) {
    return (
        <section className="rounded-[26px] bg-white px-4 py-5 shadow-[0_10px_28px_rgba(96,121,148,0.10)]">
            <h3 className="flex items-center gap-3 text-[16px] font-semibold text-slate-900">
                <span className="inline-block h-6 w-1 rounded-full bg-sky-400" />
                <span>{title}</span>
            </h3>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export function BlogSidebar({ categories, tags }: BlogSidebarProps) {
    return (
        <>
            <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_28px_rgba(96,121,148,0.12)]">
                <div className="p-4">
                    <div className="overflow-hidden rounded-[24px] bg-[#f4d99d]">
                        <img
                            src={siteMeta.author.avatar}
                            alt={siteMeta.author.name}
                            className="h-[260px] w-full object-cover"
                        />
                    </div>
                </div>
                <div className="px-4 pb-5 text-center">
                    <div className="text-[18px] font-semibold text-slate-950">
                        {siteMeta.author.name}
                    </div>
                    <div className="mx-auto mt-3 h-1 w-8 rounded-full bg-sky-400" />
                    <div className="mt-3 text-sm leading-6 text-slate-500">
                        {siteMeta.author.tagline}
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                            ◎
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                            ◇
                        </span>
                    </div>
                </div>
            </section>

            <SidebarCard title="分类目录">
                <div className="space-y-4">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="flex items-center justify-between text-[15px] text-slate-700"
                        >
                            <span>{category.name}</span>
                            <span className="rounded-xl bg-sky-50 px-3 py-1 text-sm font-medium text-sky-500">
                                {category.count}
                            </span>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            <SidebarCard title="标签">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-500"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </SidebarCard>
        </>
    );
}
