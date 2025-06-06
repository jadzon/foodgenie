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
func (s *mealService) CreateRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error) {
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
func (s *mealService) buildRecipeFromDTO(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*models.Recipe, []*models.Ingredient, error) {
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
	}
	return recipeDTO
}

// fetches Recipe from Database
func (s *mealService) GetRecipeByName(ctx context.Context, name string) (*dto.RecipeDetailResponseDTO, error) {
	recipeModel, err := s.mealRepo.GetRecipeByName(ctx, name)
	if err != nil {
		return nil, fmt.Errorf("error fetching recipe %w", err)
	}
	recipeDTO := mapRecipeToDTO(recipeModel)
	return recipeDTO, nil
}

// creates meal for user
func (s *mealService) CreateMealForUser(ctx context.Context, req *dto.CreateMealRequestDTO) (*dto.MealDetailResponseDTO, error) {
	if req.Name == "" || req.Weight == 0 {
		return nil, fmt.Errorf("invalid request body")
	}
	mealToCreate, err := s.buildMealFromDTO(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to build meal from dto %w", err)
	}
	createdMeal, err := s.mealRepo.CreateMeal(mealToCreate)
	if err != nil {
		return nil, fmt.Errorf("failed to create meal %w", err)
	}

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
	}
	return mealDTO
}
func (s *mealService) buildMealFromDTO(ctx context.Context, mealDTO *dto.CreateMealRequestDTO) (*models.Meal, error) {
	if mealDTO.Name == "" || mealDTO.Weight == 0 {
		return nil, fmt.Errorf("wrong meal data")
	}
	recipe, err := s.mealRepo.GetRecipeByName(ctx, mealDTO.Name)
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
	CreateIngredient(ctx context.Context, req dto.CreateIngredientRequestDTO) (*models.Ingredient, error)
	CreateRecipe(ctx context.Context, req *dto.CreateRecipeRequestDTO) (*dto.RecipeDetailResponseDTO, error)
	GetRecipeByName(ctx context.Context, name string) (*dto.RecipeDetailResponseDTO, error)
}

func NewMealService(mealRepo repositories.MealRepository) MealService {
	return &mealService{
		mealRepo: mealRepo,
	}
}
