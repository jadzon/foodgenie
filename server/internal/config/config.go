package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
)

type DBConfig struct {
	Host     string
	Port     string
	SSLMode  string
	User     string
	Password string
	Name     string
}

type JWTConfig struct {
	AccessTokenSecret  string
	RefreshTokenSecret string
}
type AppConfig struct {
	JWT JWTConfig
}
type Config struct {
	DB  DBConfig
	App AppConfig
}

func LoadConfig() (*Config, error) {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Printf("Error loading .env file: %v", err)
		return nil, err
	}

	// Populate the configuration
	cfg := &Config{
		DB: DBConfig{
			Host:     os.Getenv("DB_HOST"),
			Port:     os.Getenv("DB_PORT"),
			SSLMode:  os.Getenv("DB_SSLMODE"),
			User:     os.Getenv("DB_USER"),
			Password: os.Getenv("DB_PASSWORD"),
			Name:     os.Getenv("DB_NAME"),
		},

		App: AppConfig{
			JWT: JWTConfig{
				AccessTokenSecret:  os.Getenv("ACCESS_TOKEN_SECRET"),
				RefreshTokenSecret: os.Getenv("REFRESH_TOKEN_SECRET"),
			},
		},
	}

	return cfg, nil
}
