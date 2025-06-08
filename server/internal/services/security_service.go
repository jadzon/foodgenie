package services

import (
	"errors"
	"fmt"
	"foodgenie/internal/config"
	"foodgenie/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
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
	ValidateAccessToken(tokenString string) (*CustomClaims, error)
	ValidateRefreshToken(tokenString string) (*CustomClaims, error)
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
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

type CustomClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

func (s *securityService) GenerateAccessToken(user *models.User) (string, error) {
	return s.generateToken(user, s.Config.AccessTokenDuration, s.Config.AccessTokenSecret)
}
func (s *securityService) GenerateRefreshToken(user *models.User) (string, error) {
	return s.generateToken(user, s.Config.RefreshTokenDuration, s.Config.RefreshTokenSecret)
}

// generates JWT token
func (*securityService) generateToken(user *models.User, duration time.Duration, secretKey string) (string, error) {
	claims := &CustomClaims{
		UserID: user.ID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "foodgenie",
			Subject:   user.Username,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("failed to sign token")
	}
	return signedToken, nil
}

// TODO: learn how does it work
func validateAndExtractClaims(tokenString string, secretKey string) (*CustomClaims, error) {
	claims := &CustomClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	// chat gpt error handling
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, errors.New("token has expired")
		}
		return nil, fmt.Errorf("could not parse token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
func (s *securityService) ValidateAccessToken(tokenString string) (*CustomClaims, error) {
	return validateAndExtractClaims(tokenString, s.Config.AccessTokenSecret)
}
func (s *securityService) ValidateRefreshToken(tokenString string) (*CustomClaims, error) {
	return validateAndExtractClaims(tokenString, s.Config.RefreshTokenSecret)
}
