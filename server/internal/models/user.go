package models

import (
	"github.com/google/uuid"
	"time"
)

type User struct {
	ID          uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Username    string    `gorm:"size:20;not null;unique" json:"username"`
	Email       string    `gorm:"uniqueIndex;not null" json:"email"`
	Password    string    `gorm:"not null" json:"password"`
	FirstName   string    `gorm:"not null" json:"first_name"`
	LastName    string    `gorm:"not null" json:"last_name"`
	DateOfBirth time.Time `gorm:"not null" json:"date_of_birth"`
}
