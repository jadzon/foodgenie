package handlers

import (
	"foodgenie/internal/app"
	"foodgenie/internal/dto"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type RecipeHandler struct {
	App *app.App
}

func NewRecipeHandler(app *app.App) *RecipeHandler {
	return &RecipeHandler{
		App: app,
	}
}
func (h *RecipeHandler) CreateRecipe(c *gin.Context) {
	var req dto.CreateRecipeRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body " + err.Error()})
		return
	}
	recipe, err := h.App.RecipeService.CreateRecipe(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create recipe " + err.Error()})
	}
	c.JSON(http.StatusCreated, recipe)
}
func (h *RecipeHandler) GetRecipeByName(c *gin.Context) {
	recipeName := c.Param("name")
	if recipeName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Recipe name parameter is missing in the URL path."})
	}
	recipeDTO, err := h.App.RecipeService.GetRecipeByName(c.Request.Context(), recipeName)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve recipe " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, recipeDTO)
}
