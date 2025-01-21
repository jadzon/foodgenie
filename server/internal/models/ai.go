package models

type AIResponse struct {
	Ingredients []Ingredient `json:"ingredients"`
	Calories    float64      `json:"calories"`
}

type Ingredient struct {
	Name     string  `json:"name"`
	Calories float64 `json:"calories"`
}
