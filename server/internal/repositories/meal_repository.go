package repositories

import (
	"context"
	"foodgenie/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type mealRepository struct {
	db *gorm.DB
}

func (r *mealRepository) GetMealsForUser(ctx context.Context, userID uuid.UUID, page int) ([]*models.Meal, error) {
	var loggedMeals []*models.Meal
	var pageSize int = 10
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * pageSize
	tx := r.db.WithContext(ctx).Model(&models.Meal{}).Where("user_id = ?", userID).Order("created_at DESC").Limit(pageSize).Offset(offset).Preload("Recipe").Find(&loggedMeals)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return loggedMeals, nil
}
func (r *mealRepository) CreateMeal(meal *models.Meal) (*models.Meal, error) {
	tx := r.db.Create(meal)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return meal, nil

}

type MealRepository interface {
	GetMealsForUser(ctx context.Context, userID uuid.UUID, page int) ([]*models.Meal, error)
	CreateMeal(loggedMeal *models.Meal) (*models.Meal, error)
}

func NewMealRepository(db *gorm.DB) MealRepository {
	return &mealRepository{db}
}
