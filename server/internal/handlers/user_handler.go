package handlers

import (
	"foodgenie/dto"
	"foodgenie/internal/app"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	App *app.App
}

func NewUserHandler(app *app.App) *UserHandler {
	return &UserHandler{
		App: app,
	}
}
func (h *UserHandler) Login(c *gin.Context) {

	var req dto.LoginRequestDTO
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}
	userModel, err := h.App.UserService.Authenticate(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "incorrect credentials"})
		return
	}
	at, err := h.App.SecurityService.GenerateAccessToken(userModel)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed generating access token"})
		return
	}
	rt, err := h.App.SecurityService.GenerateRefreshToken(userModel)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed generating refresh token"})
		return
	}
	response := dto.LoginResponseDTO{
		AccessToken:  at,
		RefreshToken: rt,
	}
	c.JSON(http.StatusOK, response)

}

func (h *UserHandler) Register(c *gin.Context) {
	var user dto.RegisterUserRequestDTO
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
		return
	}
	userDTO, err := h.App.UserService.CreateUser(c.Request.Context(), &user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "could not create the user"})
		return
	}
	c.JSON(http.StatusCreated, userDTO)
}

func (h *UserHandler) AuthCheck() gin.HandlerFunc {
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

		claims, err := h.App.SecurityService.ValidateAccessToken(accessToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Parse the UserID from the valid claims
		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user ID in token"})
			return
		}

		c.Set("userID", userID)
		c.Next()
	}
}
func (h *UserHandler) GetMe(c *gin.Context) {

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

	userDTO, err := h.App.UserService.GetUserById(userUUID)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Failed to retrieve user data"})
		return
	}
	c.JSON(http.StatusOK, userDTO)

}
func (h *UserHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequestDTO
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: refresh token is required"})
		return
	}
	response, err := h.App.UserService.RefreshToken(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, response)
}
