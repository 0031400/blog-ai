package main

import (
	"log"

	"blog-ai/backend/internal/config"
	"blog-ai/backend/internal/database"
	"blog-ai/backend/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.New(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	r := router.New(db)

	log.Printf("blog-ai-backend listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("failed to run server: %v", err)
	}
}
