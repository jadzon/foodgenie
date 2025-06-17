package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"foodgenie/internal/dto"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type realAIService struct {
	client  *http.Client
	baseURL string
}

func NewRealAIService() AIService {
	return &realAIService{
		client: &http.Client{
			Timeout: 120 * time.Second, // 60 second timeout for AI processing
		},
		baseURL: "http://food-recognition:8084", // Docker service name
	}
}

func (s *realAIService) AnalyzeMealImage(ctx context.Context, image io.Reader) (*dto.AIAnalysisResponseDTO, error) {
	// Prepare multipart form data
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Create form file with proper content type header
	h := make(map[string][]string)
	h["Content-Disposition"] = []string{`form-data; name="file"; filename="image.jpg"`}
	h["Content-Type"] = []string{"image/jpeg"}

	part, err := writer.CreatePart(h)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	_, err = io.Copy(part, image)
	if err != nil {
		return nil, fmt.Errorf("failed to copy image data: %w", err)
	}

	writer.Close()

	// Create request with context
	req, err := http.NewRequestWithContext(ctx, "POST",
		s.baseURL+"/recognize", &body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Call the food recognition service
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call AI service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI service returned status %d: %s",
			resp.StatusCode, string(bodyBytes))
	}

	var result dto.AIAnalysisResponseDTO

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode AI response: %w", err)
	}

	return &result, nil
}
