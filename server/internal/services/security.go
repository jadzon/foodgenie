package services

import (
	"foodgenie/internal/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type securityService struct {
	Config config.JWTConfig
}
type SecurityService interface {
	ComparePasswordAndHash(password, hashedPassword string) error
	GenerateHashFromPassword(password string) (string, error)
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

type TokenDetails struct {
	AccessToken  string
	RefreshToken string
	AtExpires    int64
	RtExpires    int64
}

// CustomClaims has only the user's ID plus the registered claims.
type CustomClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateTokens creates a short-lived access token
// and a longer-lived refresh token
//
//	userID       = the UUID from your User struct
//	accessSecret = secret key for signing the access token
//	refreshSecret= secret key for signing the refresh token
func GenerateTokens(userID uuid.UUID, accessSecret, refreshSecret string) (*TokenDetails, error) {
	tokenDetails := &TokenDetails{}

	accessTokenExpiry := time.Now().Add(15 * time.Minute).Unix()
	refreshTokenExpiry := time.Now().Add(7 * 24 * time.Hour).Unix()

	tokenDetails.AtExpires = accessTokenExpiry
	tokenDetails.RtExpires = refreshTokenExpiry

	accessClaims := &CustomClaims{
		UserID: userID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(accessTokenExpiry, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "foodgenie",
			Subject:   userID.String(),
		},
	}

	// Create the token with the claims
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)

	// Sign (encode) using the accessSecret
	at, err := accessToken.SignedString([]byte(accessSecret))
	if err != nil {
		return nil, err
	}
	tokenDetails.AccessToken = at

	refreshClaims := &CustomClaims{
		UserID: userID.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Unix(refreshTokenExpiry, 0)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "foodgenie",
			Subject:   userID.String(),
		},
	}

	// Create the token with the claims
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)

	rt, err := refreshToken.SignedString([]byte(refreshSecret))
	if err != nil {
		return nil, err
	}
	tokenDetails.RefreshToken = rt

	return tokenDetails, nil
}
