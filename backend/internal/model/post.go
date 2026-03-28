package model

import "time"

// Post represents a blog article stored in SQLite.
type Post struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Title        string    `gorm:"size:200;not null" json:"title"`
	Slug         string    `gorm:"size:200;uniqueIndex;not null" json:"slug"`
	Excerpt      string    `gorm:"size:320;not null" json:"excerpt"`
	Content      string    `gorm:"type:text;not null" json:"content"`
	CoverImage   string    `gorm:"size:500;not null" json:"coverImage"`
	CategoryID   uint      `gorm:"index" json:"categoryId"`
	Category     Category  `json:"category"`
	Tags         []Tag     `gorm:"many2many:post_tags;" json:"tags"`
	ReadingTime  int       `gorm:"not null" json:"readingTime"`
	Status       string    `gorm:"size:20;not null;default:draft;index" json:"status"`
	AllowComment bool      `gorm:"not null;default:true" json:"allowComment"`
	Deleted      bool      `gorm:"not null;default:false;index" json:"deleted"`
	PublishedAt  time.Time `gorm:"index;not null" json:"publishedAt"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
