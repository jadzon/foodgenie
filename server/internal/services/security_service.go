package services

import (
	"errors"
	"foodgenie/internal/config"
	"foodgenie/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type securityService struct {
	Config config.JWTConfig
}
type SecurityService interface {
	ComparePasswordAndHash(password, hashedPassword string) error
	GenerateHashFromPassword(password string) (string, error)
	GenerateAccessToken(user *models.User) (string, error)
	GenerateRefreshToken(user *models.User) (string, error)
	ExtractUserIDfromAccessToken(tokenString string) (uuid.UUID, error)
	ExtractUserIDfromRefreshToken(tokenString string) (uuid.UUID, error)
}

func NewSecurityService(cfg config.JWTConfig) SecurityService {
	return &securityService{
		Config: cfg,
	}

}
func (s *securityService) GenerateHashFromPassword(password string) (string, error) {
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(hashedPass), nil
}
func (s *securityService) ComparePasswordAndHash(password, hashedPassword string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err
}

type CustomClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func (s *securityService) GenerateAccessToken(user *models.User) (string, error) {
	accessTokenExpiry := time.Now().Add(15 * time.Minute).Unix()

	accessClaims := &CustomClaims{
		UserID: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(accessTokenExpiry, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "foodgenie",
			Subject:   user.Username,
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)

	at, err := accessToken.SignedString([]byte(s.Config.AccessTokenSecret))
	if err != nil {
		return "", err
	}

	return at, nil
}
func (s *securityService) GenerateRefreshToken(user *models.User) (string, error) {
	refreshTokenExpiry := time.Now().Add(1 * time.Hour).Unix()

	refreshClaims := &CustomClaims{
		UserID: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(refreshTokenExpiry, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "foodgenie",
			Subject:   user.Username,
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	rt, err := refreshToken.SignedString([]byte(s.Config.RefreshTokenSecret))
	if err != nil {
		return "", err
	}

	return rt, nil
}
func (s *securityService) ExtractUserIDfromAccessToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.Config.AccessTokenSecret), nil // Use secret key from the struct
		})
	if err != nil {
		return uuid.UUID{}, errors.New("error 1 while parsing token")
	}
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		parsedUserID, err := uuid.Parse(claims.UserID)
		if err != nil {
			return uuid.UUID{}, errors.New("error 2 while parsing token")
		}
		return parsedUserID, err
	}

	return uuid.UUID{}, errors.New("invalid token claims")
}
func (s *securityService) ExtractUserIDfromRefreshToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.Config.RefreshTokenSecret), nil // Use refresh token secret
		})
	if err != nil {
		return uuid.UUID{}, errors.New("error while parsing refresh token")
	}
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		parsedUserID, err := uuid.Parse(claims.UserID)
		if err != nil {
			return uuid.UUID{}, errors.New("error 2 while parsing token")
		}
		return parsedUserID, err
	}

	return uuid.UUID{}, errors.New("invalid refresh token claims")
}
