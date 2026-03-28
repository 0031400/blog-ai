package middleware

import (
	"blog-ai/backend/internal/auth"
	"blog-ai/backend/internal/handler"

	"github.com/gin-gonic/gin"
)

func OptionalAdmin(authService auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieValue, err := c.Cookie(auth.SessionCookieName)
		if err == nil && authService.ValidateSessionValue(cookieValue) == nil {
			c.Set("is_admin", true)
		}

		c.Next()
	}
}

func RequireAdmin(authService auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !handler.RequireAdminSessionForMiddleware(c, authService) {
			return
		}

		c.Set("is_admin", true)
		c.Next()
	}
}
