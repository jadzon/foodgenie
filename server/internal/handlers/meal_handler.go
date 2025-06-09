package handlers

import (
	"errors"
	"foodgenie/internal/app"
	"foodgenie/internal/dto"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MealHandler struct {
	App *app.App
}

func NewMealHandler(app *app.App) *MealHandler {
	return &MealHandler{
		App: app,
	}
}

func (h *MealHandler) CreateMeal(c *gin.Context) {
	userIDUntyped, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
	}
	userID, ok := userIDUntyped.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format in context"})
		return
	}
	var req dto.CreateMealRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}
	req.UserID = userID
	createdMealDTO, err := h.App.MealService.CreateMealForUser(c.Request.Context(), &req)
	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create meal"})
		return
	}
	c.JSON(http.StatusCreated, createdMealDTO)
}
func (h *MealHandler) LogMealFromImage(c *gin.Context) {
	userIDUntyped, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := userIDUntyped.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID format in context"})
		return
	}
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no image"})
		return
	}
	openedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to open uploaded file"})
		return
	}
	defer openedFile.Close()

	loggedMealDTO, err := h.App.MealService.ProcessAndLogMealFromImage(c.Request.Context(), userID, openedFile)

	if err != nil {
		//chat gpt error handling TODO: learn what it's doing
		if errors.Is(err, gorm.ErrRecordNotFound) || strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process and log meal: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, loggedMealDTO)
}
