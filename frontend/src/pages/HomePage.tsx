import { createAdminHref, createPostHref } from '../lib/hashRoute'
import { formatDate } from '../lib/date'
import type { Post } from '../types/post'
import { WingLayout } from '../components/WingLayout'

type HomePageProps = {
  error: string
  featuredPost: Post | undefined
  latestPosts: Post[]
  loading: boolean
}

function ArticleCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`wing-article-card${featured ? ' wing-article-card-featured' : ''}`}>
      <a href={createPostHref(post.slug)} className="wing-article-link">
        <div className="wing-article-copy">
          <div className="wing-article-head">
            <span className="wing-tag">{post.category}</span>
            <span className="wing-meta">
              {formatDate(post.publishedAt)} · {post.readingTime} min
            </span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className="wing-readmore">阅读全文</div>
        </div>
        <div className="wing-article-cover">
          <img src={post.coverImage} alt={post.title} />
        </div>
      </a>
    </article>
  )
}

export function HomePage({ error, featuredPost, latestPosts, loading }: HomePageProps) {
  const rightAside = (
    <>
      <section className="wing-widget">
        <div className="wing-widget-title-row">
          <h3>精选文章</h3>
          <span>Feature</span>
        </div>
        {featuredPost ? (
          <a href={createPostHref(featuredPost.slug)} className="wing-feature-card">
            <img src={featuredPost.coverImage} alt={featuredPost.title} />
            <div className="wing-feature-overlay" />
            <div className="wing-feature-copy">
              <span>{featuredPost.category}</span>
              <strong>{featuredPost.title}</strong>
              <p>{featuredPost.excerpt}</p>
            </div>
          </a>
        ) : (
          <div className="wing-empty-box">暂无精选文章</div>
        )}
      </section>

      <section className="wing-widget">
        <div className="wing-widget-title-row">
          <h3>更新节奏</h3>
          <span>Status</span>
        </div>
        <div className="wing-mini-list">
          <div>
            <strong>Go + React</strong>
            <p>现有博客框架仍然保留接口驱动和 hash 路由。</p>
          </div>
          <div>
            <strong>Wing UI</strong>
            <p>首页、卡片、边栏信息层级已经改成目标主题风格。</p>
          </div>
          <div>
            <strong>{loading ? '同步中' : '已就绪'}</strong>
            <p>{loading ? '正在拉取后端内容。' : '可继续细化详情页和后台样式。'}</p>
          </div>
        </div>
      </section>
    </>
  )

  return (
    <WingLayout
      rightAside={rightAside}
      main={
        <>
          <section className="wing-tabbar">
            <a href="/#/" className="wing-tab wing-tab-active">
              文章
            </a>
            <a href="/#/" className="wing-tab">
              笔记
            </a>
            <a href={createAdminHref()} className="wing-tab wing-tab-ghost">
              写新文章
            </a>
          </section>

          <section className="wing-content-panel">
            <div className="wing-section-head">
              <div>
                <span className="wing-kicker">Homepage</span>
                <h1>把首页改成 Wing 的内容排版节奏</h1>
                <p>保留你现有的数据结构和接口，把布局重心换成左侧作者卡、中央文章流、右侧精选信息盒。</p>
              </div>
              {featuredPost ? (
                <a href={createPostHref(featuredPost.slug)} className="wing-primary-link">
                  进入精选文章
                </a>
              ) : null}
            </div>

            {error ? <div className="wing-alert">{error}</div> : null}

            <div className="wing-article-list">
              {featuredPost ? <ArticleCard post={featuredPost} featured /> : null}
              {latestPosts.map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>

            {!featuredPost && latestPosts.length === 0 ? <div className="wing-empty-box">暂时没有文章内容</div> : null}
          </section>
        </>
      }
    />
  )
}
