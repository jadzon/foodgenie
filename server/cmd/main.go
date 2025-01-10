package main

import (
	"foodgenie/internal/handlers"
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	router := gin.Default()
	handler := handlers.NewHandler()
	router.POST("/api/user/register")
	router.POST("/api/user/login")
	err := router.Run("8080")
	if err != nil {
		log.Fatal("failed to initialize server")
	}
}
