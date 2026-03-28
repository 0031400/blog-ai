package handler

import (
	"net/http"
	"strings"

	"blog-ai/backend/internal/auth"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService auth.Service
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func NewAuthHandler(authService auth.Service) AuthHandler {
	return AuthHandler{authService: authService}
}

func (h AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if !h.authService.Authenticate(strings.TrimSpace(req.Username), req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	sessionValue, err := h.authService.NewSessionValue()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	setAdminSessionCookie(c, sessionValue, int(h.authService.SessionTTL().Seconds()))
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"authenticated": true, "username": h.authService.Username()}})
}

func (h AuthHandler) Logout(c *gin.Context) {
	clearAdminSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"authenticated": false}})
}

func (h AuthHandler) Session(c *gin.Context) {
	if !RequireAdminSessionForMiddleware(c, h.authService) {
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": gin.H{"authenticated": true, "username": h.authService.Username()}})
}

func setAdminSessionCookie(c *gin.Context, value string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(auth.SessionCookieName, value, maxAge, "/", "", false, true)
}

func clearAdminSessionCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(auth.SessionCookieName, "", -1, "/", "", false, true)
}

func RequireAdminSessionForMiddleware(c *gin.Context, authService auth.Service) bool {
	cookieValue, err := c.Cookie(auth.SessionCookieName)
	if err != nil || authService.ValidateSessionValue(cookieValue) != nil {
		clearAdminSessionCookie(c)
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return false
	}

	return true
}
