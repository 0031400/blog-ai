import type { ReactNode } from "react";

export function TaxonomyFormCard({
    children,
    title,
}: {
    children: ReactNode;
    title: string;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}
