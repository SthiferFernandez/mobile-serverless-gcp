package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UploadHandler struct {
	Cfg *config.Config
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	return &UploadHandler{Cfg: cfg}
}

func (h *UploadHandler) Upload(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "No se envió ningún archivo en el campo 'file'",
		})
	}

	// Validate file size (max 10MB)
	if file.Size > 10*1024*1024 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "El archivo excede el tamaño máximo permitido (10MB)",
		})
	}

	// Validate extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
		".pdf":  true,
	}

	if !allowedExtensions[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": fmt.Sprintf("Formato de archivo '%s' no permitido. Use JPG, PNG, WEBP o PDF", ext),
		})
	}

	// Ensure upload directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al preparar el directorio de almacenamiento",
		})
	}

	// Generate unique filename
	newFilename := fmt.Sprintf("%s_%d%s", uuid.New().String()[:8], time.Now().Unix(), ext)
	dst := filepath.Join(uploadDir, newFilename)

	if err := c.SaveFile(file, dst); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al guardar el archivo físicamente",
		})
	}

	// Extract userId if logged in
	var userID uint = 0
	if val := c.Locals("userId"); val != nil {
		if uid, ok := val.(uint); ok {
			userID = uid
		}
	}

	relativeURL := fmt.Sprintf("/uploads/%s", newFilename)

	dbFile := models.FileModel{
		Filename:  newFilename,
		URL:       relativeURL,
		Size:      file.Size,
		MimeType:  file.Header.Get("Content-Type"),
		UserID:    userID,
		CreatedAt: time.Now(),
	}

	if err := database.DB.Create(&dbFile).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al registrar archivo en la base de datos",
		})
	}

	// Return formatted response as required by rubric:
	// { "id": 15, "filename": "foto_usuario_15.jpg", "url": "/uploads/foto_usuario_15.jpg" }
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":       dbFile.ID,
		"filename": dbFile.Filename,
		"url":      dbFile.URL,
		"size":     dbFile.Size,
		"mimeType": dbFile.MimeType,
	})
}

func (h *UploadHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "ID de archivo inválido",
		})
	}

	var file models.FileModel
	if err := database.DB.First(&file, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "Archivo no encontrado",
		})
	}

	// Remove physical file
	physicalPath := filepath.Join("./uploads", file.Filename)
	_ = os.Remove(physicalPath)

	// Remove record from DB
	if err := database.DB.Delete(&file).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al eliminar registro de la base de datos",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Archivo eliminado exitosamente",
		"id":      id,
	})
}

func (h *UploadHandler) GetAllFiles(c *fiber.Ctx) error {
	var files []models.FileModel
	if err := database.DB.Order("id desc").Find(&files).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al consultar archivos",
		})
	}
	return c.JSON(files)
}
