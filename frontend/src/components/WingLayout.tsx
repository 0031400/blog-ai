import type { ReactNode } from 'react'

type WingLayoutProps = {
  main: ReactNode
  rightAside: ReactNode
}

export function WingLayout({ main, rightAside }: WingLayoutProps) {
  return (
    <div className="wing-page">
      <div className="wing-backdrop wing-backdrop-a" />
      <div className="wing-backdrop wing-backdrop-b" />

      <div className="wing-shell">
        <header className="wing-header">
          <div className="wing-brand">
            <p className="wing-brand-kicker">Long Form Notes</p>
            <a href="/#/" className="wing-brand-title">
              blog-ai
            </a>
          </div>

          <div className="wing-header-tools">
            <div className="wing-search">
              <input type="text" placeholder="搜索内容..." readOnly aria-label="搜索内容" />
              <span>⌕</span>
            </div>
            <button type="button" className="wing-theme-switch" aria-label="主题切换占位">
              <span className="wing-theme-dot wing-theme-dot-light" />
              <span className="wing-theme-dot wing-theme-dot-dark" />
            </button>
          </div>
        </header>

        <div className="wing-body">
          <aside className="wing-left">
            <nav className="wing-nav-card">
              <a href="/#/" className="wing-nav-link wing-nav-link-active">
                文章
              </a>
              <a href="/#/" className="wing-nav-link">
                笔记
              </a>
              <a href="/#/admin" className="wing-nav-link">
                写文章
              </a>
            </nav>

            <section className="wing-author-card">
              <div className="wing-author-cover" />
              <div className="wing-author-avatar">B</div>
              <div className="wing-author-content">
                <h2>blog-ai</h2>
                <p>一个把 Go、写作和独立开发过程持续记录下来的个人博客。</p>
              </div>
              <div className="wing-author-stats">
                <div>
                  <strong>12</strong>
                  <span>Like</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>Posts</span>
                </div>
                <div>
                  <strong>1.2K</strong>
                  <span>Views</span>
                </div>
              </div>
              <div className="wing-author-actions">
                <a href="/#/" className="wing-pill-button">
                  主页
                </a>
                <a href="/#/admin" className="wing-pill-button wing-pill-button-strong">
                  发布
                </a>
              </div>
            </section>
          </aside>

          <main className="wing-main">{main}</main>

          <aside className="wing-right">{rightAside}</aside>
        </div>
      </div>
    </div>
  )
}
