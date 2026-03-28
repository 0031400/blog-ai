export const homePath = "/";
export const adminPath = "/console";
export const adminPostEditorPath = "/console/posts/editor";
export const adminRecyclePath = "/console/recycle";
export const adminCategoriesPath = "/console/categories";
export const adminTagsPath = "/console/tags";
export const categoryPath = "/category";
export const tagPath = "/tag";

export function createPostPath(slug: string) {
    return `/posts/${encodeURIComponent(slug)}`;
}

export function createHomePath(page?: number) {
    if (!page || page <= 1) {
        return homePath;
    }

    return `${homePath}?page=${page}`;
}

export function createCategoryPath(categoryId: number | string, page?: number) {
    const basePath = `${categoryPath}/${encodeURIComponent(String(categoryId))}`;
    if (!page || page <= 1) {
        return basePath;
    }

    return `${basePath}?page=${page}`;
}

export function createTagPath(tagId: number | string, page?: number) {
    const basePath = `${tagPath}/${encodeURIComponent(String(tagId))}`;
    if (!page || page <= 1) {
        return basePath;
    }

    return `${basePath}?page=${page}`;
}

export function createAdminPath() {
    return adminPath;
}

export function createAdminPostEditorPath(postId?: number) {
    if (typeof postId === "number") {
        return `${adminPostEditorPath}?postId=${postId}`;
    }

    return adminPostEditorPath;
}

export function createAdminRecyclePath() {
    return adminRecyclePath;
}

export function createAdminCategoriesPath() {
    return adminCategoriesPath;
}

export function createAdminTagsPath() {
    return adminTagsPath;
}
