package services

import (
	"context"
	"fmt"
	"foodgenie/internal/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
	"time"

	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(ctx context.Context, req *dto.RegisterUserRequestDTO) (*dto.UserResponseDTO, error)
	Authenticate(ctx context.Context, username string, password string) (*models.User, error)
	GetUserByEmail(email string) (models.User, error)
	GetUserByUsername(username string) (*dto.UserResponseDTO, error)
	GetUserById(id uuid.UUID) (*dto.UserResponseDTO, error)
	RefreshToken(ctx context.Context, req *dto.RefreshTokenRequestDTO) (*dto.LoginResponseDTO, error)
}
type userService struct {
	userRepo        repositories.UserRepository
	securityService SecurityService
}

func NewUserService(userRepo repositories.UserRepository, securityService SecurityService) UserService {
	return &userService{
		userRepo:        userRepo,
		securityService: securityService,
	}
}

func (us *userService) CreateUser(ctx context.Context, req *dto.RegisterUserRequestDTO) (*dto.UserResponseDTO, error) {
	//hash password
	hashedPassword, err := us.securityService.GenerateHashFromPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to generate hash from password: %w", err)
	}
	req.Password = hashedPassword
	//build user model from request dto
	userToCreate := buildUserFromDTO(req)
	//create user
	createdUser, err := us.userRepo.CreateUser(userToCreate)
	if err != nil {
		return nil, fmt.Errorf("failed to create user %w", err)
	}
	userDTO := mapUserToDTO(createdUser)
	//map user model to dto
	return userDTO, err
}
func buildUserFromDTO(req *dto.RegisterUserRequestDTO) *models.User {
	userModel := &models.User{
		Username:    req.Username,
		Email:       req.Email,
		Password:    req.Password,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		DateOfBirth: req.DateOfBirth,
	}
	return userModel
}
func mapUserToDTO(user *models.User) *dto.UserResponseDTO {
	createdAtString := user.CreatedAt.Format(time.RFC3339)
	userDTO := &dto.UserResponseDTO{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DateOfBirth: createdAtString,
		CreatedAt:   user.CreatedAt,
	}
	return userDTO
}
func (s *userService) Authenticate(ctx context.Context, username string, password string) (*models.User, error) {
	// get user model
	userModel, err := s.userRepo.GetUserByUsername(username)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user %w", err)
	}
	// compare password with hash
	err = s.securityService.ComparePasswordAndHash(password, userModel.Password)
	if err != nil {
		return nil, fmt.Errorf("invalid password")
	}
	return userModel, nil
}
func (s *userService) GetUserByEmail(email string) (models.User, error) {
	return s.userRepo.GetUserByEmail(email)
}
func (s *userService) GetUserByUsername(username string) (*dto.UserResponseDTO, error) {
	userModel, err := s.userRepo.GetUserByUsername(username)
	if err != nil {
		return nil, err
	}
	return mapUserToDTO(userModel), err
}
func (s *userService) GetUserById(id uuid.UUID) (*dto.UserResponseDTO, error) {
	userModel, err := s.userRepo.GetUserById(id)
	if err != nil {
		return nil, err
	}
	return mapUserToDTO(userModel), err
}

func (s *userService) RefreshToken(ctx context.Context, req *dto.RefreshTokenRequestDTO) (*dto.LoginResponseDTO, error) {
	claims, err := s.securityService.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid token %w", err)
	}
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("invalid token %w", err)
	}
	user, err := s.userRepo.GetUserById(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user %w", err)
	}
	at, err := s.securityService.GenerateAccessToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token %w", err)
	}
	rt, err := s.securityService.GenerateRefreshToken(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token %w", err)
	}
	response := &dto.LoginResponseDTO{
		AccessToken:  at,
		RefreshToken: rt,
	}
	return response, nil
}
