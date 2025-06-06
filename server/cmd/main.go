package main

import (
	"fmt"
	"foodgenie/internal/app"
	"foodgenie/internal/config"
	"foodgenie/internal/database"
	"foodgenie/internal/handlers"
	"log"

	"github.com/gin-gonic/gin"
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
	router.Use(logRequestMiddleware())
	handler := handlers.NewHandler(application)
	router.POST("/api/user/register", handler.Register)
	router.POST("/api/user/login", handler.Login)
	authorized := router.Group("/api", handler.AuthCheck())
	authorized.GET("/user/get-data", handler.GetUserData)
	router.GET("")
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
