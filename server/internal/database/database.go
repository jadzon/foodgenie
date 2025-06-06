package database

import (
	"fmt"
	"foodgenie/internal/config"
	"foodgenie/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDatabase(cfg config.DBConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Europe/Warsaw",
		cfg.Host,
		cfg.User,
		cfg.Password,
		cfg.Name,
		cfg.Port,
		cfg.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("Failed to open connection")
		return nil, err
	}
	log.Println("Database connected successfully")

	err = db.AutoMigrate(
		&models.User{},
		&models.Ingredient{},
		&models.Recipe{},
		&models.RecipeIngredientUsage{},
		&models.Meal{},
	)

	if err != nil {
		log.Printf("Failed to automigrate models: %v", err)
		return nil, err
	}
	log.Println("Database migration successful")

	return db, nil
}
