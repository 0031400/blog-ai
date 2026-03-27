import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material'

import { createPostHref } from '../lib/hashRoute'
import { formatDate } from '../lib/date'
import type { Post } from '../types/post'
import { StatCard } from '../components/StatCard'

type HomePageProps = {
  error: string
  featuredPost: Post | undefined
  latestPosts: Post[]
  loading: boolean
}

export function HomePage({ error, featuredPost, latestPosts, loading }: HomePageProps) {
  return (
    <Box className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(199,103,45,0.18),_transparent_30%),linear-gradient(180deg,_#f7f2e9_0%,_#efe4d4_100%)] text-stone-900">
      <Container maxWidth="lg" className="px-4 py-8 md:py-14">
        <Box className="overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_30px_80px_rgba(64,45,24,0.12)] backdrop-blur">
          <Box className="grid gap-10 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-10 md:py-12">
            <Stack spacing={3}>
              <Chip
                label="Independent Notes / Build in Public"
                color="secondary"
                sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
              />
              <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5.4rem' }, lineHeight: 0.95 }}>
                写给长期主义者的个人博客
              </Typography>
              <Typography className="max-w-xl text-base leading-8 text-stone-700 md:text-lg">
                用 Go、GORM、SQLite、Vite、React、Material UI 和 Tailwind 搭一个轻、稳、好看的博客，记录产品思考、技术实践与写作过程。
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" size="large" href="#latest">
                  看最新文章
                </Button>
                <Button
                  variant="text"
                  size="large"
                  href={featuredPost ? createPostHref(featuredPost.slug) : '#latest'}
                >
                  进入精选文章
                </Button>
                <Button variant="outlined" size="large" href="http://localhost:8080/api/health" target="_blank">
                  检查 API
                </Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="pt-2 text-stone-700">
                <StatCard label="技术栈" value="Go + React" />
                <StatCard label="内容方向" value="写作 / 工程 / 设计" />
              </Stack>
            </Stack>

            <Box className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-[#1d3b31] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Box
                className="absolute inset-0 bg-cover bg-center opacity-30"
                sx={{ backgroundImage: `url(${featuredPost?.coverImage})` }}
              />
              <Box className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,43,35,0.18),rgba(18,43,35,0.92))]" />
              <Stack className="relative z-10 h-full justify-between" spacing={3}>
                <Box>
                  <Typography className="text-sm uppercase tracking-[0.25em] text-white/70">
                    Featured Essay
                  </Typography>
                  <Typography variant="h4" className="mt-4 max-w-md leading-tight">
                    {featuredPost?.title}
                  </Typography>
                </Box>
                <Box>
                  <Typography className="max-w-md text-sm leading-7 text-white/85">
                    {featuredPost?.excerpt}
                  </Typography>
                  <Stack direction="row" spacing={1.5} className="mt-5 flex-wrap">
                    <Chip label={featuredPost?.category} sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white' }} />
                    <Chip
                      label={`${featuredPost?.readingTime ?? 0} min read`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white' }}
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    color="secondary"
                    href={featuredPost ? createPostHref(featuredPost.slug) : '#latest'}
                    sx={{ mt: 3, alignSelf: 'flex-start' }}
                  >
                    阅读全文
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Box className="mt-8 grid gap-6 md:grid-cols-[0.78fr_1.22fr]">
          <Card elevation={0} className="border border-white/60 bg-white/60 backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <Typography variant="h5">这个版本先搭好了什么</Typography>
              <Stack spacing={2} className="mt-5 text-stone-700">
                <Typography>SQLite 自动建表并内置三篇示例文章，启动后就能直接看到内容。</Typography>
                <Typography>Gin 已开放 `/api/posts` 和 `/api/health`，前端首页会自动拉取接口。</Typography>
                <Typography>Material UI 负责组件和主题，Tailwind 负责页面气氛、布局和细节节奏。</Typography>
              </Stack>
            </CardContent>
          </Card>

          <Box id="latest">
            {error ? <Alert severity="warning">{error}</Alert> : null}
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: error ? 3 : 0 }}>
              最新文章
            </Typography>
            <Typography className="mt-2 max-w-2xl text-stone-700">
              先用一个清晰的首页把文章、方向和个人风格立起来，后面再接着补管理后台、详情页和 Markdown 发布流。
            </Typography>
            <Box className="mt-6 grid gap-4 md:grid-cols-2">
              {latestPosts.map((post) => (
                <Card key={post.id} elevation={0} className="h-full overflow-hidden border border-white/60 bg-white/68 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <Box className="h-44 bg-cover bg-center" sx={{ backgroundImage: `url(${post.coverImage})` }} />
                  <CardContent className="flex h-[calc(100%-11rem)] flex-col p-6">
                    <Stack direction="row" spacing={1} className="mb-4 flex-wrap">
                      <Chip label={post.category} color="primary" variant="outlined" />
                      <Chip label={`${post.readingTime} min`} variant="outlined" />
                    </Stack>
                    <Typography variant="h5" className="leading-tight">
                      {post.title}
                    </Typography>
                    <Typography className="mt-3 flex-1 leading-7 text-stone-700">{post.excerpt}</Typography>
                    <Button variant="text" href={createPostHref(post.slug)} sx={{ mt: 2, alignSelf: 'flex-start', px: 0 }}>
                      阅读全文
                    </Button>
                    <Typography className="mt-5 text-sm text-stone-500">{formatDate(post.publishedAt)}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>

        <Typography className="mt-8 text-center text-sm tracking-[0.18em] text-stone-500 uppercase">
          {loading ? 'Loading content...' : 'Ready for your next feature slice'}
        </Typography>
      </Container>
    </Box>
  )
}
