package database

import (
	"fmt"
	"os"
	"path/filepath"

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

	return db, nil
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(&model.Category{}, &model.Tag{}, &model.Post{})
}
