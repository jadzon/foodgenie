package models

import "github.com/google/uuid"

type Recipe struct {
	BaseModel
	Name             string                  `gorm:"not null;uniqueIndex"`
	IngredientUsages []RecipeIngredientUsage `gorm:"foreignKey:RecipeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Weight           uint                    `gorm:"not null;default:0"`
	Calories         uint                    `gorm:"not null;default:0"`
}
type RecipeIngredientUsage struct {
	BaseModel
	RecipeID     uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:idx_recipe_ingredient_usage"`
	IngredientID uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:idx_recipe_ingredient_usage"`
	Weight       uint       `gorm:"not null"`
	Ingredient   Ingredient `gorm:"foreignKey:IngredientID"`
}
