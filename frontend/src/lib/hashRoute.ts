export function getPostSlugFromHash(hash: string) {
  const normalizedHash = hash || '#/'
  const match = normalizedHash.match(/^#\/posts\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function isAdminRoute(hash: string) {
  const normalizedHash = hash || '#/'
  return normalizedHash === '#/admin'
}

export function createPostHref(slug: string) {
  return `/#/posts/${encodeURIComponent(slug)}`
}

export function createHomeHref() {
  return '/#/'
}

export function createAdminHref() {
  return '/#/admin'
}
