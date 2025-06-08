package models

type Ingredient struct {
	BaseModel
	Name            string  `gorm:"not null;uniqueIndex"`
	CaloriesPerGram float64 `gorm:"not null;default:0"`
}
