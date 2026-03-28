import type { ReactNode } from "react";

import { siteMeta } from "../../data/site.ts";
import { BlogTopbar } from "./BlogTopbar.tsx";

type BlogFrameProps = {
    leftAside: ReactNode;
    main: ReactNode;
};

export function BlogFrame({ leftAside, main }: BlogFrameProps) {
    return (
        <div className="min-h-screen bg-[#eaf1f8] text-slate-800">
            <div className="relative overflow-hidden">
                <div
                    className="absolute inset-x-0 top-0 h-[420px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${siteMeta.heroImage})` }}
                />
                <div className="absolute inset-x-0 top-0 h-[420px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(234,241,248,0.72))]" />

                <BlogTopbar />

                <div className="relative mx-auto max-w-[1160px] px-4 pb-12 pt-[150px] md:px-6">
                    <div className="grid gap-5 lg:grid-cols-[288px_minmax(0,1fr)]">
                        <aside className="space-y-5">{leftAside}</aside>
                        <main className="min-w-0 space-y-5">{main}</main>
                    </div>
                </div>
            </div>
        </div>
    );
}
