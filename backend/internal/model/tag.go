package model

import "time"

// Tag represents a managed post tag.
type Tag struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:80;uniqueIndex;not null" json:"name"`
	Slug      string    `gorm:"size:120;uniqueIndex;not null" json:"slug"`
	Color     string    `gorm:"size:20" json:"color"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
