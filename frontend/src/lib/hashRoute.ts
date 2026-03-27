export function getPostSlugFromHash(hash: string) {
  const normalizedHash = hash || '#/'
  const match = normalizedHash.match(/^#\/posts\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function createPostHref(slug: string) {
  return `/#/posts/${encodeURIComponent(slug)}`
}

export function createHomeHref() {
  return '/#/'
}
