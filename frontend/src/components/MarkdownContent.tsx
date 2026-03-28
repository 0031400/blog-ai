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
        <div
            className={`fuwari-font-reading max-w-none text-slate-700 ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="fuwari-font-title mt-10 text-3xl font-bold tracking-[-0.05em] text-slate-950 first:mt-0 md:text-4xl">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="fuwari-font-title mt-12 flex items-center gap-3 text-2xl font-bold tracking-[-0.04em] text-slate-950 md:text-3xl">
                            <span className="inline-block h-6 w-1 rounded-full bg-sky-400" />
                            <span>{children}</span>
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="fuwari-font-title mt-9 text-xl font-bold tracking-[-0.03em] text-slate-900 md:text-2xl">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="fuwari-font-title mt-7 text-lg font-semibold text-slate-900 md:text-xl">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="mt-5 text-[17px] leading-8 text-slate-700 first:mt-0">
                            {children}
                        </p>
                    ),
                    a: ({ children, href }) => (
                        <a href={href} className="fuwari-link">
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-sky-400">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mt-5 list-decimal space-y-2 pl-6 marker:font-medium marker:text-sky-500">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-8 text-slate-700">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="relative mt-7 rounded-2xl border border-sky-100 bg-sky-50/60 px-5 py-4 text-slate-600 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:rounded-l-2xl before:bg-sky-400 before:content-['']">
                            {children}
                        </blockquote>
                    ),
                    img: ({ alt, src }) => (
                        <figure className="fuwari-card-soft mt-8 border border-slate-200">
                            <img
                                src={src ?? ""}
                                alt={alt ?? ""}
                                className="w-full object-cover"
                            />
                        </figure>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-slate-950">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="text-slate-600">{children}</em>
                    ),
                    code: ({ children, className: codeClassName }) => {
                        const isBlock = Boolean(codeClassName);

                        if (isBlock) {
                            return (
                                <code className="fuwari-font-mono block overflow-x-auto rounded-3xl bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-100">
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className="fuwari-font-mono rounded-lg bg-sky-50 px-1.5 py-0.5 text-[0.92em] text-sky-700">
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="mt-7 overflow-x-auto rounded-3xl bg-slate-950 p-0 shadow-sm">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="fuwari-card-soft mt-7 overflow-x-auto border border-slate-200">
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
                    hr: () => <hr className="mt-10 border-slate-200" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
