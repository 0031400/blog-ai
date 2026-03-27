import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'

type Post = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  readingTime: number
  publishedAt: string
}

const fallbackPosts: Post[] = [
  {
    id: 1,
    title: '把博客当成长期作品来写',
    slug: 'write-blog-as-long-term-work',
    excerpt: '从选题、结构到复盘，给独立开发者一个可以长期坚持的个人博客写作方法。',
    content: '',
    coverImage:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    category: '写作',
    readingTime: 6,
    publishedAt: '2026-03-24T09:00:00Z',
  },
  {
    id: 2,
    title: '用 Go 和 SQLite 搭一个够用的内容后台',
    slug: 'go-sqlite-content-backend',
    excerpt: '不追求过度设计，先把模型、迁移、查询接口和部署方式做稳定。',
    content: '',
    coverImage:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: '后端',
    readingTime: 8,
    publishedAt: '2026-03-19T13:30:00Z',
  },
  {
    id: 3,
    title: '给个人博客做一个舒服的首页信息层级',
    slug: 'design-better-blog-homepage-hierarchy',
    excerpt: '首页不需要堆满组件，关键是让读者一眼知道你写什么、为什么值得读。',
    content: '',
    coverImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    category: '前端',
    readingTime: 5,
    publishedAt: '2026-03-11T08:15:00Z',
  },
]

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#174c3c' },
    secondary: { main: '#c7672d' },
    background: { default: '#f4efe6', paper: 'rgba(255,255,255,0.72)' },
  },
  typography: {
    fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    h1: { fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h4: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 24 },
})

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function App() {
  const [posts, setPosts] = useState<Post[]>(fallbackPosts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadPosts = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/posts`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload: { data: Post[] } = await response.json()
        if (payload.data.length > 0) {
          setPosts(payload.data)
        }
        setError('')
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return
        }

        setError('后端暂时未连接，当前展示的是本地示例内容。')
      } finally {
        setLoading(false)
      }
    }

    void loadPosts()

    return () => {
      controller.abort()
    }
  }, [])

  const featuredPost = posts[0]
  const latestPosts = useMemo(() => posts.slice(1), [posts])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                  <Button variant="outlined" size="large" href="http://localhost:8080/api/health" target="_blank">
                    检查 API
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="pt-2 text-stone-700">
                  <Stat label="技术栈" value="Go + React" />
                  <Stat label="内容方向" value="写作 / 工程 / 设计" />
                </Stack>
              </Stack>

              <Box className="relative min-h-[320px] overflow-hidden rounded-[28px] bg-[#1d3b31] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Box
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  sx={{ backgroundImage: `url(${featuredPost?.coverImage ?? fallbackPosts[0].coverImage})` }}
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
                      <Typography className="mt-3 flex-1 leading-7 text-stone-700">
                        {post.excerpt}
                      </Typography>
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
    </ThemeProvider>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box className="rounded-2xl border border-stone-300/70 bg-stone-50/70 px-4 py-3">
      <Typography className="text-xs uppercase tracking-[0.22em] text-stone-500">{label}</Typography>
      <Typography className="mt-1 text-base font-semibold text-stone-900">{value}</Typography>
    </Box>
  )
}

export default App
