package app

import (
	"foodgenie/internal/config"
	"foodgenie/internal/repositories"
	"foodgenie/internal/services"
	"gorm.io/gorm"
)

type App struct {
	UserService     services.UserService
	SecurityService services.SecurityService
}

func Init(db *gorm.DB, cfg *config.AppConfig) *App {
	userRepository := repositories.NewUserRepository(db)
	securityService := services.NewSecurityService(cfg.JWT)
	userService := services.NewUserService(userRepository, securityService)
	return &App{
		UserService:     userService,
		SecurityService: securityService,
	}
}
