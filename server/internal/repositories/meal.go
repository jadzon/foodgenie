package repositories

import (
	"foodgenie/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type mealRepository struct {
	db *gorm.DB
}

func (r *mealRepository) GetMealsForUser(userID uuid.UUID, page int) ([]*models.LoggedMeal, error) {
	var loggedMeals []*models.LoggedMeal
	var pageSize int = 10
	tx := r.db.Model(&models.LoggedMeal{}).Where("user_id = ?", userID).Order("created_at DESC").Limit(pageSize).Offset(pageSize * (page - 1)).Preload("recepies").Find(&loggedMeals)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return loggedMeals, nil
}

type MealRepository interface {
	GetMealsForUser(userID uuid.UUID, page int) ([]*models.LoggedMeal, error)
}

func NewMealRepository(db *gorm.DB) MealRepository {
	return &mealRepository{db}
}
