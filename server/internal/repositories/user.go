package repositories

import (
	"foodgenie/internal/models"
	"gorm.io/gorm"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	DeleteUser(user *models.User) error
	GetUserByUsername(username string) (models.User, error)
}
type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{
		db: db,
	}
}

func (ur *userRepository) CreateUser(user *models.User) error {
	if err := ur.db.Create(user).Error; err != nil {
		return err
	}
	return nil
}
func (ur *userRepository) DeleteUser(user *models.User) error {
	if err := ur.db.Delete(user).Error; err != nil {
		return err
	}
	return nil
}
func (ur *userRepository) GetUserByUsername(username string) (models.User, error) {
	var user models.User
	user.Username = username
	if err := ur.db.Find(&user).Error; err != nil {
		return models.User{}, err
	}
	return user, nil
}
