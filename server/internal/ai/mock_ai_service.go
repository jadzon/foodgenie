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
	mockMealName := "Apple Pie"
	var mockMealVolume float64 = 0.7
	analysisResult := &dto.AIAnalysisResponseDTO{
		Name:   mockMealName,
		Volume: mockMealVolume,
	}
	return analysisResult, nil
}
