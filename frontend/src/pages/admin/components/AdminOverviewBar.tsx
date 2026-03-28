type AdminOverviewBarProps = {
    drafts: number;
    published: number;
    recycled: number;
    total: number;
};

export function AdminOverviewBar({
    drafts,
    published,
    recycled,
    total,
}: AdminOverviewBarProps) {
    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-px bg-slate-200 md:grid-cols-4">
                {[
                    ["总文章", total],
                    ["已发布", published],
                    ["草稿", drafts],
                    ["回收站", recycled],
                ].map(([label, value]) => (
                    <div key={label} className="bg-white px-5 py-4">
                        <div className="text-xs font-medium text-slate-400">
                            {label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
