package services

import (
	"errors"
	"fmt"
	"foodgenie/internal/models"
	"io/ioutil"
	"mime/multipart"
	"strings"
)

type mediaService struct {
	aiService *AIService
}
type MediaService interface {
	UploadImage(file multipart.File, filename string) (*models.AIResponse, error)
}

func NewMediaService(aiService *AIService) MediaService {
	return &mediaService{aiService: aiService}
}

func (s *mediaService) UploadImage(file multipart.File, filename string) (*models.AIResponse, error) {
	// Weryfikacja typu pliku
	if !isValidImage(filename) {
		return nil, errors.New("nieprawidłowy typ pliku; obsługiwane formaty: jpg, png, gif")
	}

	// Odczyt zawartości pliku
	imageData, err := ioutil.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("nie udało się odczytać pliku: %v", err)
	}

	response, err := s.aiService.SendImageToAI(imageData)
	if err != nil {
		return nil, fmt.Errorf("błąd podczas przetwarzania obrazu przez AI: %v", err)
	}

	return response, nil
}

func isValidImage(filename string) bool {
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif"}
	for _, ext := range allowedExtensions {
		if strings.HasSuffix(strings.ToLower(filename), ext) {
			return true
		}
	}
	return false
}
