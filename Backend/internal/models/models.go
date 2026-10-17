package models

import (
	"time"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Nombre    string    `json:"nombre" gorm:"size:100;not null"`
	Apellido  string    `json:"apellido" gorm:"size:100;not null"`
	Email     string    `json:"email" gorm:"size:150;uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Foto      string    `json:"foto" gorm:"size:255"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type FileModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Filename  string    `json:"filename" gorm:"size:255;not null"`
	URL       string    `json:"url" gorm:"size:255;not null"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mimeType"`
	UserID    uint      `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
}

// Request and Response DTOs
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Foto     string `json:"foto"`
}

type UserCreateRequest struct {
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Foto     string `json:"foto"`
}

type UserUpdateRequest struct {
	Nombre   string `json:"nombre"`
	Apellido string `json:"apellido"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
	Foto     string `json:"foto"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type DashboardStats struct {
	TotalUsers     int64     `json:"totalUsers"`
	TotalFiles     int64     `json:"totalFiles"`
	ActiveSessions int       `json:"activeSessions"`
	ServerUptime   string    `json:"serverUptime"`
	DatabaseStatus string    `json:"databaseStatus"`
	Timestamp      time.Time `json:"timestamp"`
}

type NotificationItem struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"` // info, success, warning
	Timestamp time.Time `json:"timestamp"`
}

// Modelos para el envío desacoplado de Notificaciones vía Pub/Sub
type SendNotificationRequest struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

type SendNotificationResponse struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	MessageID string `json:"messageId,omitempty"`
	Topic     string `json:"topic,omitempty"`
}

