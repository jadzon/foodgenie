package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
type Ingredient struct {
	BaseModel
	Name            string  `gorm:"not null;uniqueIndex"`
	CaloriesPerGram float64 `gorm:"not null;default:0"`
}
type RecipeIngredientUsage struct {
	BaseModel
	RecipeID     uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:idx_recipe_ingredient_usage"`
	IngredientID uuid.UUID  `gorm:"type:uuid;not null;uniqueIndex:idx_recipe_ingredient_usage"`
	Weight       uint       `gorm:"not null"`
	Ingredient   Ingredient `gorm:"foreignKey:IngredientID"`
}
type Recipe struct {
	BaseModel
	Name             string                  `gorm:"not null;uniqueIndex"`
	IngredientUsages []RecipeIngredientUsage `gorm:"foreignKey:RecipeID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Weight           uint                    `gorm:"not null;default:0"`
	Calories         uint                    `gorm:"not null;default:0"`
}

type Meal struct {
	BaseModel
	UserID   uuid.UUID `gorm:"type:uuid;not null;index"`
	RecipeID uuid.UUID `gorm:"type:uuid;not null;index"`
	Recipe   Recipe    `gorm:"foreignKey:RecipeID"`
	Weight   uint      `gorm:"not null"`
}
