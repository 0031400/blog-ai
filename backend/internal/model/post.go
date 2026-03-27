package model

import "time"

// Post represents a blog article stored in SQLite.
type Post struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:200;not null" json:"title"`
	Slug        string    `gorm:"size:200;uniqueIndex;not null" json:"slug"`
	Excerpt     string    `gorm:"size:320;not null" json:"excerpt"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	CoverImage  string    `gorm:"size:500;not null" json:"coverImage"`
	Category    string    `gorm:"size:80;not null" json:"category"`
	ReadingTime int       `gorm:"not null" json:"readingTime"`
	PublishedAt time.Time `gorm:"index;not null" json:"publishedAt"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
