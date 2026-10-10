package handlers

import (
	"strconv"
	"time"

	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

func (h *UserHandler) GetAll(c *fiber.Ctx) error {
	var users []models.User
	if err := database.DB.Order("id desc").Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al obtener usuarios",
		})
	}
	return c.JSON(users)
}

func (h *UserHandler) GetByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "ID de usuario inválido",
		})
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "Usuario no encontrado",
		})
	}

	return c.JSON(user)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req models.UserCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Datos de usuario inválidos",
		})
	}

	if req.Nombre == "" || req.Apellido == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Nombre, apellido, email y contraseña son obligatorios",
		})
	}

	var existing models.User
	if err := database.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error":   "Conflict",
			"message": "El correo ya está en uso",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al hashear contraseña",
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
			"message": "Error al guardar el usuario",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "ID inválido",
		})
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "Usuario no encontrado",
		})
	}

	var req models.UserUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Datos de actualización inválidos",
		})
	}

	if req.Nombre != "" {
		user.Nombre = req.Nombre
	}
	if req.Apellido != "" {
		user.Apellido = req.Apellido
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Foto != "" {
		user.Foto = req.Foto
	}
	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err == nil {
			user.Password = string(hashed)
		}
	}
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al actualizar usuario",
		})
	}

	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "ID inválido",
		})
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "Usuario no encontrado",
		})
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al eliminar usuario",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usuario eliminado exitosamente",
		"id":      id,
	})
}
