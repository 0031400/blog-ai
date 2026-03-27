package handler

import (
	"errors"
	"fmt"
	"net/http"
	"slices"
	"strings"
	"time"

	"blog-ai/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	validStatuses     = []string{"draft", "published"}
	validVisibilities = []string{"public", "private"}
)

type createPostRequest struct {
	Title        string   `json:"title"`
	Slug         string   `json:"slug"`
	Excerpt      string   `json:"excerpt"`
	Content      string   `json:"content"`
	CoverImage   string   `json:"coverImage"`
	Category     string   `json:"category"`
	Tags         []string `json:"tags"`
	ReadingTime  int      `json:"readingTime"`
	Status       string   `json:"status"`
	Visibility   string   `json:"visibility"`
	Pinned       bool     `json:"pinned"`
	AllowComment bool     `json:"allowComment"`
	Deleted      bool     `json:"deleted"`
	PublishedAt  string   `json:"publishedAt"`
}

type restorePostRequest struct {
	Deleted bool `json:"deleted"`
}

// PostHandler serves blog post resources.
type PostHandler struct {
	db *gorm.DB
}

// NewPostHandler creates a post handler with database access.
func NewPostHandler(db *gorm.DB) PostHandler {
	return PostHandler{db: db}
}

// List returns posts. Public requests only see published/public/non-deleted posts.
func (h PostHandler) List(c *gin.Context) {
	var posts []model.Post

	query := h.db.Model(&model.Post{})
	if c.Query("scope") == "admin" {
		query = applyAdminFilters(query, c)
	} else {
		query = query.Where("deleted = ? AND status = ? AND visibility = ?", false, "published", "public")
	}

	if err := query.Order("pinned DESC").Order("published_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

// GetBySlug returns a single public post by its slug.
func (h PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var post model.Post
	if err := h.db.Where("slug = ? AND deleted = ? AND status = ? AND visibility = ?", slug, false, "published", "public").First(&post).Error; err != nil {
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
	var req createPostRequest
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

	nextPost, err := buildPost(req)
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
	post.Tags = nextPost.Tags
	post.ReadingTime = nextPost.ReadingTime
	post.Status = nextPost.Status
	post.Visibility = nextPost.Visibility
	post.Pinned = nextPost.Pinned
	post.AllowComment = nextPost.AllowComment
	post.Deleted = nextPost.Deleted
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

// Delete moves an existing post to recycle bin.
func (h PostHandler) Delete(c *gin.Context) {
	var post model.Post
	if err := h.db.First(&post, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	post.Deleted = true
	if err := h.db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

// Restore removes a post from recycle bin.
func (h PostHandler) Restore(c *gin.Context) {
	var req restorePostRequest
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

	post.Deleted = req.Deleted
	if err := h.db.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to restore post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

func applyAdminFilters(query *gorm.DB, c *gin.Context) *gorm.DB {
	if keyword := strings.TrimSpace(c.Query("keyword")); keyword != "" {
		likeKeyword := "%" + keyword + "%"
		query = query.Where(
			"title LIKE ? OR excerpt LIKE ? OR slug LIKE ? OR category LIKE ?",
			likeKeyword,
			likeKeyword,
			likeKeyword,
			likeKeyword,
		)
	}

	if status := strings.TrimSpace(c.Query("status")); status != "" {
		query = query.Where("status = ?", status)
	}

	if visibility := strings.TrimSpace(c.Query("visibility")); visibility != "" {
		query = query.Where("visibility = ?", visibility)
	}

	if deleted := strings.TrimSpace(c.Query("deleted")); deleted != "" {
		query = query.Where("deleted = ?", deleted == "true")
	}

	if category := strings.TrimSpace(c.Query("category")); category != "" {
		query = query.Where("category = ?", category)
	}

	if tag := strings.TrimSpace(c.Query("tag")); tag != "" {
		query = query.Where("tags LIKE ?", "%"+tag+"%")
	}

	return query
}

func buildPost(req createPostRequest) (model.Post, error) {
	title := strings.TrimSpace(req.Title)
	slug := strings.TrimSpace(req.Slug)
	excerpt := strings.TrimSpace(req.Excerpt)
	content := strings.TrimSpace(req.Content)
	coverImage := strings.TrimSpace(req.CoverImage)
	category := strings.TrimSpace(req.Category)
	status := normalizeStatus(req.Status)
	visibility := normalizeVisibility(req.Visibility)

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
	case !slices.Contains(validStatuses, status):
		return model.Post{}, errors.New("status must be draft or published")
	case !slices.Contains(validVisibilities, visibility):
		return model.Post{}, errors.New("visibility must be public or private")
	}

	publishedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(req.PublishedAt))
	if err != nil {
		return model.Post{}, fmt.Errorf("publishedAt must be RFC3339: %w", err)
	}

	return model.Post{
		Title:        title,
		Slug:         slug,
		Excerpt:      excerpt,
		Content:      content,
		CoverImage:   coverImage,
		Category:     category,
		Tags:         normalizeTags(req.Tags),
		ReadingTime:  req.ReadingTime,
		Status:       status,
		Visibility:   visibility,
		Pinned:       req.Pinned,
		AllowComment: req.AllowComment,
		Deleted:      req.Deleted,
		PublishedAt:  publishedAt,
	}, nil
}

func normalizeTags(tags []string) []string {
	if len(tags) == 0 {
		return []string{}
	}

	normalized := make([]string, 0, len(tags))
	seen := make(map[string]struct{}, len(tags))
	for _, tag := range tags {
		value := strings.TrimSpace(tag)
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		normalized = append(normalized, value)
	}

	return normalized
}

func normalizeStatus(status string) string {
	if strings.TrimSpace(status) == "" {
		return "draft"
	}
	return strings.ToLower(strings.TrimSpace(status))
}

func normalizeVisibility(visibility string) string {
	if strings.TrimSpace(visibility) == "" {
		return "public"
	}
	return strings.ToLower(strings.TrimSpace(visibility))
}

func isUniqueConstraintError(err error) bool {
	return strings.Contains(strings.ToLower(err.Error()), "unique")
}
