package seeds

import (
	"context"
	"encoding/json"
	"fmt"
	"foodgenie/internal/app"
	"foodgenie/internal/dto"
	"log"
	"os"
)

func Seed(application *app.App) {
	seeder := NewSeeder(application)

	ingredients, err := loadIngredients()
	if err != nil {
		log.Fatalf("Failed to load ingredients: %v", err)
	}

	recipes, err := loadRecipes()
	if err != nil {
		log.Fatalf("Failed to load recipes: %v", err)
	}

	log.Println("Seeding ingredients...")
	if err := seeder.seedIngredients(ingredients); err != nil {
		log.Fatalf("Failed to seed ingredients: %v", err)
	}

	log.Println("Seeding recipes...")
	if err := seeder.seedRecipes(recipes); err != nil {
		log.Fatalf("Failed to seed recipes: %v", err)
	}

	log.Println("All seeding completed successfully!")
}
func loadIngredients() ([]*dto.CreateIngredientRequestDTO, error) {
	data, err := os.ReadFile("seeds/ingredients.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read ingredients.json: %w", err)
	}

	var ingredients []*dto.CreateIngredientRequestDTO

	err = json.Unmarshal(data, &ingredients)
	if err != nil {
		return nil, fmt.Errorf("failed to parse ingredients JSON: %w", err)
	}

	return ingredients, nil
}

type seeder struct {
	App *app.App
}

func NewSeeder(app *app.App) *seeder {
	return &seeder{
		App: app,
	}
}
func (s *seeder) seedIngredients(ingredients []*dto.CreateIngredientRequestDTO) error {
	ctx := context.Background()
	for _, ing := range ingredients {
		_, err := s.App.IngredientService.CreateIngredient(ctx, *ing)
		if err != nil {
			return err
		}
	}
	return nil
}
func loadRecipes() ([]*dto.CreateRecipeRequestDTO, error) {
	data, err := os.ReadFile("seeds/recipes.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read recipes.json: %w", err)
	}

	var recipes []*dto.CreateRecipeRequestDTO

	err = json.Unmarshal(data, &recipes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse recipes JSON: %w", err)
	}

	return recipes, nil
}
func (s *seeder) seedRecipes(recipes []*dto.CreateRecipeRequestDTO) error {
	ctx := context.Background()

	for _, recipe := range recipes {
		_, err := s.App.RecipeService.CreateRecipe(ctx, recipe)
		if err != nil {
			return fmt.Errorf("failed to create recipe %s: %w", recipe.Name, err)
		}
		log.Printf("Created recipe: %s", recipe.Name)
	}
	return nil
}
