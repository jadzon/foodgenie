package services

import (
	"context"
	"errors"
	"foodgenie/internal/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
)

type ingredientService struct {
	ingredientRepo repositories.IngredientRepository
}

type IngredientService interface {
	CreateIngredient(ctx context.Context, req dto.CreateIngredientRequestDTO) (*models.Ingredient, error)
}

func NewIngredientService(ingredientRepo repositories.IngredientRepository) IngredientService {
	return &ingredientService{
		ingredientRepo: ingredientRepo,
	}
}
func (s *ingredientService) CreateIngredient(ctx context.Context, req dto.CreateIngredientRequestDTO) (*models.Ingredient, error) {
	if req.Name == "" {
		return nil, errors.New("ingredient name cannot be empty")
	}
	ingToCreate := models.Ingredient{
		Name:            req.Name,
		CaloriesPerGram: req.CaloriesPerGram,
	}
	ing, err := s.ingredientRepo.CreateIngredient(&ingToCreate)
	if err != nil {
		return nil, errors.New("failed to create ingredient")
	}
	return ing, nil
}
