package database

import (
	"fmt"
	"log"
	"time"

	"backend/internal/config"
	"backend/internal/models"

	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) *gorm.DB {
	var err error
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if cfg.DatabaseURL != "" && cfg.DatabaseURL != "sqlite" {
		log.Printf("Connecting to PostgreSQL via DATABASE_URL...")
		DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), gormConfig)
		if err != nil {
			log.Printf("Failed to connect via DATABASE_URL: %v. Falling back...", err)
		}
	}

	if DB == nil && cfg.DBType == "postgres" {
		dsn := fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
			cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBPort,
		)
		log.Printf("Connecting to PostgreSQL at %s:%s...", cfg.DBHost, cfg.DBPort)
		DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
		if err != nil {
			log.Printf("Failed to connect to PostgreSQL: %v. Falling back to local SQLite...", err)
		}
	}

	if DB == nil {
		log.Println("Using SQLite database: mobile_app.db")
		DB, err = gorm.Open(sqlite.Open("mobile_app.db"), gormConfig)
	}

	if err != nil {
		log.Fatalf("Fatal: Failed to connect to any database: %v", err)
	}

	// Auto-migrate tables
	log.Println("Running AutoMigrate for User and File models...")
	err = DB.AutoMigrate(&models.User{}, &models.FileModel{})
	if err != nil {
		log.Fatalf("Fatal: Database migration failed: %v", err)
	}

	// Seed default admin and sample users if empty
	seedUsers()

	return DB
}

func seedUsers() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := models.User{
			Nombre:    "Sthifer",
			Apellido:  "Fernandez",
			Email:     "sthifer@test.com",
			Password:  string(hashedPassword),
			Foto:      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		DB.Create(&admin)

		hashedPass2, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
		user2 := models.User{
			Nombre:    "Carlos",
			Apellido:  "Perez",
			Email:     "carlos@test.com",
			Password:  string(hashedPass2),
			Foto:      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		DB.Create(&user2)

		user3 := models.User{
			Nombre:    "Maria",
			Apellido:  "Rodriguez",
			Email:     "maria@test.com",
			Password:  string(hashedPass2),
			Foto:      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		DB.Create(&user3)

		log.Println("Default users seeded: sthifer@test.com, carlos@test.com, maria@test.com")
	}
}
