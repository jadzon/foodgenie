package ai

import (
	"context"
	"foodgenie/dto"
	"io"
)

type AIService interface {
	AnalyzeMealImage(ctx context.Context, image io.Reader) (*dto.AIAnalysisResponseDTO, error)
}
