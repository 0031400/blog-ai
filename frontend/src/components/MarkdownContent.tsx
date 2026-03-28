import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
    className?: string;
    content: string;
};

export function MarkdownContent({
    className = "",
    content,
}: MarkdownContentProps) {
    return (
        <div className={`max-w-none text-slate-700 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mt-8 text-[2.25rem] font-semibold tracking-[-0.05em] text-slate-950 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="mt-10 text-[1.75rem] font-semibold tracking-[-0.04em] text-slate-950">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-900">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="mt-6 text-[1.1rem] font-semibold text-slate-900">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="mt-4 text-[16px] leading-8 text-slate-700 first:mt-0">
                            {children}
                        </p>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-sky-500 underline decoration-sky-200 underline-offset-4"
                        >
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="mt-4 list-disc space-y-2 pl-6">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mt-4 list-decimal space-y-2 pl-6">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-8 text-slate-700">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="mt-6 border-l-4 border-sky-300 bg-sky-50/50 px-4 py-3 text-slate-600">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, className: codeClassName }) => {
                        const isBlock = Boolean(codeClassName);

                        if (isBlock) {
                            return (
                                <code className="block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-100">
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.92em] text-slate-900">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-950 p-0">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full border-collapse bg-white text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-900">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                            {children}
                        </td>
                    ),
                    hr: () => <hr className="mt-8 border-slate-200" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
