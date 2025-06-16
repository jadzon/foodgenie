package handlers

import (
	"errors"
	"foodgenie/internal/app"
	"foodgenie/internal/dto"
	"net/http"
	"strconv"
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
func (h *MealHandler) GetMealsForUser(c *gin.Context) {
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

	page := 1
	if pageStr := c.Query("page"); pageStr != "" {
		if parsedPage, err := strconv.Atoi(pageStr); err == nil && parsedPage > 0 {
			page = parsedPage
		}
	}

	meals, err := h.App.MealService.GetMealsForUser(c.Request.Context(), userID, page)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve meals"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"meals": meals, "page": page})
}
func (h *MealHandler) GetMealDetails(c *gin.Context) {
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
	mealIDStr := c.Param("id")
	mealID, err := uuid.Parse(mealIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meal ID format"})
		return
	}
	meal, err := h.App.MealService.GetMealDetails(c.Request.Context(), userID, mealID)
	if err != nil {
		if err.Error() == "meal not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "meal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve meal details"})
		return
	}

	c.JSON(http.StatusOK, meal)
}
func (h *MealHandler) DeleteMeal(c *gin.Context) {
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

	mealIDStr := c.Param("id")
	mealID, err := uuid.Parse(mealIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid meal ID format"})
		return
	}

	err = h.App.MealService.DeleteMealByID(c.Request.Context(), userID, mealID)
	if err != nil {
		if err.Error() == "meal not found or does not belong to user" {
			c.JSON(http.StatusNotFound, gin.H{"error": "meal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete meal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "meal deleted successfully"})
}
