package main

import (
	"fmt"
	"log"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database (Postgres or SQLite fallback)
	database.InitDB(cfg)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:   "UTESA Mobile Backend API - Go Fiber",
		BodyLimit: 20 * 1024 * 1024, // 20 MB limit
	})

	// Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "*",
	}))

	// Serve uploaded files statically
	app.Static("/uploads", "./uploads")

	// Handlers
	authHandler := handlers.NewAuthHandler(cfg)
	userHandler := handlers.NewUserHandler()
	uploadHandler := handlers.NewUploadHandler(cfg)
	dashHandler := handlers.NewDashboardHandler()
	notifHandler := handlers.NewNotificationHandler(cfg)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "OK",
			"engine":  "Go + Fiber v2",
			"student": "Sthifer Fernandez (1222483)",
		})
	})

	// --- RUTAS PÚBLICAS ---
	app.Post("/login", authHandler.Login)
	app.Post("/register", authHandler.Register)
	app.Post("/notifications/send", notifHandler.SendNotification)

	// --- RUTAS PROTEGIDAS CON JWT ---
	api := app.Group("/", middleware.Protected(cfg))
	api.Post("/notifications/send", notifHandler.SendNotification)

	// Perfil autenticado
	api.Get("/profile", authHandler.GetProfile)

	// CRUD de Usuarios
	api.Get("/users", userHandler.GetAll)
	api.Get("/users/:id", userHandler.GetByID)
	api.Post("/users", userHandler.Create)
	api.Put("/users/:id", userHandler.Update)
	api.Delete("/users/:id", userHandler.Delete)

	// Subida de Archivos
	api.Post("/upload", uploadHandler.Upload)
	api.Delete("/upload/:id", uploadHandler.Delete)
	api.Get("/files", uploadHandler.GetAllFiles)

	// Dashboard y Concurrencia
	api.Get("/stats", dashHandler.GetStats)
	api.Get("/notifications", dashHandler.GetNotifications)
	api.Get("/benchmark/task/:id", dashHandler.BenchmarkTask)

	// Iniciar Servidor en 0.0.0.0 para acceso desde emulador y teléfono físico
	address := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	log.Printf("==================================================")
	log.Printf("🚀 Servidor Go Fiber iniciado en http://%s", address)
	log.Printf("📋 Listo para conectar desde la aplicación móvil React Native")
	log.Printf("==================================================")

	if err := app.Listen(address); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}
