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
        <section className="fuwari-card-soft px-4 py-5">
            <h3 className="fuwari-font-title relative ml-4 flex items-center gap-3 text-lg font-bold tracking-[-0.02em] text-slate-900">
                <span className="absolute -left-4 top-1 inline-block h-4 w-1 rounded-full bg-sky-400" />
                <span>{title}</span>
            </h3>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export function BlogSidebar({ categories, tags }: BlogSidebarProps) {
    return (
        <>
            <section className="fuwari-card-soft">
                <div className="p-4">
                    <div className="overflow-hidden rounded-3xl bg-amber-200">
                        <img
                            src={siteMeta.author.avatar}
                            alt={siteMeta.author.name}
                            className="h-65 w-full object-cover"
                        />
                    </div>
                </div>
                <div className="px-4 pb-5 text-center">
                    <div className="fuwari-font-title text-xl font-bold tracking-[-0.03em] text-slate-950">
                        {siteMeta.author.name}
                    </div>
                    <div className="mx-auto mt-3 h-1 w-5 rounded-full bg-sky-400" />
                    <div className="fuwari-font-ui mx-auto mt-3 max-w-[13rem] text-sm leading-6 text-slate-400">
                        {siteMeta.author.tagline}
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <span className="fuwari-btn-regular h-10 w-10">◎</span>
                        <span className="fuwari-btn-regular h-10 w-10">◇</span>
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
                            <span className="fuwari-tag min-w-9 justify-center px-2.5 py-1 text-sm font-bold">
                                {category.count}
                            </span>
                        </div>
                    ))}
                </div>
            </SidebarCard>

            <SidebarCard title="标签">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span key={tag} className="fuwari-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            </SidebarCard>
        </>
    );
}
