package services

import (
	"context"
	"fmt"
	"foodgenie/internal/ai"
	"foodgenie/internal/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
	"io"

	"github.com/google/uuid"
)

type mealService struct {
	mealRepo   repositories.MealRepository
	recipeRepo repositories.RecipeRepository
	aiService  ai.AIService
}

// creates meal for user
func (s *mealService) CreateMealForUser(ctx context.Context, req *dto.CreateMealRequestDTO) (*dto.MealDetailResponseDTO, error) {
	if req.Name == "" || req.Weight == 0 {
		return nil, fmt.Errorf("invalid request body")
	}
	// create request dto ---> model
	mealToCreate, err := s.buildMealFromDTO(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to build meal from dto %w", err)
	}
	createdMeal, err := s.mealRepo.CreateMeal(mealToCreate)
	if err != nil {
		return nil, fmt.Errorf("failed to create meal %w", err)
	}
	// model --> meal detail dto
	mealDetailDTO := mapMealToDetailDTO(createdMeal)
	return mealDetailDTO, nil

}
func (s *mealService) ProcessAndLogMealFromImage(ctx context.Context, userID uuid.UUID, image io.Reader) (*dto.MealDetailResponseDTO, error) {
	// sending image to ai for analysis
	aiAnalysis, err := s.aiService.AnalyzeMealImage(ctx, image)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze meal image %w", err)
	}
	// fetching recipe with matching name
	recipeModel, err := s.recipeRepo.GetRecipeByName(ctx, aiAnalysis.Name)
	if err != nil {
		return nil, fmt.Errorf("invalid recipe name %w", err)
	}
	mealToLog := &models.Meal{
		UserID:   userID,
		RecipeID: recipeModel.ID,
		Weight:   aiAnalysis.Weight,
		Recipe:   *recipeModel,
	}
	loggedMeal, err := s.mealRepo.CreateMeal(mealToLog)
	if err != nil {
		return nil, fmt.Errorf("failed to log meal %w", err)
	}
	return mapMealToDetailDTO(loggedMeal), nil
}
func mapMealToDetailDTO(meal *models.Meal) *dto.MealDetailResponseDTO {
	ratio := float64(meal.Weight) / float64(meal.Recipe.Weight)
	var ingredientDTOS []dto.RecipeIngredientDetailDTO
	for _, usage := range meal.Recipe.IngredientUsages {
		ingWeight := uint(float64(usage.Weight) * ratio)
		ingDTO := dto.RecipeIngredientDetailDTO{
			ID:       usage.Ingredient.ID,
			Name:     usage.Ingredient.Name,
			Weight:   ingWeight,
			Calories: uint(float64(ingWeight) * usage.Ingredient.CaloriesPerGram),
		}
		ingredientDTOS = append(ingredientDTOS, ingDTO)
	}
	mealDTO := &dto.MealDetailResponseDTO{
		ID:            meal.ID,
		Name:          meal.Recipe.Name,
		Ingredients:   ingredientDTOS,
		TotalWeight:   meal.Weight,
		TotalCalories: uint(float64(meal.Recipe.Calories) * ratio),
		CreatedAt:     meal.CreatedAt,
	}
	return mealDTO
}

func (s *mealService) buildMealFromDTO(ctx context.Context, mealDTO *dto.CreateMealRequestDTO) (*models.Meal, error) {
	if mealDTO.Name == "" || mealDTO.Weight == 0 {
		return nil, fmt.Errorf("wrong meal data")
	}
	recipe, err := s.recipeRepo.GetRecipeByName(ctx, mealDTO.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve recipe %w", err)
	}
	mealModel := &models.Meal{
		UserID:   mealDTO.UserID,
		RecipeID: recipe.ID,
		Recipe:   *recipe,
		Weight:   mealDTO.Weight,
	}
	return mealModel, nil
}

type MealService interface {
	CreateMealForUser(ctx context.Context, req *dto.CreateMealRequestDTO) (*dto.MealDetailResponseDTO, error)
	ProcessAndLogMealFromImage(ctx context.Context, userID uuid.UUID, image io.Reader) (*dto.MealDetailResponseDTO, error)
}

func NewMealService(mealRepo repositories.MealRepository, recipeRepo repositories.RecipeRepository, aiService ai.AIService) MealService {
	return &mealService{
		mealRepo:   mealRepo,
		recipeRepo: recipeRepo,
		aiService:  aiService,
	}
}
