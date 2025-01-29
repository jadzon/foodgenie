package main

import (
	"foodgenie/internal/app"
	"foodgenie/internal/config"
	"foodgenie/internal/database"
	"foodgenie/internal/handlers"
	"github.com/gin-gonic/gin"
	"log"
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
	handler := handlers.NewHandler(application)
	mediaHandler := handlers.NewMediaHandler(application)
	router.POST("/api/user/register", handler.Register)
	router.POST("/api/user/login", handler.Login)
	authorized := router.Group("/api", handler.AuthCheck())
	authorized.POST("/image", mediaHandler.UploadImage)
	authorized.GET("/user/get-data", handler.GetUserData)
	router.GET("")
	err = router.Run("localhost:8080")
	if err != nil {
		log.Fatal("failed to initialize server")
	}
}
