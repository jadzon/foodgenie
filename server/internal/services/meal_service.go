package services

import (
	"foodgenie/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
)

type mealService struct {
	mealRepo repositories.MealRepository
}

// creates meal for user
// func (s *mealService) CreateMealForUser(ctx context.Context, req *dto.CreateMealRequestDTO) (*dto.MealDetailResponseDTO, error) {
// 	if req.Name == "" || req.Weight == 0 {
// 		return nil, fmt.Errorf("invalid request body")
// 	}
// 	mealToCreate, err := s.buildMealFromDTO(ctx, req)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to build meal from dto %w", err)
// 	}
// 	createdMeal, err := s.mealRepo.CreateMeal(mealToCreate)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create meal %w", err)
// 	}
// 	mealDetailDTO := mapMealToDetailDTO(createdMeal)
// 	return mealDetailDTO, nil

// }
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
	}
	return mealDTO
}

// func (s *mealService) buildMealFromDTO(ctx context.Context, mealDTO *dto.CreateMealRequestDTO) (*models.Meal, error) {
// 	if mealDTO.Name == "" || mealDTO.Weight == 0 {
// 		return nil, fmt.Errorf("wrong meal data")
// 	}
// 	recipe, err := s.mealRepo.GetRecipeByName(ctx, mealDTO.Name)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to retrieve recipe %w", err)
// 	}
// 	mealModel := &models.Meal{
// 		UserID:   mealDTO.UserID,
// 		RecipeID: recipe.ID,
// 		Recipe:   *recipe,
// 		Weight:   mealDTO.Weight,
// 	}
// 	return mealModel, nil
// }

type MealService interface {
}

func NewMealService(mealRepo repositories.MealRepository) MealService {
	return &mealService{
		mealRepo: mealRepo,
	}
}
