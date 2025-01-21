package handlers

import (
	"foodgenie/internal/app"
	"github.com/gin-gonic/gin"
	"net/http"
)

type MediaHandler struct {
	App *app.App
}

// NewMediaHandler tworzy nową instancję MediaHandler
func NewMediaHandler(app *app.App) *MediaHandler {
	return &MediaHandler{
		App: app,
	}
}

// UploadImage obsługuje przesyłanie obrazu
func (h *MediaHandler) UploadImage(c *gin.Context) {
	// Pobierz plik z requestu
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "failed to process the file"})
		return
	}
	defer file.Close()

	// Wywołanie MediaService do przetworzenia obrazu
	mediaService := h.App.MediaService
	response, err := mediaService.UploadImage(file, header.Filename)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed to process the image", "error": err.Error()})
		return
	}

	// Zwróć odpowiedź od AI (mockowaną w MediaService)
	c.JSON(http.StatusOK, gin.H{
		"ingredients": response.Ingredients,
		"calories":    response.Calories,
	})
}
