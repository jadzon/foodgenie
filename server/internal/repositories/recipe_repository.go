package repositories

import (
	"context"
	"foodgenie/internal/models"

	"gorm.io/gorm"
)

type recipeRepository struct {
	db *gorm.DB
}
type RecipeRepository interface {
	CreateRecipe(recipe *models.Recipe) (*models.Recipe, error)
	GetRecipeByName(ctx context.Context, name string) (*models.Recipe, error)
}

func NewRecipeRepository(db *gorm.DB) RecipeRepository {
	return &recipeRepository{db: db}
}

// creates recipe
func (r *recipeRepository) CreateRecipe(recipe *models.Recipe) (*models.Recipe, error) {
	tx := r.db.Create(recipe)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return recipe, nil
}

// gets recipe by name
func (r *recipeRepository) GetRecipeByName(ctx context.Context, name string) (*models.Recipe, error) {
	var recipe *models.Recipe
	tx := r.db.WithContext(ctx).Model(&models.Recipe{}).Preload("IngredientUsages.Ingredient").Where("name = ?", name).First(&recipe)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return recipe, nil
}
