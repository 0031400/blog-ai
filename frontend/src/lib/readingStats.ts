const cjkCharPattern =
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;
const latinWordPattern = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

function stripMarkdown(content: string) {
    return content
        .replace(/```([\s\S]*?)```/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, " $1 ")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
        .replace(/<[^>]+>/g, " ")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^>\s?/gm, "")
        .replace(/^[-*+]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/\|/g, " ")
        .replace(/[*_~]/g, "")
        .replace(/\r/g, "")
        .trim();
}

export type ReadingStats = {
    characterCount: number;
    wordCount: number;
    minuteCount: number;
};

export function calculateReadingStats(content: string): ReadingStats {
    const plainText = stripMarkdown(content);
    const characterCount = plainText.replace(/\s+/g, "").length;
    const cjkChars = plainText.match(cjkCharPattern) ?? [];
    const latinWords = plainText
        .replace(cjkCharPattern, " ")
        .match(latinWordPattern) ?? [];
    const wordCount = cjkChars.length + latinWords.length;

    return {
        characterCount,
        wordCount,
        minuteCount:
            wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 300)),
    };
}
