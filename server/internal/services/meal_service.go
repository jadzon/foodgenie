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
	weight := (aiAnalysis.Volume / recipeModel.Volume) * float64(recipeModel.Weight)
	mealToLog := &models.Meal{
		UserID:   userID,
		RecipeID: recipeModel.ID,
		Weight:   uint(weight),
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
func (s *mealService) GetMealsForUser(ctx context.Context, userID uuid.UUID, page int) ([]*dto.MealResponseDTO, error) {
	mealModels, err := s.mealRepo.GetMealsForUser(ctx, userID, page)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch meals: %w", err)
	}
	meals := make([]*dto.MealResponseDTO, len(mealModels))
	for i, meal := range mealModels {
		ratio := float64(meal.Weight) / float64(meal.Recipe.Weight)
		totalCalories := uint(float64(meal.Recipe.Calories) * ratio)

		meals[i] = &dto.MealResponseDTO{
			ID:            meal.ID,
			Name:          meal.Recipe.Name,
			TotalWeight:   meal.Weight,
			TotalCalories: totalCalories,
			CreatedAt:     meal.CreatedAt,
			UpdatedAt:     meal.UpdatedAt,
		}
	}

	return meals, nil
}
func (s *mealService) GetMealDetails(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) (*dto.MealDetailResponseDTO, error) {
	mealModel, err := s.mealRepo.GetMealByID(ctx, userID, mealID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch meal: %w", err)
	}
	mealDetailDTO := mapMealToDetailDTO(mealModel)
	return mealDetailDTO, nil
}
func (s *mealService) DeleteMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) error {
	err := s.mealRepo.DeleteMealByID(ctx, userID, mealID)
	if err != nil {
		return err
	}
	return nil
}
func (s *mealService) GetMealCountForUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	count, err := s.mealRepo.GetMealCountForUser(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to get meal count: %w", err)
	}
	return count, nil
}

type MealService interface {
	CreateMealForUser(ctx context.Context, req *dto.CreateMealRequestDTO) (*dto.MealDetailResponseDTO, error)
	ProcessAndLogMealFromImage(ctx context.Context, userID uuid.UUID, image io.Reader) (*dto.MealDetailResponseDTO, error)
	GetMealsForUser(ctx context.Context, userID uuid.UUID, page int) ([]*dto.MealResponseDTO, error)
	GetMealDetails(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) (*dto.MealDetailResponseDTO, error)
	DeleteMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) error
	GetMealCountForUser(ctx context.Context, userID uuid.UUID) (int64, error)
}

func NewMealService(mealRepo repositories.MealRepository, recipeRepo repositories.RecipeRepository, aiService ai.AIService) MealService {
	return &mealService{
		mealRepo:   mealRepo,
		recipeRepo: recipeRepo,
		aiService:  aiService,
	}
}
