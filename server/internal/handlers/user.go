package handlers

import (
	"foodgenie/internal/app"
	"foodgenie/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"strings"
)

type Handler struct {
	App *app.App
}

func NewHandler(app *app.App) *Handler {
	return &Handler{
		App: app,
	}
}
func (h *Handler) Login(c *gin.Context) {
	var user models.User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}
	err = h.App.UserService.ValidateUser(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "incorrect credentials"})
		return
	}
	user, _ = h.App.UserService.GetUserByUsername(user.Username)
	ac, err := h.App.SecurityService.GenerateAccessToken(user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed generating access token"})
		return
	}
	rt, err := h.App.SecurityService.GenerateRefreshToken(user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed generating refresh token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token":  ac,
			"refresh_token": rt,
		},
	})

}
func (h *Handler) Register(c *gin.Context) {
	var user models.User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}
	_, err = h.App.UserService.GetUserByEmail(user.Email)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "user with that email already exists"})
		return
	}
	_, err = h.App.UserService.GetUserByUsername(user.Username)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "user with that email already exists"})
		return
	}
	err = h.App.UserService.CreateUser(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "could not create the user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "user created"})
}
func (h *Handler) AuthCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Missing Authorization header"})
			return
		}

		// Oczekiwany format: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid Authorization header format"})
			return
		}

		accessToken := parts[1]

		userID, err := h.App.SecurityService.ExtractUserIDfromAccessToken(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "Invalid access token"})
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
func (h *Handler) GetUserData(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
		return
	}

	userUUID, ok := userID.(uuid.UUID)
	if !ok {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Invalid user ID format"})
		return
	}

	user, err := h.App.UserService.GetUserById(userUUID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve user data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"username":      user.Username,
		"email":         user.Email,
		"first_name":    user.FirstName,
		"last_name":     user.LastName,
		"date_of_birth": user.DateOfBirth.Format("2006-01-02"), // Formatowanie daty
	})
}
