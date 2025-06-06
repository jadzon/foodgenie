package services

import (
	"context"
	"errors"
	"fmt"
	"foodgenie/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"

	"github.com/google/uuid"
)

type mealService struct {
	mealRepo repositories.MealRepository
}

func (s *mealService) CreateIngredient(ctx context.Context, req dto.CreateIngredientRequestDTO) (*models.Ingredient, error) {
	if req.Name == "" {
		return nil, errors.New("ingredient name cannot be empty")
	}
	ingToCreate := models.Ingredient{
		Name:            req.Name,
		CaloriesPerGram: req.CaloriesPerGram,
	}
	ing, err := s.mealRepo.CreateIngredient(&ingToCreate)
	if err != nil {
		return nil, errors.New("failed to create ingredient")
	}
	return ing, nil
}

// Creates recipe from CreateRecipeRequestDTO
func (s *mealService) CreateNewRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error) {
	if req.Name == "" || len(req.Ingredients) == 0 {
		return nil, errors.New("recipe name and at least one ingredient are required")
	}
	recipeToCreate, ingModels, err := s.buildRecipeFromDTO(ctx, req)
	if err != nil {
		return nil, errors.New("could not prepare model for creation " + err.Error())
	}
	createdRecipe, err := s.mealRepo.CreateRecipe(recipeToCreate)
	if err != nil {
		return nil, errors.New("failed to create recipe " + err.Error())
	}
	recipeDTO := mapRecipeToResponseDTO(createdRecipe, ingModels)
	return recipeDTO, nil
}

// Builds Recipe model from CreateRecipeRequestDTO
func (s *mealService) buildRecipeFromDTO(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*models.Recipe, []*models.Ingredient, error) {
	var totalCalories uint
	var totalWeight uint
	var ingUsages []models.RecipeIngredientUsage
	var ingNames []string
	for _, recipeIng := range req.Ingredients {
		if recipeIng.Name == "" {
			return nil, nil, fmt.Errorf("empty ingredient name")
		}
		ingNames = append(ingNames, recipeIng.Name)
	}
	ingredientModels, err := s.mealRepo.GetIngredientsByNames(ctx, ingNames)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get ingredients %w", err)
	}
	ingredientModelsMap := make(map[string]*models.Ingredient)
	for _, ing := range ingredientModels {
		ingredientModelsMap[ing.Name] = ing
	}
	for _, ing := range req.Ingredients {
		ingModel, ok := ingredientModelsMap[ing.Name]
		if !ok {
			return nil, nil, fmt.Errorf("master ingredient not found in database: %s", ing.Name)
		}
		totalCalories += uint(float64(ing.Weight) * ingModel.CaloriesPerGram)
		totalWeight += ing.Weight
		ingUsages = append(ingUsages, models.RecipeIngredientUsage{Weight: ing.Weight, IngredientID: ingModel.ID})
	}
	recipeToCreate := models.Recipe{
		Name:             req.Name,
		IngredientUsages: ingUsages,
		Weight:           totalWeight,
		Calories:         totalCalories,
	}
	return &recipeToCreate, ingredientModels, nil
}
func mapRecipeToResponseDTO(recipe *models.Recipe, ingredients []*models.Ingredient) *dto.RecipeDetailResponseDTO {

	var ingredientsDTOS []dto.RecipeIngredientDetailDTO
	ingredientModelsMap := make(map[uuid.UUID]*models.Ingredient)
	for _, ing := range ingredients {
		ingredientModelsMap[ing.ID] = ing
	}
	for _, usage := range recipe.IngredientUsages {
		ing := ingredientModelsMap[usage.IngredientID]
		calories := uint(ing.CaloriesPerGram * float64(usage.Weight))
		ingredientDTO := dto.RecipeIngredientDetailDTO{
			ID:       ing.ID,
			Name:     ing.Name,
			Weight:   usage.Weight,
			Calories: calories,
		}
		ingredientsDTOS = append(ingredientsDTOS, ingredientDTO)
	}

	recipeDTO := &dto.RecipeDetailResponseDTO{
		ID:            recipe.ID,
		Name:          recipe.Name,
		Ingredients:   ingredientsDTOS,
		TotalWeight:   recipe.Weight,
		TotalCalories: recipe.Calories,
	}
	return recipeDTO
}

type MealService interface {
	CreateIngredient(ctx context.Context, req dto.CreateIngredientRequestDTO) (*models.Ingredient, error)
	CreateNewRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error)
}

func NewMealService(mealRepo repositories.MealRepository) MealService {
	return &mealService{
		mealRepo: mealRepo,
	}
}
