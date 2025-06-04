package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecipeIngredient struct {
	gorm.Model
	RecipeID uint   `gorm:"not null;index"` // Foreign key to the Recipe
	Name     string `gorm:"not null"`       // Name of the ingredient (e.g., "Chicken Breast", "Olive Oil")
	// Weight is the standard weight of this ingredient as part of the recipe.
	Weight float64 `gorm:"not null"`
	// Calories is the number of calories for the Weight of this ingredient in this recipe.
	Calories uint `gorm:"not null"`
}
type Recipe struct {
	gorm.Model
	Name        string             `gorm:"not null;uniqueIndex"`                                              // Name of the recipe (e.g., "Chicken Stir-fry")
	Ingredients []RecipeIngredient `gorm:"foreignKey:RecipeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"` // List of ingredients for this recipe
	// Weight is the sum of Weight of all ingredients in this recipe.
	Weight float64 `gorm:"not null;default:0"`
	// Calories is the sum of Calories of all ingredients in this recipe.
	Calories uint `gorm:"not null;default:0"`
}

type LoggedMeal struct {
	gorm.Model
	UserID   uuid.UUID `gorm:"type:uuid;not null;index"`
	RecipeID uint      `gorm:"not null;index"` // Foreign key to the Recipe
	Recipe   Recipe    `gorm:"foreignKey:RecipeID"`
	// Weight is the actual weight of the recipe portion that was consumed.
	Weight float64 `gorm:"not null"`
}
