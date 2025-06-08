package repositories

import (
	"context"
	"errors"
	"foodgenie/internal/models"

	"gorm.io/gorm"
)

type ingredientRepository struct {
	db *gorm.DB
}

type IngredientRepository interface {
	CreateIngredient(ingredient *models.Ingredient) (*models.Ingredient, error)
	GetIngredientByName(ctx context.Context, name string) (*models.Ingredient, error)
	GetIngredientsByNames(ctx context.Context, names []string) ([]*models.Ingredient, error)
}

func NewIngredientRepository(db *gorm.DB) IngredientRepository {
	return &ingredientRepository{
		db: db,
	}
}
func (r *ingredientRepository) CreateIngredient(ingredient *models.Ingredient) (*models.Ingredient, error) {
	tx := r.db.Create(&ingredient)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return ingredient, nil
}
func (r *ingredientRepository) GetIngredientByName(ctx context.Context, name string) (*models.Ingredient, error) {
	var ing *models.Ingredient
	tx := r.db.WithContext(ctx).Model(&models.Ingredient{}).Where("name = ?", name).First(&ing)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return ing, nil
}
func (r *ingredientRepository) GetIngredientsByNames(ctx context.Context, names []string) ([]*models.Ingredient, error) {
	var ingredients []*models.Ingredient
	if len(names) == 0 {
		return nil, errors.New("empty ingredient names list")
	}
	tx := r.db.WithContext(ctx).Model(&models.Ingredient{}).Where("name IN ?", names).Find(&ingredients)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return ingredients, nil
}
