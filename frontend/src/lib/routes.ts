export const homePath = "/";
export const adminPath = "/admin";

export function createPostPath(slug: string) {
    return `/posts/${encodeURIComponent(slug)}`;
}

export function createHomePath() {
    return homePath;
}

export function createAdminPath() {
    return adminPath;
}
