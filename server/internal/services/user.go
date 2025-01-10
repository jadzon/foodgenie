package services

import (
	"fmt"
	"foodgenie/internal/models"
	"foodgenie/internal/repositories"
	"foodgenie/internal/security"
)

type UserService interface {
	CreateUser(user *models.User) error
	ValidateUser(user *models.User) error
}
type userService struct {
	userRepo repositories.UserRepository
}

func NewUserService(userRepo repositories.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

func (us *userService) CreateUser(user *models.User) error {
	hashedPassword, err := security.GenerateHashFromPassword(user.Password)
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
	if err != nil {
		return err
	}
	err = security.ComparePasswordAndHash(userInDb.Password, user.Password)
	return err
}
