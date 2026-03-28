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
                    className="absolute inset-x-0 top-0 h-[16rem] bg-cover bg-center sm:h-[20rem] lg:h-[26rem]"
                    style={{ backgroundImage: `url(${siteMeta.heroImage})` }}
                />
                <div className="absolute inset-x-0 top-0 h-[16rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(234,241,248,0.72)_72%,rgba(236,242,248,0.95))] sm:h-[20rem] lg:h-[26rem]" />

                <BlogTopbar />

                <div className="relative mx-auto max-w-[75rem] px-0 pb-14 pt-20 transition sm:px-4 sm:pt-24 lg:pt-28">
                    <div className="grid w-full grid-cols-1 gap-4 transition lg:grid-cols-[17.5rem_minmax(0,1fr)]">
                        <main className="order-1 min-w-0 space-y-4 lg:order-2 lg:space-y-5">
                            {main}
                        </main>
                        <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-4 lg:self-start">
                            {leftAside}
                        </aside>
                    </div>

                    <footer className="py-10 text-center text-sm text-slate-500">
                        Powered by Halo
                    </footer>
                </div>
            </div>
        </div>
    );
}
