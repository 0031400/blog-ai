package handler

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"blog-ai/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type createPostRequest struct {
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Excerpt     string `json:"excerpt"`
	Content     string `json:"content"`
	CoverImage  string `json:"coverImage"`
	Category    string `json:"category"`
	ReadingTime int    `json:"readingTime"`
	PublishedAt string `json:"publishedAt"`
}

type postPayload struct {
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Excerpt     string `json:"excerpt"`
	Content     string `json:"content"`
	CoverImage  string `json:"coverImage"`
	Category    string `json:"category"`
	ReadingTime int    `json:"readingTime"`
	PublishedAt string `json:"publishedAt"`
}

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

// GetBySlug returns a single post by its slug.
func (h PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var post model.Post
	if err := h.db.Where("slug = ?", slug).First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// Create persists a new post in SQLite.
func (h PostHandler) Create(c *gin.Context) {
	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	post, err := buildPost(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&post).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

// Update overwrites an existing post by id.
func (h PostHandler) Update(c *gin.Context) {
	var req postPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var post model.Post
	if err := h.db.First(&post, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	nextPost, err := buildPost(createPostRequest(req))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post.Title = nextPost.Title
	post.Slug = nextPost.Slug
	post.Excerpt = nextPost.Excerpt
	post.Content = nextPost.Content
	post.CoverImage = nextPost.CoverImage
	post.Category = nextPost.Category
	post.ReadingTime = nextPost.ReadingTime
	post.PublishedAt = nextPost.PublishedAt

	if err := h.db.Save(&post).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// Delete removes an existing post by id.
func (h PostHandler) Delete(c *gin.Context) {
	result := h.db.Delete(&model.Post{}, c.Param("id"))
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"deleted": true}})
}

func buildPost(req createPostRequest) (model.Post, error) {
	title := strings.TrimSpace(req.Title)
	slug := strings.TrimSpace(req.Slug)
	excerpt := strings.TrimSpace(req.Excerpt)
	content := strings.TrimSpace(req.Content)
	coverImage := strings.TrimSpace(req.CoverImage)
	category := strings.TrimSpace(req.Category)

	switch {
	case title == "":
		return model.Post{}, errors.New("title is required")
	case slug == "":
		return model.Post{}, errors.New("slug is required")
	case excerpt == "":
		return model.Post{}, errors.New("excerpt is required")
	case content == "":
		return model.Post{}, errors.New("content is required")
	case coverImage == "":
		return model.Post{}, errors.New("cover image is required")
	case category == "":
		return model.Post{}, errors.New("category is required")
	case req.ReadingTime <= 0:
		return model.Post{}, errors.New("reading time must be greater than 0")
	}

	publishedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(req.PublishedAt))
	if err != nil {
		return model.Post{}, fmt.Errorf("publishedAt must be RFC3339: %w", err)
	}

	return model.Post{
		Title:       title,
		Slug:        slug,
		Excerpt:     excerpt,
		Content:     content,
		CoverImage:  coverImage,
		Category:    category,
		ReadingTime: req.ReadingTime,
		PublishedAt: publishedAt,
	}, nil
}

func isUniqueConstraintError(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "unique")
}
