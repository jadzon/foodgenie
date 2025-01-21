package services

import (
	"foodgenie/internal/models"
	"math/rand"
)

type AIService struct{}

func NewAIService() *AIService {
	return &AIService{}
}

// SendImageToAI mock implementation for generating a random AIResponse
func (s *AIService) SendImageToAI(imageData []byte) (*models.AIResponse, error) {
	// Example mock data
	mockMeals := []models.AIResponse{
		{
			Ingredients: []models.Ingredient{
				{"Chicken Breast", 165.0},
				{"Rice", 200.0},
				{"Broccoli", 55.0},
			},
			Calories: 420.0,
		},
		{
			Ingredients: []models.Ingredient{
				{"Salmon", 180.0},
				{"Quinoa", 220.0},
				{"Asparagus", 40.0},
			},
			Calories: 440.0,
		},
		{
			Ingredients: []models.Ingredient{
				{"Beef Steak", 250.0},
				{"Mashed Potatoes", 150.0},
				{"Green Beans", 60.0},
			},
			Calories: 460.0,
		},
	}

	// Randomly select a meal
	randomIndex := rand.Intn(len(mockMeals))

	return &mockMeals[randomIndex], nil
}
