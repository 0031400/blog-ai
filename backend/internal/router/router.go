package router

import (
	"blog-ai/backend/internal/auth"
	"blog-ai/backend/internal/config"
	"blog-ai/backend/internal/handler"
	"blog-ai/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(db *gorm.DB, cfg config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.FrontendURL)
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	authService := auth.NewService(cfg.AdminUsername, cfg.AdminPassword, cfg.AdminSessionSecret)
	authHandler := handler.NewAuthHandler(authService)
	postHandler := handler.NewPostHandler(db)
	taxonomyHandler := handler.NewTaxonomyHandler(db)
	adminOnly := middleware.RequireAdmin(authService)

	api := r.Group("/api")
	api.GET("/health", handler.Health)
	api.POST("/admin/login", authHandler.Login)
	api.POST("/admin/logout", authHandler.Logout)
	api.GET("/admin/session", authHandler.Session)
	api.GET("/posts", middleware.OptionalAdmin(authService), postHandler.List)
	api.GET("/posts/:slug", postHandler.GetBySlug)
	api.POST("/posts", adminOnly, postHandler.Create)
	api.PUT("/posts/:id", adminOnly, postHandler.Update)
	api.DELETE("/posts/:id", adminOnly, postHandler.Delete)
	api.DELETE("/posts/:id/permanent", adminOnly, postHandler.PermanentDelete)
	api.PUT("/posts/:id/restore", adminOnly, postHandler.Restore)
	api.GET("/categories", adminOnly, taxonomyHandler.ListCategories)
	api.POST("/categories", adminOnly, taxonomyHandler.CreateCategory)
	api.PUT("/categories/:id", adminOnly, taxonomyHandler.UpdateCategory)
	api.DELETE("/categories/:id", adminOnly, taxonomyHandler.DeleteCategory)
	api.GET("/tags", adminOnly, taxonomyHandler.ListTags)
	api.POST("/tags", adminOnly, taxonomyHandler.CreateTag)
	api.PUT("/tags/:id", adminOnly, taxonomyHandler.UpdateTag)
	api.DELETE("/tags/:id", adminOnly, taxonomyHandler.DeleteTag)

	return r
}
