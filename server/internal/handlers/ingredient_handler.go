package handlers

import (
	"foodgenie/internal/app"
	"foodgenie/internal/dto"
	"net/http"

	"github.com/gin-gonic/gin"
)

type IngredientHandler struct {
	App *app.App
}

func NewIngredientHandler(app *app.App) *IngredientHandler {
	return &IngredientHandler{
		App: app,
	}
}
func (h *IngredientHandler) CreateIngredient(c *gin.Context) {

	var req dto.CreateIngredientRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body " + err.Error()})
		return
	}

	ing, err := h.App.IngredientService.CreateIngredient(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create ingredient " + err.Error()})
	}
	c.JSON(http.StatusCreated, ing)
}
