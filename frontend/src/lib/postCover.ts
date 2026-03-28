import { siteMeta } from "../data/site.ts";

export function getPostCoverImage(coverImage: string | null | undefined) {
    const normalizedCoverImage = coverImage?.trim() ?? "";
    return normalizedCoverImage || siteMeta.defaultCoverImage;
}
