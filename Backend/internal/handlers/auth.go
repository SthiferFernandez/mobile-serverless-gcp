package handlers

import (
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/middleware"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{Cfg: cfg}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Datos de entrada inválidos",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Email y contraseña son obligatorios",
		})
	}

	var user models.User
	result := database.DB.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "Unauthorized",
			"message": "Credenciales inválidas",
		})
	}

	// Compare bcrypt password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "Unauthorized",
			"message": "Credenciales inválidas",
		})
	}

	// Generate JWT
	token, err := middleware.GenerateJWT(user.ID, user.Email, h.Cfg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al generar el token JWT",
		})
	}

	return c.JSON(models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Datos de registro inválidos",
		})
	}

	if req.Nombre == "" || req.Apellido == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Nombre, apellido, email y contraseña son obligatorios",
		})
	}

	// Check if email already exists
	var existing models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error":   "Conflict",
			"message": "El correo electrónico ya está registrado",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al hashear la contraseña",
		})
	}

	user := models.User{
		Nombre:    req.Nombre,
		Apellido:  req.Apellido,
		Email:     req.Email,
		Password:  string(hashedPassword),
		Foto:      req.Foto,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al guardar el usuario en la base de datos",
		})
	}

	token, err := middleware.GenerateJWT(user.ID, user.Email, h.Cfg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al generar el token JWT",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	userID, ok := c.Locals("userId").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuario no identificado en el token",
		})
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Perfil no encontrado",
		})
	}

	return c.JSON(user)
}
