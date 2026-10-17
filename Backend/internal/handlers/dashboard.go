package handlers

import (
	"fmt"
	"strconv"
	"time"

	"backend/internal/database"
	"backend/internal/models"

	"github.com/gofiber/fiber/v2"
)

var startTime = time.Now()

type DashboardHandler struct{}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{}
}

func (h *DashboardHandler) GetStats(c *fiber.Ctx) error {
	var userCount int64
	var fileCount int64

	database.DB.Model(&models.User{}).Count(&userCount)
	database.DB.Model(&models.FileModel{}).Count(&fileCount)

	uptime := time.Since(startTime).Round(time.Second).String()

	stats := models.DashboardStats{
		TotalUsers:     userCount,
		TotalFiles:     fileCount,
		ActiveSessions: 1,
		ServerUptime:   uptime,
		DatabaseStatus: "Connected (Healthy)",
		Timestamp:      time.Now(),
	}

	return c.JSON(stats)
}

func (h *DashboardHandler) GetNotifications(c *fiber.Ctx) error {
	notifications := []models.NotificationItem{
		{
			ID:        1,
			Title:     "Bienvenido al Sistema",
			Message:   "Tu sesión ha sido iniciada correctamente con autenticación JWT.",
			Type:      "success",
			Timestamp: time.Now().Add(-5 * time.Minute),
		},
		{
			ID:        2,
			Title:     "Concurrencia Activa",
			Message:   "Módulo de procesamiento paralelo listo para evaluación.",
			Type:      "info",
			Timestamp: time.Now().Add(-15 * time.Minute),
		},
		{
			ID:        3,
			Title:     "Almacenamiento Local",
			Message:   "El directorio de subidas está sincronizado y listo para archivos.",
			Type:      "info",
			Timestamp: time.Now().Add(-1 * time.Hour),
		},
	}

	return c.JSON(notifications)
}

// Endpoint specifically designed to test and demonstrate concurrency vs sequential processing
func (h *DashboardHandler) BenchmarkTask(c *fiber.Ctx) error {
	taskID := c.Params("id", "1")
	delayMsStr := c.Query("delay", "500")
	delayMs, err := strconv.Atoi(delayMsStr)
	if err != nil || delayMs < 50 || delayMs > 5000 {
		delayMs = 500
	}

	// Simulate I/O or image processing workload
	time.Sleep(time.Duration(delayMs) * time.Millisecond)

	return c.JSON(fiber.Map{
		"taskId":    taskID,
		"status":    "COMPLETED",
		"delayMs":   delayMs,
		"message":   fmt.Sprintf("Tarea %s procesada exitosamente tras %d ms", taskID, delayMs),
		"timestamp": time.Now(),
	})
}
