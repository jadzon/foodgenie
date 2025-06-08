package handlers

import (
	"foodgenie/internal/app"

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

func (h *MealHandler) LogMeal(c *gin.Context) {

}
