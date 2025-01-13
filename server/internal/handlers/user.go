package handlers

import (
	"foodgenie/internal/app"
	"foodgenie/internal/models"
	"github.com/gin-gonic/gin"
	"net/http"
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
