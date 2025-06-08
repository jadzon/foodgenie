package main

import (
	"fmt"
	"foodgenie/internal/app"
	"foodgenie/internal/config"
	"foodgenie/internal/database"
	"foodgenie/internal/handlers"
	"log"
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	db, err := database.InitDatabase(cfg.DB)
	if err != nil {
		panic("Failed to initialize database")
	}
	application := app.Init(db, &cfg.App)
	router := gin.Default()

	//chat gpt ----->
	//TODO: ogarnac o co tu chodzi
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// TA LINIA JEST KLUCZOWA - MÓWI WALIDATOROWI, ABY SZUKAŁ TAGU "validate"
		v.SetTagName("validate")

		// Ta część, którą już mieliśmy, jest do formatowania nazw pól w komunikatach o błędach
		v.RegisterTagNameFunc(func(fld reflect.StructField) string {
			name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
			if name == "-" {
				return ""
			}
			return name
		})
		log.Println("Validator configured successfully to use 'validate' tag.")
	}
	// <----- koniec gpt
	router.Use(logRequestMiddleware())
	handler := handlers.NewUserHandler(application)
	mealHandler := handlers.NewMealHandler(application)
	ingredientHandler := handlers.NewIngredientHandler(application)
	recipeHandler := handlers.NewRecipeHandler(application)
	router.POST("/api/user/register", handler.Register)
	router.POST("/api/user/login", handler.Login)
	router.POST("/api/ingredient", ingredientHandler.CreateIngredient)
	router.POST("/api/recipe", recipeHandler.CreateRecipe)
	router.GET("/api/recipe/:name", recipeHandler.GetRecipeByName)
	authorized := router.Group("/api", handler.AuthCheck())
	authorized.GET("/user/get-data", handler.GetUserData)
	authorized.POST("/meal", mealHandler.CreateMeal)
	// router.GET("")
	err = router.Run("localhost:8080")
	if err != nil {
		log.Fatal("failed to initialize server")
	}
}
func logRequestMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("Method:", c.Request.Method)
		fmt.Println("URL:", c.Request.URL)
		fmt.Println("Headers:")
		for key, values := range c.Request.Header {
			fmt.Printf("%s: %s\n", key, values)
		}

		c.Next()
	}
}
