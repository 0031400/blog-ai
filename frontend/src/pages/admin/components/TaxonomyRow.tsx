import type { ReactNode } from "react";

export function TaxonomyRow({
    actions,
    meta,
    swatch,
    title,
}: {
    actions: ReactNode;
    meta: string;
    swatch?: string;
    title: string;
}) {
    return (
        <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
                {swatch ? (
                    <span
                        className="h-4 w-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: swatch }}
                    />
                ) : null}
                <div>
                    <div className="text-sm font-medium text-slate-900">
                        {title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{meta}</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">{actions}</div>
        </div>
    );
}
