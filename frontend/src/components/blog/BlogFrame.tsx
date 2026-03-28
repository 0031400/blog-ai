import type { ReactNode } from "react";

import { siteMeta } from "../../data/site.ts";
import { BlogTopbar } from "./BlogTopbar.tsx";

type BlogFrameProps = {
    leftAside: ReactNode;
    main: ReactNode;
};

export function BlogFrame({ leftAside, main }: BlogFrameProps) {
    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-slate-800">
            <div className="relative overflow-hidden">
                <div
                    className="absolute inset-x-0 top-0 h-[65vh] bg-cover bg-center"
                    style={{ backgroundImage: `url(${siteMeta.heroImage})` }}
                />
                <div className="absolute inset-x-0 top-0 h-[65vh] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(234,241,248,0.72)_72%,rgba(236,242,248,0.95))]" />

                <BlogTopbar />

                <div className="relative mx-auto max-w-[75rem] px-4 pb-14 pt-28 md:px-4 lg:pt-32">
                    <div className="grid gap-4 lg:grid-cols-[17.5rem_minmax(0,1fr)]">
                        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                            {leftAside}
                        </aside>
                        <main className="min-w-0 space-y-5">{main}</main>
                    </div>

                    <footer className="py-10 text-center text-sm text-slate-500">
                        Powered by Halo
                    </footer>
                </div>
            </div>
        </div>
    );
}
