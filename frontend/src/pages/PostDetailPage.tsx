import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material'

import { createHomeHref } from '../lib/hashRoute'
import { formatDate } from '../lib/date'
import type { Post } from '../types/post'

type PostDetailPageProps = {
  detailError: string
  detailLoading: boolean
  post: Post | null
}

export function PostDetailPage({ detailError, detailLoading, post }: PostDetailPageProps) {
  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(23,76,60,0.24),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(199,103,45,0.2),_transparent_26%),linear-gradient(180deg,_#f7f2e9_0%,_#efe4d4_100%)] text-stone-900">
      <Container maxWidth="md" className="px-4 py-8 md:py-14">
        <Button href={createHomeHref()} sx={{ mb: 3, px: 0 }}>
          返回首页
        </Button>

        {detailError ? <Alert severity="error">{detailError}</Alert> : null}

        {post ? (
          <Box className="overflow-hidden rounded-[32px] border border-white/60 bg-white/60 shadow-[0_30px_80px_rgba(64,45,24,0.12)] backdrop-blur">
            <Box className="h-[260px] bg-cover bg-center md:h-[360px]" sx={{ backgroundImage: `url(${post.coverImage})` }} />
            <Box className="px-6 py-8 md:px-10 md:py-10">
              <Stack direction="row" spacing={1.5} className="flex-wrap">
                <Chip label={post.category} color="secondary" />
                <Chip label={`${post.readingTime} min read`} variant="outlined" />
                <Chip label={formatDate(post.publishedAt)} variant="outlined" />
              </Stack>

              <Typography variant="h1" sx={{ mt: 3, fontSize: { xs: '2.6rem', md: '4.4rem' }, lineHeight: 0.96 }}>
                {post.title}
              </Typography>

              <Typography className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                {post.excerpt}
              </Typography>

              <Stack direction="row" spacing={2} className="mt-8 items-center">
                <Avatar sx={{ bgcolor: '#174c3c' }}>L</Avatar>
                <Box>
                  <Typography className="font-semibold text-stone-900">Long Form Notes</Typography>
                  <Typography className="text-sm text-stone-500">
                    {detailLoading ? '正在同步最新内容...' : '独立开发 / 技术写作 / 个人博客实验'}
                  </Typography>
                </Box>
              </Stack>

              <Box className="mt-10 space-y-6 text-[1.06rem] leading-8 text-stone-800">
                {post.content.split('。').filter(Boolean).map((paragraph, index) => (
                  <Typography key={`${post.slug}-${index}`}>
                    {paragraph.trim()}。
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Card elevation={0} className="border border-white/60 bg-white/70 backdrop-blur">
            <CardContent className="p-8">
              <Typography variant="h4">{detailLoading ? '正在加载文章...' : '暂时没有找到这篇文章'}</Typography>
              <Typography className="mt-3 text-stone-700">
                你可以先返回首页查看文章列表，或者确认后端服务是否已经启动。
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}
