import type { ReactNode } from "react";

export function TaxonomyFormCard({
    children,
    title,
}: {
    children: ReactNode;
    title: string;
}) {
    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 text-base font-semibold text-slate-900">
                {title}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}
