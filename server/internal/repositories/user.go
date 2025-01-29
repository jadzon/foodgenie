package repositories

import (
	"foodgenie/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository interface {
	CreateUser(user *models.User) error
	DeleteUser(user *models.User) error
	GetUserByUsername(username string) (models.User, error)
	GetUserByEmail(email string) (models.User, error)
	GetUserById(id uuid.UUID) (models.User, error)
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
	if err := ur.db.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return models.User{}, nil
		}
		return models.User{}, err
	}
	return user, nil
}

func (ur *userRepository) GetUserByEmail(email string) (models.User, error) {
	var user models.User
	if err := ur.db.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return models.User{}, nil
		}
		return models.User{}, err
	}
	return user, nil
}
func (ur *userRepository) GetUserById(id uuid.UUID) (models.User, error) {
	var user models.User
	if err := ur.db.Where("id = ?", id).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return models.User{}, nil
		}
		return models.User{}, err
	}
	return user, nil
}
