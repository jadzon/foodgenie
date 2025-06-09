package dto

type RefreshTokenRequestDTO struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}
