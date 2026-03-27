package router

import (
	"blog-ai/backend/internal/handler"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	postHandler := handler.NewPostHandler(db)
	taxonomyHandler := handler.NewTaxonomyHandler(db)

	api := r.Group("/api")
	api.GET("/health", handler.Health)
	api.GET("/posts", postHandler.List)
	api.GET("/posts/:slug", postHandler.GetBySlug)
	api.POST("/posts", postHandler.Create)
	api.PUT("/posts/:id", postHandler.Update)
	api.DELETE("/posts/:id", postHandler.Delete)
	api.PUT("/posts/:id/restore", postHandler.Restore)
	api.GET("/categories", taxonomyHandler.ListCategories)
	api.POST("/categories", taxonomyHandler.CreateCategory)
	api.PUT("/categories/:id", taxonomyHandler.UpdateCategory)
	api.DELETE("/categories/:id", taxonomyHandler.DeleteCategory)
	api.GET("/tags", taxonomyHandler.ListTags)
	api.POST("/tags", taxonomyHandler.CreateTag)
	api.PUT("/tags/:id", taxonomyHandler.UpdateTag)
	api.DELETE("/tags/:id", taxonomyHandler.DeleteTag)

	return r
}
