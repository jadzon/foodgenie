package dto

import "time"

// MealIngredientDetailDTO represents a single ingredient's details
type MealIngredientDetailDTO struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Weight   float64 `json:"weight"`
	Calories uint    `json:"calories"`
}

// MealDetailResponseDTO is the DTO for sending the full details of a meal
// definition back to the client.
type MealDetailResponseDTO struct {
	ID          uint                      `json:"id"`
	Name        string                    `json:"name"`
	Ingredients []MealIngredientDetailDTO `json:"ingredients"`
	Weight      float64                   `json:"weight"`
	Calories    uint                      `json:"calories"`
	CreatedAt   time.Time                 `json:"createdAt,omitempty"`
	UpdatedAt   time.Time                 `json:"updatedAt,omitempty"`
}
