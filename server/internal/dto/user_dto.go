package dto

import (
	"time"

	"github.com/google/uuid"
)

type RegisterUserRequestDTO struct {
	Username    string    `json:"username" validate:"required,min=3"`
	Email       string    `json:"email" validate:"required,email"`
	Password    string    `json:"password" validate:"required,min=8"`
	FirstName   string    `json:"firstName" validate:"required,min=2"`
	LastName    string    `json:"lastName" validate:"required"`
	DateOfBirth time.Time `json:"dateOfBirth"`
}
type LoginRequestDTO struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}
type UserResponseDTO struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	DateOfBirth string    `json:"dateOfBirth"`
	CreatedAt   time.Time `json:"createdAt"`
	MealCount   int64     `json:"mealCount"`
}
type LoginResponseDTO struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}
