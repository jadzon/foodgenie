package database

import (
	"fmt"
	"foodgenie/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"log"
)

func InitDatabase() (*gorm.DB, error) {
	dsn := "host=localhost user=hotdog password=hotdog dbname=foodgenie_db port=5432 sslmode=disable TimeZone=TimeZone=Europe/Warsaw"
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
