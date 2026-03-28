package handler

import (
	"errors"
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
	Title        string `json:"title"`
	Slug         string `json:"slug"`
	Excerpt      string `json:"excerpt"`
	Content      string `json:"content"`
	CoverImage   string `json:"coverImage"`
	CategoryID   uint   `json:"categoryId"`
	TagIDs       []uint `json:"tagIds"`
	ReadingTime  int    `json:"readingTime"`
	Status       string `json:"status"`
	Visibility   string `json:"visibility"`
	Pinned       bool   `json:"pinned"`
	AllowComment bool   `json:"allowComment"`
	Deleted      bool   `json:"deleted"`
	PublishedAt  string `json:"publishedAt"`
}

type restorePostRequest struct {
	Deleted bool `json:"deleted"`
}

type postInput struct {
	Title        string
	Slug         string
	Excerpt      string
	Content      string
	CoverImage   string
	CategoryID   uint
	TagIDs       []uint
	ReadingTime  int
	Status       string
	Visibility   string
	Pinned       bool
	AllowComment bool
	Deleted      bool
	PublishedAt  time.Time
}

type postResponse struct {
	ID           uint            `json:"id"`
	Title        string          `json:"title"`
	Slug         string          `json:"slug"`
	Excerpt      string          `json:"excerpt"`
	Content      string          `json:"content"`
	CoverImage   string          `json:"coverImage"`
	CategoryID   uint            `json:"categoryId"`
	Category     *model.Category `json:"category"`
	TagIDs       []uint          `json:"tagIds"`
	Tags         []model.Tag     `json:"tags"`
	ReadingTime  int             `json:"readingTime"`
	Status       string          `json:"status"`
	Visibility   string          `json:"visibility"`
	Pinned       bool            `json:"pinned"`
	AllowComment bool            `json:"allowComment"`
	Deleted      bool            `json:"deleted"`
	PublishedAt  time.Time       `json:"publishedAt"`
	CreatedAt    time.Time       `json:"createdAt"`
	UpdatedAt    time.Time       `json:"updatedAt"`
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

	query := h.postQuery()
	if c.Query("scope") == "admin" {
		query = applyAdminFilters(query, c)
	} else {
		query = query.Where("posts.deleted = ? AND posts.status = ? AND posts.visibility = ?", false, "published", "public")
	}

	if err := query.Order("posts.pinned DESC").Order("posts.published_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": buildPostResponses(posts)})
}

// GetBySlug returns a single public post by its slug.
func (h PostHandler) GetBySlug(c *gin.Context) {
	var post model.Post
	if err := h.postQuery().
		Where("posts.slug = ? AND posts.deleted = ? AND posts.status = ? AND posts.visibility = ?", c.Param("slug"), false, "published", "public").
		First(&post).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": buildPostResponse(post)})
}

// Create persists a new post in SQLite.
func (h PostHandler) Create(c *gin.Context) {
	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	input, err := buildPost(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.savePost(nil, input)
	if err != nil {
		switch {
		case err == gorm.ErrRecordNotFound:
			c.JSON(http.StatusBadRequest, gin.H{"error": "category or tags not found"})
		case isUniqueConstraintError(err):
			c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": buildPostResponse(post)})
}

// Update overwrites an existing post by id.
func (h PostHandler) Update(c *gin.Context) {
	var req createPostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var existing model.Post
	if err := h.db.First(&existing, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	input, err := buildPost(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post, err := h.savePost(&existing, input)
	if err != nil {
		switch {
		case err == gorm.ErrRecordNotFound:
			c.JSON(http.StatusBadRequest, gin.H{"error": "category or tags not found"})
		case isUniqueConstraintError(err):
			c.JSON(http.StatusConflict, gin.H{"error": "slug already exists"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": buildPostResponse(post)})
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

	reloaded, err := h.loadPost(post.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": buildPostResponse(reloaded)})
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

	reloaded, err := h.loadPost(post.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": buildPostResponse(reloaded)})
}

func (h PostHandler) postQuery() *gorm.DB {
	return h.db.Model(&model.Post{}).
		Preload("Category").
		Preload("Tags", func(db *gorm.DB) *gorm.DB {
			return db.Order("name ASC")
		})
}

func (h PostHandler) loadPost(id uint) (model.Post, error) {
	var post model.Post
	err := h.postQuery().First(&post, id).Error
	return post, err
}

func (h PostHandler) savePost(existing *model.Post, input postInput) (model.Post, error) {
	var saved model.Post

	err := h.db.Transaction(func(tx *gorm.DB) error {
		var category model.Category
		if err := tx.First(&category, input.CategoryID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return err
			}
			return err
		}

		tags := make([]model.Tag, 0, len(input.TagIDs))
		if len(input.TagIDs) > 0 {
			if err := tx.Where("id IN ?", input.TagIDs).Find(&tags).Error; err != nil {
				return err
			}
			if len(tags) != len(input.TagIDs) {
				return gorm.ErrRecordNotFound
			}
		}

		var post model.Post
		if existing != nil {
			post = *existing
		}

		post.Title = input.Title
		post.Slug = input.Slug
		post.Excerpt = input.Excerpt
		post.Content = input.Content
		post.CoverImage = input.CoverImage
		post.CategoryID = category.ID
		post.ReadingTime = input.ReadingTime
		post.Status = input.Status
		post.Visibility = input.Visibility
		post.Pinned = input.Pinned
		post.AllowComment = input.AllowComment
		post.Deleted = input.Deleted
		post.PublishedAt = input.PublishedAt

		if existing == nil {
			if err := tx.Create(&post).Error; err != nil {
				return err
			}
		} else {
			if err := tx.Save(&post).Error; err != nil {
				return err
			}
		}

		if err := tx.Model(&post).Association("Tags").Replace(tags); err != nil {
			return err
		}

		if err := tx.Preload("Category").Preload("Tags", func(db *gorm.DB) *gorm.DB {
			return db.Order("name ASC")
		}).First(&saved, post.ID).Error; err != nil {
			return err
		}

		return nil
	})

	return saved, err
}

func applyAdminFilters(query *gorm.DB, c *gin.Context) *gorm.DB {
	if keyword := strings.TrimSpace(c.Query("keyword")); keyword != "" {
		likeKeyword := "%" + keyword + "%"
		query = query.
			Joins("LEFT JOIN categories ON categories.id = posts.category_id").
			Joins("LEFT JOIN post_tags ON post_tags.post_id = posts.id").
			Joins("LEFT JOIN tags ON tags.id = post_tags.tag_id").
			Where(
				"posts.title LIKE ? OR posts.excerpt LIKE ? OR posts.slug LIKE ? OR categories.name LIKE ? OR tags.name LIKE ?",
				likeKeyword,
				likeKeyword,
				likeKeyword,
				likeKeyword,
				likeKeyword,
			).
			Select("posts.*").
			Distinct()
	}

	if status := strings.TrimSpace(c.Query("status")); status != "" {
		query = query.Where("posts.status = ?", status)
	}

	if visibility := strings.TrimSpace(c.Query("visibility")); visibility != "" {
		query = query.Where("posts.visibility = ?", visibility)
	}

	if deleted := strings.TrimSpace(c.Query("deleted")); deleted != "" {
		query = query.Where("posts.deleted = ?", deleted == "true")
	}

	if categoryID := strings.TrimSpace(c.Query("categoryId")); categoryID != "" {
		query = query.Where("posts.category_id = ?", categoryID)
	}

	if tagID := strings.TrimSpace(c.Query("tagId")); tagID != "" {
		query = query.
			Joins("JOIN post_tags filter_post_tags ON filter_post_tags.post_id = posts.id").
			Where("filter_post_tags.tag_id = ?", tagID).
			Select("posts.*").
			Distinct()
	}

	return query
}

func buildPost(req createPostRequest) (postInput, error) {
	title := strings.TrimSpace(req.Title)
	slug := strings.TrimSpace(req.Slug)
	excerpt := strings.TrimSpace(req.Excerpt)
	content := strings.TrimSpace(req.Content)
	coverImage := strings.TrimSpace(req.CoverImage)
	status := normalizeStatus(req.Status)
	visibility := normalizeVisibility(req.Visibility)

	switch {
	case title == "":
		return postInput{}, errors.New("title is required")
	case slug == "":
		return postInput{}, errors.New("slug is required")
	case excerpt == "":
		return postInput{}, errors.New("excerpt is required")
	case content == "":
		return postInput{}, errors.New("content is required")
	case coverImage == "":
		return postInput{}, errors.New("cover image is required")
	case req.CategoryID == 0:
		return postInput{}, errors.New("categoryId is required")
	case req.ReadingTime <= 0:
		return postInput{}, errors.New("reading time must be greater than 0")
	case !slices.Contains(validStatuses, status):
		return postInput{}, errors.New("status must be draft or published")
	case !slices.Contains(validVisibilities, visibility):
		return postInput{}, errors.New("visibility must be public or private")
	}

	publishedAt, err := time.Parse(time.RFC3339, strings.TrimSpace(req.PublishedAt))
	if err != nil {
		return postInput{}, errors.New("publishedAt must be RFC3339")
	}

	return postInput{
		Title:        title,
		Slug:         slug,
		Excerpt:      excerpt,
		Content:      content,
		CoverImage:   coverImage,
		CategoryID:   req.CategoryID,
		TagIDs:       uniqueUints(req.TagIDs),
		ReadingTime:  req.ReadingTime,
		Status:       status,
		Visibility:   visibility,
		Pinned:       req.Pinned,
		AllowComment: req.AllowComment,
		Deleted:      req.Deleted,
		PublishedAt:  publishedAt,
	}, nil
}

func buildPostResponses(posts []model.Post) []postResponse {
	result := make([]postResponse, 0, len(posts))
	for _, post := range posts {
		result = append(result, buildPostResponse(post))
	}
	return result
}

func buildPostResponse(post model.Post) postResponse {
	tagIDs := make([]uint, 0, len(post.Tags))
	for _, tag := range post.Tags {
		tagIDs = append(tagIDs, tag.ID)
	}

	var category *model.Category
	if post.Category.ID != 0 {
		category = &post.Category
	}

	return postResponse{
		ID:           post.ID,
		Title:        post.Title,
		Slug:         post.Slug,
		Excerpt:      post.Excerpt,
		Content:      post.Content,
		CoverImage:   post.CoverImage,
		CategoryID:   post.CategoryID,
		Category:     category,
		TagIDs:       tagIDs,
		Tags:         post.Tags,
		ReadingTime:  post.ReadingTime,
		Status:       post.Status,
		Visibility:   post.Visibility,
		Pinned:       post.Pinned,
		AllowComment: post.AllowComment,
		Deleted:      post.Deleted,
		PublishedAt:  post.PublishedAt,
		CreatedAt:    post.CreatedAt,
		UpdatedAt:    post.UpdatedAt,
	}
}

func uniqueUints(values []uint) []uint {
	seen := make(map[uint]struct{}, len(values))
	result := make([]uint, 0, len(values))
	for _, value := range values {
		if value == 0 {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
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
