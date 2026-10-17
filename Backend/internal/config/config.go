package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	JWTSecret   string
	DBType      string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPass      string
	DBName      string
	BaseURL        string
	DatabaseURL    string
	GCPProjectID   string
	PubSubTopic    string
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	jwtSecret := getEnv("JWT_SECRET", "super_secret_jwt_key_utesa_2026")
	dbType := getEnv("DB_TYPE", "sqlite")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPass := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "mobile_db")
	baseURL := getEnv("BASE_URL", "http://localhost:8080")
	databaseURL := getEnv("DATABASE_URL", "")
	gcpProjectID := getEnv("GCP_PROJECT_ID", "semana-3-sthifer")
	pubsubTopic := getEnv("PUBSUB_TOPIC", "notification-topic")

	return &Config{
		Port:         port,
		JWTSecret:    jwtSecret,
		DBType:       dbType,
		DBHost:       dbHost,
		DBPort:       dbPort,
		DBUser:       dbUser,
		DBPass:       dbPass,
		DBName:       dbName,
		BaseURL:      baseURL,
		DatabaseURL:  databaseURL,
		GCPProjectID: gcpProjectID,
		PubSubTopic:  pubsubTopic,
	}
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}
