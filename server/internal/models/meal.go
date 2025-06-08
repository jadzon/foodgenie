package models

import (
	"github.com/google/uuid"
)

type Meal struct {
	BaseModel
	UserID   uuid.UUID `gorm:"type:uuid;not null;index"`
	RecipeID uuid.UUID `gorm:"type:uuid;not null;index"`
	Recipe   Recipe    `gorm:"foreignKey:RecipeID"`
	Weight   uint      `gorm:"not null"`
}
