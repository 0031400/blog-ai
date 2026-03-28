package handler

import (
	"errors"
	"net/http"
	"strings"

	"blog-ai/backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type categoryRequest struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

type tagRequest struct {
	Name  string `json:"name"`
	Slug  string `json:"slug"`
	Color string `json:"color"`
}

type TaxonomyHandler struct {
	db *gorm.DB
}

func NewTaxonomyHandler(db *gorm.DB) TaxonomyHandler {
	return TaxonomyHandler{db: db}
}

func (h TaxonomyHandler) ListCategories(c *gin.Context) {
	var categories []model.Category
	if err := h.db.Order("name ASC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func (h TaxonomyHandler) CreateCategory(c *gin.Context) {
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	category, err := buildCategory(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&category).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "category already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": category})
}

func (h TaxonomyHandler) UpdateCategory(c *gin.Context) {
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	nextCategory, err := buildCategory(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var category model.Category
	if err := h.db.First(&category, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load category"})
		return
	}

	category.Name = nextCategory.Name
	category.Slug = nextCategory.Slug
	category.Description = nextCategory.Description

	if err := h.db.Save(&category).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "category already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

func (h TaxonomyHandler) DeleteCategory(c *gin.Context) {
	var category model.Category
	if err := h.db.First(&category, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load category"})
		return
	}

	var count int64
	if err := h.db.Model(&model.Post{}).Where("category_id = ? AND deleted = ?", category.ID, false).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count category posts"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "category is still used by posts"})
		return
	}

	if err := h.db.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"deleted": true}})
}

func (h TaxonomyHandler) ListTags(c *gin.Context) {
	var tags []model.Tag
	if err := h.db.Order("name ASC").Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load tags"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tags})
}

func (h TaxonomyHandler) CreateTag(c *gin.Context) {
	var req tagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	tag, err := buildTag(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&tag).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "tag already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tag"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": tag})
}

func (h TaxonomyHandler) UpdateTag(c *gin.Context) {
	var req tagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	nextTag, err := buildTag(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var tag model.Tag
	if err := h.db.First(&tag, c.Param("id")).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "tag not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load tag"})
		return
	}

	tag.Name = nextTag.Name
	tag.Slug = nextTag.Slug
	tag.Color = nextTag.Color

	if err := h.db.Save(&tag).Error; err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "tag already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update tag"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tag})
}

func (h TaxonomyHandler) DeleteTag(c *gin.Context) {
	if err := h.db.Transaction(func(tx *gorm.DB) error {
		var tag model.Tag
		if err := tx.First(&tag, c.Param("id")).Error; err != nil {
			return err
		}

		if err := tx.Exec("DELETE FROM post_tags WHERE tag_id = ?", tag.ID).Error; err != nil {
			return err
		}

		if err := tx.Delete(&tag).Error; err != nil {
			return err
		}

		c.JSON(http.StatusOK, gin.H{"data": gin.H{"deleted": true}})
		return nil
	}); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "tag not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete tag"})
	}
}

func buildCategory(req categoryRequest) (model.Category, error) {
	name := strings.TrimSpace(req.Name)
	slug := strings.TrimSpace(req.Slug)
	if name == "" {
		return model.Category{}, errors.New("name is required")
	}
	if slug == "" {
		slug = slugify(name)
	}
	return model.Category{
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(req.Description),
	}, nil
}

func buildTag(req tagRequest) (model.Tag, error) {
	name := strings.TrimSpace(req.Name)
	slug := strings.TrimSpace(req.Slug)
	if name == "" {
		return model.Tag{}, errors.New("name is required")
	}
	if slug == "" {
		slug = slugify(name)
	}
	return model.Tag{
		Name:  name,
		Slug:  slug,
		Color: strings.TrimSpace(req.Color),
	}, nil
}

func slugify(value string) string {
	return strings.Trim(strings.ReplaceAll(strings.ToLower(strings.Join(strings.Fields(value), "-")), "--", "-"), "-")
}
