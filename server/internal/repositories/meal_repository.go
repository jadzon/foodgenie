package repositories

import (
	"context"
	"errors"
	"fmt"
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
func (r *mealRepository) GetMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) (*models.Meal, error) {
	var meal *models.Meal
	tx := r.db.WithContext(ctx).Model(&models.Meal{}).
		Where("id = ? AND user_id = ?", mealID, userID).
		Preload("Recipe.IngredientUsages.Ingredient").
		First(&meal)

	if tx.Error != nil {
		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("meal not found")
		}
		return nil, tx.Error
	}

	return meal, nil
}
func (r *mealRepository) DeleteMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) error {
	result := r.db.WithContext(ctx).Where("id = ? AND user_id = ?", mealID, userID).Delete(&models.Meal{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("meal not found or does not belong to user")
	}
	return nil
}

type MealRepository interface {
	GetMealsForUser(ctx context.Context, userID uuid.UUID, page int) ([]*models.Meal, error)
	CreateMeal(loggedMeal *models.Meal) (*models.Meal, error)
	GetMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) (*models.Meal, error)
	DeleteMealByID(ctx context.Context, userID uuid.UUID, mealID uuid.UUID) error
}

func NewMealRepository(db *gorm.DB) MealRepository {
	return &mealRepository{db}
}
