package services

import (
	"fmt"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(user *models.User) error
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

func (us *userService) CreateUser(user *models.User) error {
	hashedPassword, err := us.securityService.GenerateHashFromPassword(user.Password)
	if err != nil {
		fmt.Println("Failed to generate hash from password")
		return err
	}
	user.Password = hashedPassword
	err = us.userRepo.CreateUser(user)
	return err
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
