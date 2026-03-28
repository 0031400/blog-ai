export const homePath = "/";
export const adminPath = "/admin";
export const adminPostEditorPath = "/admin/posts/editor";
export const adminRecyclePath = "/admin/recycle";
export const adminCategoriesPath = "/admin/categories";
export const adminTagsPath = "/admin/tags";

export function createPostPath(slug: string) {
    return `/posts/${encodeURIComponent(slug)}`;
}

export function createHomePath() {
    return homePath;
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
