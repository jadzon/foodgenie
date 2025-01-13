package database

import (
	"fmt"
	"foodgenie/internal/config"
	"foodgenie/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
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

	var err error
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("Failed to open connection")
		return nil, err
	}
	log.Println("Database connected successfully")
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		fmt.Println("Failed to automigrate user model")
		return nil, err
	}
	return db, nil
}
