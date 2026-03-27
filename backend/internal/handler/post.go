package handler

import (
	"net/http"

	"blog-ai/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PostHandler serves blog post resources.
type PostHandler struct {
	db *gorm.DB
}

// NewPostHandler creates a post handler with database access.
func NewPostHandler(db *gorm.DB) PostHandler {
	return PostHandler{db: db}
}

// List returns all published posts ordered by publish date.
func (h PostHandler) List(c *gin.Context) {
	var posts []model.Post

	if err := h.db.Order("published_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}
