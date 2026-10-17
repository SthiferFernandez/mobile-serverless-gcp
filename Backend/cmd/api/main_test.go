package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func TestHealthEndpoint(t *testing.T) {
	app := fiber.New()

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "OK",
			"engine":  "Go + Fiber v2",
			"student": "Sthifer Fernandez (1222483)",
		})
	})

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req, -1)

	if err != nil {
		t.Fatalf("Error testing /health: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestConfigLoad(t *testing.T) {
	cfg := config.LoadConfig()
	if cfg.Port == "" {
		t.Errorf("Expected non-empty Port")
	}
	if cfg.JWTSecret == "" {
		t.Errorf("Expected non-empty JWTSecret")
	}
}

func TestJWTGeneration(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test_secret_key_123",
	}

	token, err := middleware.GenerateJWT(1, "test@utesa.edu", cfg)
	if err != nil {
		t.Fatalf("GenerateJWT failed: %v", err)
	}
	if len(token) == 0 {
		t.Fatalf("Expected token, got empty string")
	}
}

func TestDatabaseSQLiteInit(t *testing.T) {
	cfg := &config.Config{
		DBType: "sqlite",
	}
	db := database.InitDB(cfg)
	if db == nil {
		t.Fatalf("Database initialization failed, got nil")
	}
}

func TestSendNotificationEndpoint(t *testing.T) {
	cfg := config.LoadConfig()
	app := fiber.New()
	notifHandler := handlers.NewNotificationHandler(cfg)
	app.Post("/notifications/send", notifHandler.SendNotification)

	// Prueba con payload válido
	validBody := `{"email":"usuario@correo.com","subject":"Prueba PUB/SUB","message":"Hola desde GCP Serverless"}`
	req := httptest.NewRequest("POST", "/notifications/send", strings.NewReader(validBody))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("Error testing /notifications/send: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	// Prueba con validación fallida (faltan campos)
	invalidBody := `{"email":"","subject":"","message":""}`
	reqInvalid := httptest.NewRequest("POST", "/notifications/send", strings.NewReader(invalidBody))
	reqInvalid.Header.Set("Content-Type", "application/json")
	respInvalid, err := app.Test(reqInvalid, -1)
	if err != nil {
		t.Fatalf("Error testing invalid /notifications/send: %v", err)
	}
	if respInvalid.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for empty fields, got %d", respInvalid.StatusCode)
	}
}

