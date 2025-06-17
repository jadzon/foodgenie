package app

import (
	"foodgenie/internal/ai"
	"foodgenie/internal/config"
	"foodgenie/internal/repositories"
	"foodgenie/internal/services"

	"gorm.io/gorm"
)

type App struct {
	UserService       services.UserService
	SecurityService   services.SecurityService
	IngredientService services.IngredientService
	RecipeService     services.RecipeService
	MealService       services.MealService
}

func Init(db *gorm.DB, cfg *config.AppConfig) *App {
	userRepository := repositories.NewUserRepository(db)
	securityService := services.NewSecurityService(cfg.JWT)
	userService := services.NewUserService(userRepository, securityService)
	ingredientRepository := repositories.NewIngredientRepository(db)
	ingredientService := services.NewIngredientService(ingredientRepository)
	recipeRepository := repositories.NewRecipeRepository(db)
	recipeService := services.NewRecipeService(recipeRepository, ingredientRepository)
	mealRepository := repositories.NewMealRepository(db)
	aiService := ai.NewRealAIService()
	mealService := services.NewMealService(mealRepository, recipeRepository, aiService)
	return &App{
		UserService:       userService,
		SecurityService:   securityService,
		IngredientService: ingredientService,
		RecipeService:     recipeService,
		MealService:       mealService,
	}
}
