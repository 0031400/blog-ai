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
            className={`prose prose-slate max-w-none prose-headings:tracking-[-0.03em] prose-h1:text-[2rem] prose-h1:font-semibold prose-h2:mt-10 prose-h2:text-[1.7rem] prose-h2:font-semibold prose-h3:text-[1.2rem] prose-h3:font-semibold prose-p:text-[16px] prose-p:leading-8 prose-a:text-sky-500 prose-strong:text-slate-900 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-2xl prose-pre:bg-slate-950 prose-blockquote:border-sky-300 prose-blockquote:text-slate-600 prose-li:leading-8 ${className}`}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}
