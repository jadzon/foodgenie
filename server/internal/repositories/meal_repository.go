package repositories

import (
	"context"
	"errors"
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
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * pageSize
	tx := r.db.Model(&models.LoggedMeal{}).Where("user_id = ?", userID).Order("created_at DESC").Limit(pageSize).Offset(offset).Preload("Recipe").Find(&loggedMeals)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return loggedMeals, nil
}
func (r *mealRepository) CreateLoggedMeal(loggedMeal *models.LoggedMeal) (*models.LoggedMeal, error) {
	tx := r.db.Create(loggedMeal)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return loggedMeal, nil

}
func (r *mealRepository) GetRecipeByName(ctx context.Context, name string) (*models.Recipe, error) {
	var recipe *models.Recipe
	tx := r.db.WithContext(ctx).Model(&models.Recipe{}).Preload("IngredientUsages.Ingredient").Where("name = ?", name).First(&recipe)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return recipe, nil
}
func (r *mealRepository) CreateRecipe(recipe *models.Recipe) (*models.Recipe, error) {
	tx := r.db.Create(recipe)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return recipe, nil
}
func (r *mealRepository) CreateIngredient(ingredient *models.Ingredient) (*models.Ingredient, error) {
	tx := r.db.Create(&ingredient)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return ingredient, nil
}
func (r *mealRepository) GetIngredientByName(ctx context.Context, name string) (*models.Ingredient, error) {
	var ing *models.Ingredient
	tx := r.db.WithContext(ctx).Model(&models.Ingredient{}).Where("name = ?", name).First(&ing)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return ing, nil
}
func (r *mealRepository) GetIngredientsByNames(ctx context.Context, names []string) ([]*models.Ingredient, error) {
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

type MealRepository interface {
	GetMealsForUser(userID uuid.UUID, page int) ([]*models.LoggedMeal, error)
	CreateLoggedMeal(loggedMeal *models.LoggedMeal) (*models.LoggedMeal, error)
	GetRecipeByName(ctx context.Context, name string) (*models.Recipe, error)
	CreateRecipe(recipe *models.Recipe) (*models.Recipe, error)
	CreateIngredient(ingredient *models.Ingredient) (*models.Ingredient, error)
	GetIngredientByName(ctx context.Context, name string) (*models.Ingredient, error)
	GetIngredientsByNames(ctx context.Context, names []string) ([]*models.Ingredient, error)
}

func NewMealRepository(db *gorm.DB) MealRepository {
	return &mealRepository{db}
}
