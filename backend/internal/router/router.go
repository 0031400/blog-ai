package router

import (
	"blog-ai/backend/internal/handler"

	"github.com/gin-gonic/gin"
)

func New() *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	api.GET("/health", handler.Health)

	return r
}
