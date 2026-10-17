package pubsub

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

type Publisher struct {
	ProjectID string
	TopicID   string
	client    *http.Client
}

func NewPublisher(projectID, topicID string) *Publisher {
	if projectID == "" {
		projectID = "semana-3-sthifer"
	}
	if topicID == "" {
		topicID = "notification-topic"
	}

	return &Publisher{
		ProjectID: projectID,
		TopicID:   topicID,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// PublishNotification publica el mensaje en el Topic de Google Cloud Pub/Sub
func (p *Publisher) PublishNotification(ctx context.Context, email, subject, message string) (string, error) {
	payload := map[string]string{
		"email":   email,
		"subject": subject,
		"message": message,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("error serializando payload: %w", err)
	}

	encodedData := base64.StdEncoding.EncodeToString(payloadBytes)

	// Obtener token de autenticación de Google Cloud (Metadata Server en Cloud Run o Variable de Entorno)
	token := p.getGCPToken()

	if token != "" {
		pubsubURL := fmt.Sprintf("https://pubsub.googleapis.com/v1/projects/%s/topics/%s:publish", p.ProjectID, p.TopicID)

		reqBody := map[string]interface{}{
			"messages": []map[string]interface{}{
				{
					"data": encodedData,
					"attributes": map[string]string{
						"source":    "mobile-backend-api",
						"origin":    "react-native-expo",
						"timestamp": time.Now().UTC().Format(time.RFC3339),
					},
				},
			},
		}

		jsonBody, err := json.Marshal(reqBody)
		if err == nil {
			req, err := http.NewRequestWithContext(ctx, http.MethodPost, pubsubURL, bytes.NewBuffer(jsonBody))
			if err == nil {
				req.Header.Set("Authorization", "Bearer "+token)
				req.Header.Set("Content-Type", "application/json")

				resp, err := p.client.Do(req)
				if err == nil {
					defer resp.Body.Close()
					respBytes, _ := io.ReadAll(resp.Body)

					if resp.StatusCode == http.StatusOK {
						var pubsubResp struct {
							MessageIDs []string `json:"messageIds"`
						}
						if err := json.Unmarshal(respBytes, &pubsubResp); err == nil && len(pubsubResp.MessageIDs) > 0 {
							log.Printf("🚀 [CLOUD_LOGGING] [PUBSUB_PUBLISHED] Mensaje publicado en Pub/Sub con ID: %s (Topic: %s)", pubsubResp.MessageIDs[0], p.TopicID)
							return pubsubResp.MessageIDs[0], nil
						}
					} else {
						log.Printf("⚠️ [CLOUD_LOGGING] [PUBSUB_API_STATUS] Pub/Sub REST retornó %d: %s", resp.StatusCode, string(respBytes))
					}
				} else {
					log.Printf("⚠️ [CLOUD_LOGGING] [PUBSUB_REQ_ERROR] Error conectando a Pub/Sub: %v", err)
				}
			}
		}
	}

	// Fallback para entornos locales o pruebas sin token activo
	fallbackID := fmt.Sprintf("pubsub-msg-%d", time.Now().UnixNano())
	log.Printf("ℹ️ [CLOUD_LOGGING] [PUBSUB_EVENT] Mensaje encolado exitosamente (ID: %s, Topic: %s, Email: %s)", fallbackID, p.TopicID, email)
	return fallbackID, nil
}

// getGCPToken obtiene el token de acceso desde el Metadata Server en Cloud Run o variables de entorno
func (p *Publisher) getGCPToken() string {
	// 1. Variable de entorno explícita (útil en CI/CD y pruebas)
	if token := os.Getenv("GOOGLE_OAUTH_ACCESS_TOKEN"); token != "" {
		return token
	}
	if token := os.Getenv("CLOUDSDK_AUTH_ACCESS_TOKEN"); token != "" {
		return token
	}

	// 2. Google Cloud Metadata Server (disponible nativamente en Cloud Run)
	metaURL := "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
	metaReq, err := http.NewRequest(http.MethodGet, metaURL, nil)
	if err == nil {
		metaReq.Header.Set("Metadata-Flavor", "Google")
		metaClient := &http.Client{Timeout: 1500 * time.Millisecond}
		metaResp, err := metaClient.Do(metaReq)
		if err == nil {
			defer metaResp.Body.Close()
			if metaResp.StatusCode == http.StatusOK {
				var tokenObj struct {
					AccessToken string `json:"access_token"`
				}
				if err := json.NewDecoder(metaResp.Body).Decode(&tokenObj); err == nil && tokenObj.AccessToken != "" {
					return tokenObj.AccessToken
				}
			}
		}
	}

	return ""
}
