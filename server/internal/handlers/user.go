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
