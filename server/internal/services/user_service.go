package services

import (
	"context"
	"fmt"
	"foodgenie/dto"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
	"time"

	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(ctx context.Context, req *dto.RegisterUserRequestDTO) (*dto.UserResponseDTO, error)
	ValidateUser(user *models.User) error
	GetUserByEmail(email string) (models.User, error)
	GetUserByUsername(username string) (models.User, error)
	GetUserById(id uuid.UUID) (models.User, error)
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
	//build user model from register user request
	userToCreate := buildUserFromDTO(req)
	//create user
	createdUser, err := us.userRepo.CreateUser(userToCreate)
	if err != nil {
		return nil, fmt.Errorf("failed to create user %w", err)
	}
	userDTO := mapUserToDTO(createdUser)
	//map user model to
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
func (us *userService) ValidateUser(user *models.User) error {
	userInDb, err := us.userRepo.GetUserByUsername(user.Username)
	fmt.Println("USERNAME: ", user.Username)
	if err != nil {
		return err
	}
	err = us.securityService.ComparePasswordAndHash(user.Password, userInDb.Password)
	return err
}
func (us *userService) GetUserByEmail(email string) (models.User, error) {
	return us.userRepo.GetUserByEmail(email)
}
func (us *userService) GetUserByUsername(username string) (models.User, error) {
	return us.userRepo.GetUserByUsername(username)
}
func (us *userService) GetUserById(id uuid.UUID) (models.User, error) {
	return us.userRepo.GetUserById(id)
}
