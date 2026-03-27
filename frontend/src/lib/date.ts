export function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
