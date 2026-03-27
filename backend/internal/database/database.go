package database

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"blog-ai/backend/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func New(databasePath string) (*gorm.DB, error) {
	if err := os.MkdirAll(filepath.Dir(databasePath), 0o755); err != nil {
		return nil, err
	}

	db, err := gorm.Open(sqlite.Open(databasePath), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := migrate(db); err != nil {
		return nil, fmt.Errorf("migrate database: %w", err)
	}

	if err := seedPosts(db); err != nil {
		return nil, fmt.Errorf("seed posts: %w", err)
	}

	return db, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(&model.Post{})
}

func seedPosts(db *gorm.DB) error {
	var count int64
	if err := db.Model(&model.Post{}).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	posts := []model.Post{
		{
			Title:       "把博客当成长期作品来写",
			Slug:        "write-blog-as-long-term-work",
			Excerpt:     "从选题、结构到复盘，给独立开发者一个可以长期坚持的个人博客写作方法。",
			Content:     "个人博客最有价值的地方，不是发布速度，而是持续积累自己的判断。把文章写成一份长期作品，意味着每次动笔都围绕真实问题、真实经验和真实结论展开。这样写出来的内容，几年后回头看仍然有参考价值。",
			CoverImage:  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
			Category:    "写作",
			ReadingTime: 6,
			PublishedAt: time.Date(2026, time.March, 24, 9, 0, 0, 0, time.UTC),
		},
		{
			Title:       "用 Go 和 SQLite 搭一个够用的内容后台",
			Slug:        "go-sqlite-content-backend",
			Excerpt:     "不追求过度设计，先把模型、迁移、查询接口和部署方式做稳定。",
			Content:     "小型博客最适合从简单架构开始。Go 提供了直接、可靠的服务端能力，SQLite 则降低了部署和备份成本。先把文章模型、列表接口和初始化流程打通，再逐步加入鉴权、草稿和搜索，是更稳妥的节奏。",
			CoverImage:  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
			Category:    "后端",
			ReadingTime: 8,
			PublishedAt: time.Date(2026, time.March, 19, 13, 30, 0, 0, time.UTC),
		},
		{
			Title:       "给个人博客做一个舒服的首页信息层级",
			Slug:        "design-better-blog-homepage-hierarchy",
			Excerpt:     "首页不需要堆满组件，关键是让读者一眼知道你写什么、为什么值得读。",
			Content:     "博客首页应该承担品牌介绍、内容筛选和最新更新三个任务。清晰的首屏、重点文章卡片和精简的文章列表，通常比复杂的瀑布流更有效。设计上先解决信息层级，再考虑装饰细节。",
			CoverImage:  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
			Category:    "前端",
			ReadingTime: 5,
			PublishedAt: time.Date(2026, time.March, 11, 8, 15, 0, 0, time.UTC),
		},
	}

	return db.Create(&posts).Error
}
