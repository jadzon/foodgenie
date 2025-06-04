package models

type AIResponse struct {
	Ingredients []Ingredient `json:"ingredients"`
}

type Ingredient struct {
	Name     string  `json:"name"`
	Calories float64 `json:"calories"`
}
