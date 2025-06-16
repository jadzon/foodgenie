package services

import (
	"context"
	"errors"
	"fmt"
	"foodgenie/internal/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"

	"github.com/google/uuid"
)

type recipeService struct {
	recipeRepo     repositories.RecipeRepository
	ingredientRepo repositories.IngredientRepository
}
type RecipeService interface {
	CreateRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error)
	GetRecipeByName(ctx context.Context, name string) (*dto.RecipeDetailResponseDTO, error)
}

func NewRecipeService(recipeRepo repositories.RecipeRepository, ingredientRepo repositories.IngredientRepository) RecipeService {
	return &recipeService{
		recipeRepo:     recipeRepo,
		ingredientRepo: ingredientRepo,
	}
}

// Creates recipe from CreateRecipeRequestDTO
func (s *recipeService) CreateRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error) {
	if req.Name == "" || len(req.Ingredients) == 0 {
		return nil, errors.New("recipe name and at least one ingredient are required")
	}
	recipeToCreate, ingModels, err := s.buildRecipeFromDTO(ctx, req)
	if err != nil {
		return nil, errors.New("could not prepare model for creation " + err.Error())
	}
	createdRecipe, err := s.recipeRepo.CreateRecipe(recipeToCreate)
	if err != nil {
		return nil, errors.New("failed to create recipe " + err.Error())
	}
	ingMap := make(map[uuid.UUID]*models.Ingredient)
	for _, ing := range ingModels {
		ingMap[ing.ID] = ing
	}
	//hydrate Recipe with Ingredients
	for _, usage := range createdRecipe.IngredientUsages {
		usage.Ingredient = *ingMap[usage.IngredientID]
	}
	recipeDTO := mapRecipeToDTO(createdRecipe)
	return recipeDTO, nil
}

// Builds Recipe model from CreateRecipeRequestDTO
func (s *recipeService) buildRecipeFromDTO(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*models.Recipe, []*models.Ingredient, error) {
	var totalCalories uint
	var totalWeight uint
	var ingUsages []models.RecipeIngredientUsage
	var ingNames []string
	for _, recipeIng := range req.Ingredients {
		fmt.Println("Ingredient name: ", recipeIng.Name)
		if recipeIng.Name == "" {
			return nil, nil, fmt.Errorf("empty ingredient name")
		}
		ingNames = append(ingNames, recipeIng.Name)
	}
	ingredientModels, err := s.ingredientRepo.GetIngredientsByNames(ctx, ingNames)
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
		Volume:           req.Volume,
	}
	return &recipeToCreate, ingredientModels, nil
}

// mapRecipeToResponseDTO maps Recipe to RecipeDetailResponseDTO
func mapRecipeToDTO(recipe *models.Recipe) *dto.RecipeDetailResponseDTO {

	var ingredientsDTOS []dto.RecipeIngredientDetailDTO
	for _, usage := range recipe.IngredientUsages {
		calories := uint(usage.Ingredient.CaloriesPerGram * float64(usage.Weight))
		ingredientDTO := dto.RecipeIngredientDetailDTO{
			ID:       usage.Ingredient.ID,
			Name:     usage.Ingredient.Name,
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
		Volume:        recipe.Volume,
	}
	return recipeDTO
}

// fetches Recipe from Database
func (s *recipeService) GetRecipeByName(ctx context.Context, name string) (*dto.RecipeDetailResponseDTO, error) {
	recipeModel, err := s.recipeRepo.GetRecipeByName(ctx, name)
	if err != nil {
		return nil, fmt.Errorf("error fetching recipe %w", err)
	}
	recipeDTO := mapRecipeToDTO(recipeModel)
	return recipeDTO, nil
}
