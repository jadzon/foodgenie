package main

import (
	"foodgenie/internal/app"
	"foodgenie/internal/database"
	"foodgenie/internal/handlers"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	db, err := database.InitDatabase()
	if err != nil {
		panic("Failed to initialize database")
	}
	application := app.Init(db)
	router := gin.Default()
	handler := handlers.NewHandler(application)
	router.POST("/api/user/register", handler.Register)
	router.POST("/api/user/login", handler.Login)
	err = router.Run("localhost:8080")
	if err != nil {
		log.Fatal("failed to initialize server")
	}
}
