package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"foodgenie/internal/models"
	"mime/multipart"
	"net/http"
)

type AIService struct {
	AIEndpoint string
}

func NewAIService(endpoint string) *AIService {
	return &AIService{AIEndpoint: endpoint}
}

// SendImageToAI mock implementation for generating a random AIResponse
func (s *AIService) SendImageToAI(imageData []byte) (*models.AIResponse, error) {
	// Tworzenie żądania multipart/form-data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Dodaj obraz do requestu
	part, err := writer.CreateFormFile("image", "image.jpg")
	if err != nil {
		return nil, fmt.Errorf("nie udało się utworzyć pola pliku: %v", err)
	}
	_, err = part.Write(imageData)
	if err != nil {
		return nil, fmt.Errorf("nie udało się zapisać danych obrazu: %v", err)
	}

	// Zamknij writer, aby zakończyć tworzenie multipart/form-data
	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("nie udało się zamknąć writer: %v", err)
	}

	// Tworzenie żądania HTTP
	req, err := http.NewRequest("POST", s.AIEndpoint+"/analyse", body)
	if err != nil {
		return nil, fmt.Errorf("nie udało się utworzyć żądania HTTP: %v", err)
	}

	// Dodanie nagłówków
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("Authorization", "sekretnehaslo") // Klucz autoryzacyjny serwera AI

	// Wysłanie żądania
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("błąd podczas wysyłania żądania do AI: %v", err)
	}
	defer resp.Body.Close()

	// Sprawdzenie statusu odpowiedzi
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("serwer AI zwrócił błąd: %s", resp.Status)
	}

	// Odczytanie odpowiedzi
	var aiResponse models.AIResponse
	err = json.NewDecoder(resp.Body).Decode(&aiResponse)
	if err != nil {
		return nil, fmt.Errorf("nie udało się zdekodować odpowiedzi AI: %v", err)
	}

	return &aiResponse, nil
}
