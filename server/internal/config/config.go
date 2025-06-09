package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
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
	AccessTokenSecret    string
	AccessTokenDuration  time.Duration
	RefreshTokenSecret   string
	RefreshTokenDuration time.Duration
}
type ServerConfig struct {
	Port string
	Host string
}
type AppConfig struct {
	JWT JWTConfig
}
type Config struct {
	DB     DBConfig
	App    AppConfig
	Server ServerConfig
}

func LoadConfig() (*Config, error) {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Printf("Error loading .env file: %v", err)
		return nil, err
	}
	atDurationString := os.Getenv("ACCESS_TOKEN_DURATION")
	atDuration, err := time.ParseDuration(atDurationString)
	if err != nil {
		log.Println("Warning: ACCESS_TOKEN_DURATION not set or invalid. Using default 15m.")
		atDuration = 15 * time.Minute
	}

	rtDurationString := os.Getenv("REFRESH_TOKEN_DURATION")
	rtDuration, err := time.ParseDuration(rtDurationString)
	if err != nil {
		log.Println("Warning: REFRESH_TOKEN_DURATION not set or invalid. Using default 168h (7 days).")
		rtDuration = 168 * time.Hour
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
				AccessTokenSecret:    os.Getenv("ACCESS_TOKEN_SECRET"),
				AccessTokenDuration:  atDuration,
				RefreshTokenSecret:   os.Getenv("REFRESH_TOKEN_SECRET"),
				RefreshTokenDuration: rtDuration,
			},
		},
		Server: ServerConfig{
			Port: os.Getenv("SERVER_PORT"),
			Host: os.Getenv("SERVER_HOST"),
		},
	}

	return cfg, nil
}
