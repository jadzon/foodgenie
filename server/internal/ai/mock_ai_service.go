package ai

import (
	"context"
	"foodgenie/internal/dto"
	"io"
)

type mockAIService struct{}

func NewMockAIService() AIService {
	return &mockAIService{}
}

func (s *mockAIService) AnalyzeMealImage(ctx context.Context, image io.Reader) (*dto.AIAnalysisResponseDTO, error) {
	mockMealName := "Chicken with rice and pepper"
	var mockMealWeight uint = 1500
	analysisResult := &dto.AIAnalysisResponseDTO{
		Name:   mockMealName,
		Weight: mockMealWeight,
	}
	return analysisResult, nil
}
