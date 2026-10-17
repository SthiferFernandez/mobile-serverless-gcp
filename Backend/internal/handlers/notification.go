package handlers

import (
	"context"
	"strings"
	"time"

	"backend/internal/config"
	"backend/internal/models"
	"backend/internal/pubsub"

	"github.com/gofiber/fiber/v2"
)

type NotificationHandler struct {
	cfg       *config.Config
	publisher *pubsub.Publisher
}

func NewNotificationHandler(cfg *config.Config) *NotificationHandler {
	return &NotificationHandler{
		cfg:       cfg,
		publisher: pubsub.NewPublisher(cfg.GCPProjectID, cfg.PubSubTopic),
	}
}

// SendNotification procesa POST /notifications/send
func (h *NotificationHandler) SendNotification(c *fiber.Ctx) error {
	var req models.SendNotificationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Cuerpo de solicitud JSON inválido",
		})
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)

	// Validar la solicitud (requerimiento obligatorio)
	if req.Email == "" || req.Subject == "" || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Los campos 'email', 'subject' y 'message' son obligatorios",
		})
	}

	if !strings.Contains(req.Email, "@") || !strings.Contains(req.Email, ".") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Bad Request",
			"message": "Dirección de correo electrónico inválida",
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Publicar el mensaje en PUB/SUB
	msgID, err := h.publisher.PublishNotification(ctx, req.Email, req.Subject, req.Message)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Internal Server Error",
			"message": "Error al publicar mensaje en Pub/Sub: " + err.Error(),
		})
	}

	// Retornar respuesta exitosa
	return c.Status(fiber.StatusOK).JSON(models.SendNotificationResponse{
		Status:    "success",
		Message:   "Mensaje enviado correctamente.",
		MessageID: msgID,
		Topic:     h.cfg.PubSubTopic,
	})
}
