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
	}
	err = h.App.UserService.ValidateUser(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "incorrect credentials"})
	}
	c.JSON(http.StatusOK, user)
}
func (h *Handler) Register(c *gin.Context) {
	var user models.User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "bad request"})
	}
	_, err = h.App.UserService.GetUserByEmail(user.Email)
	if err == nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "user with that email already exists"})
	}
	_, err = h.App.UserService.GetUserByUsername(user.Username)
	if err == nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "user with that email already exists"})
	}
	err = h.App.UserService.CreateUser(&user)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "could not create the user"})
	}
	c.JSON(http.StatusCreated, gin.H{"message": "user created"})
}
