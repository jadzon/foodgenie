package app

import (
	"foodgenie/internal/repositories"
	"foodgenie/internal/services"
	"gorm.io/gorm"
)

type App struct {
	UserService services.UserService
}

func Init(db *gorm.DB) *App {
	userRepository := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepository)
	return &App{
		UserService: userService,
	}
}
