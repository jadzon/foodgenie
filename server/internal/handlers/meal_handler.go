package handlers

import (
	"foodgenie/dto"
	"foodgenie/internal/app"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type MealHandler struct {
	App *app.App
}

func NewMealHandler(app *app.App) *MealHandler {
	return &MealHandler{
		App: app,
	}
}

func (h *MealHandler) CreateIngredient(c *gin.Context) {

	var req dto.CreateIngredientRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body " + err.Error()})
		return
	}

	ing, err := h.App.MealService.CreateIngredient(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create ingredient " + err.Error()})
	}
	c.JSON(http.StatusCreated, ing)
}
func (h *MealHandler) CreateRecipe(c *gin.Context) {
	var req dto.CreateRecipeRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body " + err.Error()})
		return
	}
	recipe, err := h.App.MealService.CreateRecipe(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create recipe " + err.Error()})
	}
	c.JSON(http.StatusCreated, recipe)
}
func (h *MealHandler) GetRecipeByName(c *gin.Context) {
	recipeName := c.Param("name")
	if recipeName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Recipe name parameter is missing in the URL path."})
	}
	recipeDTO, err := h.App.MealService.GetRecipeByName(c.Request.Context(), recipeName)
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
func (h *MealHandler) LogMeal(c *gin.Context) {

}
