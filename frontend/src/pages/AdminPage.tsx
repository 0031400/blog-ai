import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { createHomeHref, createPostHref } from '../lib/hashRoute'
import type { Post } from '../types/post'
import type { PostFormValues } from '../types/postForm'

type AdminPageProps = {
  apiBaseUrl: string
  onPostCreated: (post: Post) => void
}

const initialValues: PostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  readingTime: '5',
  publishedAt: new Date().toISOString().slice(0, 16),
}

export function AdminPage({ apiBaseUrl, onPostCreated }: AdminPageProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successPost, setSuccessPost] = useState<Post | null>(null)

  const slugPreview = useMemo(() => values.slug.trim() || 'your-post-slug', [values.slug])

  const handleChange = (field: keyof PostFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = event.target.value

    setValues((currentValues) => {
      const nextValues = { ...currentValues, [field]: nextValue }

      if (field === 'title') {
        const autoSlug = toSlug(nextValue)
        if (!currentValues.slug || currentValues.slug === toSlug(currentValues.title)) {
          nextValues.slug = autoSlug
        }
      }

      return nextValues
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          readingTime: Number(values.readingTime),
          publishedAt: new Date(values.publishedAt).toISOString(),
        }),
      })

      const payload = (await response.json()) as { data?: Post; error?: string }
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? `Request failed with status ${response.status}`)
      }

      setSuccessPost(payload.data)
      onPostCreated(payload.data)
      setValues(initialValues)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '发布失败，请稍后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(23,76,60,0.18),_transparent_28%),linear-gradient(180deg,_#f7f2e9_0%,_#efe4d4_100%)] text-stone-900">
      <Container maxWidth="lg" className="px-4 py-8 md:py-14">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Chip label="Admin / Publish" color="secondary" />
            <Typography variant="h1" sx={{ mt: 2, fontSize: { xs: '2.8rem', md: '4.4rem' }, lineHeight: 0.95 }}>
              发布一篇新文章
            </Typography>
            <Typography className="mt-3 max-w-2xl text-base leading-8 text-stone-700 md:text-lg">
              先做一个最小可用的后台，把标题、slug、摘要、正文和发布时间直接写进 SQLite，先把博客真正发布起来。
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" href={createHomeHref()}>
              返回首页
            </Button>
            {successPost ? (
              <Button variant="contained" href={createPostHref(successPost.slug)}>
                查看刚发布的文章
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <Box className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card elevation={0} className="border border-white/60 bg-white/68 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <Typography variant="h5">文章信息</Typography>

              <Box component="form" className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {error ? <Alert severity="error">{error}</Alert> : null}
                {successPost ? <Alert severity="success">文章已发布，可以继续写下一篇。</Alert> : null}

                <TextField label="标题" value={values.title} onChange={handleChange('title')} required fullWidth />
                <TextField label="Slug" value={values.slug} onChange={handleChange('slug')} required fullWidth helperText={`预览链接: /#/posts/${slugPreview}`} />
                <TextField label="摘要" value={values.excerpt} onChange={handleChange('excerpt')} required fullWidth multiline minRows={3} />
                <TextField label="正文" value={values.content} onChange={handleChange('content')} required fullWidth multiline minRows={10} />
                <TextField label="封面图 URL" value={values.coverImage} onChange={handleChange('coverImage')} required fullWidth />

                <Box className="grid gap-4 md:grid-cols-3">
                  <TextField label="分类" value={values.category} onChange={handleChange('category')} required fullWidth />
                  <TextField label="阅读时长(分钟)" type="number" value={values.readingTime} onChange={handleChange('readingTime')} required fullWidth inputProps={{ min: 1 }} />
                  <TextField label="发布时间" type="datetime-local" value={values.publishedAt} onChange={handleChange('publishedAt')} required fullWidth InputLabelProps={{ shrink: true }} />
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="pt-2">
                  <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? '正在发布...' : '发布文章'}
                  </Button>
                  <Button type="button" variant="text" size="large" onClick={() => setValues(initialValues)} disabled={submitting}>
                    重置表单
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} className="border border-white/60 bg-[#1d3b31] text-white shadow-[0_30px_80px_rgba(64,45,24,0.12)]">
            <CardContent className="p-6 md:p-8">
              <Typography className="text-sm uppercase tracking-[0.24em] text-white/60">Publishing Notes</Typography>
              <Typography variant="h4" className="mt-4 leading-tight">
                这套后台现在适合做什么
              </Typography>
              <Stack spacing={2.5} className="mt-6 text-white/85">
                <Typography>直接向 SQLite 写入正式文章，不需要额外 CMS。</Typography>
                <Typography>Slug 唯一校验在后端完成，避免重复文章地址。</Typography>
                <Typography>发布时间支持手动指定，方便补录历史文章。</Typography>
                <Typography>下一步最适合接 Markdown、草稿状态和编辑功能。</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
