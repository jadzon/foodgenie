package handlers

import (
	"fmt"
	"foodgenie/internal/app"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
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

func (h *MediaHandler) UploadImage(c *gin.Context) {
	contentType := c.GetHeader("Content-Type")
	fmt.Println("Nagłówek Content-Type otrzymany od klienta:", contentType) // Dodaj log

	if !strings.HasPrefix(contentType, "multipart/form-data") {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "Content-Type musi być multipart/form-data"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		fmt.Println("Błąd podczas pobierania pliku:", err) // Dodaj log
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "failed to process the file"})
		return
	}
	defer file.Close()

	fmt.Println("Odebrano plik:", header.Filename) // Loguj nazwę pliku

	// Wywołanie MediaService do przetworzenia obrazu
	mediaService := h.App.MediaService
	response, err := mediaService.UploadImage(file, header.Filename)
	if err != nil {
		fmt.Println("Błąd w MediaService:", err) // Logowanie błędu
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "failed to process the image", "error": err.Error()})
		return
	}

	// Zwróć odpowiedź od AI
	c.JSON(http.StatusOK, gin.H{
		"ingredients": response.Ingredients,
		"calories":    response.Calories,
	})
}
