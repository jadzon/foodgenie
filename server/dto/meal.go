package dto

import (
	"time"

	"github.com/google/uuid"
)

// --- Recipe Request DTOs ---
type RecipeIngredientDefinitionDTO struct {
	Name     string  `json:"name" validate:"required,min=2"`
	Weight   float64 `json:"weight" validate:"required,gt=0"`
	Calories uint    `json:"calories" validate:"required,gte=0"`
}

type RecipeIngredientDetailDTO struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Weight   uint      `json:"weight"`
	Calories uint      `json:"calories"`
}
type RecipeDetailResponseDTO struct {
	ID            uuid.UUID
	Name          string
	Ingredients   []RecipeIngredientDetailDTO
	TotalWeight   uint
	TotalCalories uint
}

type MealDetailResponseDTO struct {
	ID            uuid.UUID                   `json:"id"`
	Name          string                      `json:"name"`
	Ingredients   []RecipeIngredientDetailDTO `json:"ingredients"`
	TotalWeight   uint                        `json:"totalWeight"`
	TotalCalories uint                        `json:"totalCalories"`
	CreatedAt     time.Time                   `json:"createdAt,omitempty"`
	UpdatedAt     time.Time                   `json:"updatedAt,omitempty"`
}

// --- LoggedMeal Request DTO ---
type LogMealRequestDTO struct {
	UserID     uuid.UUID `json:"-"`
	RecipeName string    `json:"recipeName,omitempty"`
	RecipeID   uuid.UUID `json:"recipeId,omitempty"`
	Weight     uint      `json:"consumedWeight" validate:"required,gt=0"`
}

// --- LoggedMeal Response DTOs ---
type RecipeSummaryDTO struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type LoggedMealResponseDTO struct {
	ID       uuid.UUID        `json:"id"`
	UserID   uuid.UUID        `json:"userId"`
	Recipe   RecipeSummaryDTO `json:"recipe"`
	Weight   float64          `json:"weight"`
	Calories uint             `json:"calories"`
	LoggedAt time.Time        `json:"loggedAt"`
}

type PaginatedLoggedMealsResponseDTO struct {
	Meals      []LoggedMealResponseDTO `json:"meals"`
	TotalCount int64                   `json:"totalCount"`
	Page       int                     `json:"page"`
	PageSize   int                     `json:"pageSize"`
}
type RecipeIngredientUsageRequestDTO struct {
	Name   string `json:"name" validate:"required"`
	Weight uint   `json:"weight" validate:"required,gt=0"`
}

type CreateRecipeRequestDTO struct {
	Name        string                            `json:"name" validate:"required,min=3"`
	Ingredients []RecipeIngredientUsageRequestDTO `json:"ingredients" validate:"required,min=1,dive"`
}
type CreateIngredientRequestDTO struct {
	Name            string
	CaloriesPerGram float64
}
type CreateMealRequestDTO struct {
	Name   string    `json:"name" validate:"required,min=3"`
	Weight uint      `json:"weight" validate:"required,min=1"`
	UserID uuid.UUID `json:"-"`
}
