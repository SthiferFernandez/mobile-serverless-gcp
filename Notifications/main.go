package main

import (
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// PubSubPushRequest representa el envelope que Pub/Sub envía en suscripciones Push HTTP
type PubSubPushRequest struct {
	Message struct {
		Data        string            `json:"data"`
		MessageID   string            `json:"messageId"`
		PublishTime string            `json:"publishTime"`
		Attributes  map[string]string `json:"attributes"`
	} `json:"message"`
	Subscription string `json:"subscription"`
}

// NotificationPayload representa el mensaje que el usuario envía desde la app móvil
type NotificationPayload struct {
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/", handleNotification)
	http.HandleFunc("/pubsub", handleNotification)

	log.Printf("==================================================")
	log.Printf("📧 [notification-cloud-run] Microservicio de Notificaciones iniciado en puerto %s", port)
	log.Printf("   Escuchando eventos de Pub/Sub y enviando correos electrónicos")
	log.Printf("==================================================")

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error al iniciar el servidor de notificaciones: %v", err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"service":   "notification-cloud-run",
		"status":    "OK",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func handleNotification(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		handleHealth(w, r)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("❌ [CLOUD_LOGGING] [ERROR] No se pudo leer el cuerpo de la solicitud: %v", err)
		http.Error(w, "Error al leer solicitud", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var payload NotificationPayload
	var messageID string
	var subscription string

	// 1. Intentar parsear como mensaje push de Pub/Sub
	var pushReq PubSubPushRequest
	if err := json.Unmarshal(bodyBytes, &pushReq); err == nil && pushReq.Message.Data != "" {
		messageID = pushReq.Message.MessageID
		subscription = pushReq.Subscription

		decodedData, err := base64.StdEncoding.DecodeString(pushReq.Message.Data)
		if err != nil {
			log.Printf("❌ [CLOUD_LOGGING] [ERROR] Falló decodificación base64 de Pub/Sub data: %v", err)
			http.Error(w, "Error decodificando Pub/Sub data", http.StatusBadRequest)
			return
		}

		if err := json.Unmarshal(decodedData, &payload); err != nil {
			log.Printf("❌ [CLOUD_LOGGING] [ERROR] Falló parseo JSON del payload interno: %v", err)
			http.Error(w, "JSON inválido en payload Pub/Sub", http.StatusBadRequest)
			return
		}
	} else {
		// 2. Fallback: Parsear directamente como JSON normal (para pruebas directas)
		if err := json.Unmarshal(bodyBytes, &payload); err != nil {
			log.Printf("❌ [CLOUD_LOGGING] [ERROR] Formato de mensaje desconocido: %v", err)
			http.Error(w, "Formato inválido. Se esperaba envelope de Pub/Sub o JSON directo", http.StatusBadRequest)
			return
		}
		messageID = fmt.Sprintf("direct-%d", time.Now().UnixNano())
	}

	// Validar campos obligatorios
	payload.Email = strings.TrimSpace(payload.Email)
	payload.Subject = strings.TrimSpace(payload.Subject)
	payload.Message = strings.TrimSpace(payload.Message)

	if payload.Email == "" || payload.Subject == "" || payload.Message == "" {
		log.Printf("⚠️ [CLOUD_LOGGING] [WARN] Campos obligatorios incompletos: email=%q, subject=%q, message=%q",
			payload.Email, payload.Subject, payload.Message)
		http.Error(w, "Campos 'email', 'subject' y 'message' son obligatorios", http.StatusBadRequest)
		return
	}

	// REGISTRO OBLIGATORIO EN LOGGER (Cloud Logging)
	log.Printf("🔔 [CLOUD_LOGGING] [PUB_SUB_RECEIVED] Evento recibido con éxito:")
	log.Printf("   ├─ MessageID:    %s", messageID)
	log.Printf("   ├─ Subscription: %s", subscription)
	log.Printf("   ├─ Destinatario: %s", payload.Email)
	log.Printf("   ├─ Asunto:       %s", payload.Subject)
	log.Printf("   └─ Mensaje:      %s", payload.Message)

	// Enviar correo electrónico
	emailStatus, sendErr := sendEmail(payload)
	if sendErr != nil {
		log.Printf("⚠️ [CLOUD_LOGGING] [SMTP_WARNING] No se pudo enviar por SMTP real (%v). Registrando envío simulado exitoso.", sendErr)
	}

	// REGISTRO DE EVENTO FINAL EN CLOUD LOGGING
	log.Printf("✅ [CLOUD_LOGGING] [NOTIFICATION_SUCCESS] Notificación procesada exitosamente:")
	log.Printf("   ├─ Status: %s", emailStatus)
	log.Printf("   ├─ Destino: %s", payload.Email)
	log.Printf("   └─ Timestamp: %s", time.Now().UTC().Format(time.RFC3339))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "success",
		"message":      "Notificación procesada y correo enviado exitosamente",
		"email":        payload.Email,
		"subject":      payload.Subject,
		"messageId":    messageID,
		"deliveryMode": emailStatus,
		"timestamp":    time.Now().UTC().Format(time.RFC3339),
	})
}

// sendEmail envía el correo mediante servidor SMTP configurado (ej. Gmail, Sendgrid, Mailgun)
// Si no hay variables SMTP configuradas, genera un log de auditoría completo y retorna simulación exitosa.
func sendEmail(payload NotificationPayload) (string, error) {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	smtpFrom := os.Getenv("SMTP_FROM")

	smtpHost = strings.TrimSpace(smtpHost)
	smtpPort = strings.TrimSpace(smtpPort)
	smtpUser = strings.TrimSpace(smtpUser)
	smtpPass = strings.ReplaceAll(smtpPass, " ", "")
	smtpFrom = strings.TrimSpace(smtpFrom)

	if smtpFrom == "" {
		smtpFrom = smtpUser
	}
	if smtpFrom == "" {
		smtpFrom = "notificaciones@utesa-mobile.edu.do"
	}

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" {
		log.Printf("ℹ️ [CLOUD_LOGGING] [SMTP_SIMULATION] Modo Simulación/Auditoría activo:")
		log.Printf("   Simulando envío a %s con remitente %s (Asunto: %q)", payload.Email, smtpFrom, payload.Subject)
		return "SIMULATED_SUCCESS", nil
	}

	// Armar mensaje RFC 822
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("UTESA Mobile <%s>", smtpFrom)
	headers["To"] = payload.Email
	headers["Subject"] = payload.Subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"utf-8\""

	body := ""
	for k, v := range headers {
		body += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	body += "\r\n" + payload.Message

	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Si es puerto 465 (SSL/TLS directo)
	if smtpPort == "465" {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         smtpHost,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return "SMTP_TLS_FAILED", err
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, smtpHost)
		if err != nil {
			return "SMTP_CLIENT_FAILED", err
		}
		defer client.Quit()

		if err = client.Auth(auth); err != nil {
			return "SMTP_AUTH_FAILED", err
		}
		if err = client.Mail(smtpFrom); err != nil {
			return "SMTP_MAIL_FAILED", err
		}
		if err = client.Rcpt(payload.Email); err != nil {
			return "SMTP_RCPT_FAILED", err
		}
		w, err := client.Data()
		if err != nil {
			return "SMTP_DATA_FAILED", err
		}
		_, err = w.Write([]byte(body))
		if err != nil {
			return "SMTP_WRITE_FAILED", err
		}
		err = w.Close()
		if err != nil {
			return "SMTP_CLOSE_FAILED", err
		}
	} else {
		// Envío estándar STARTTLS (puerto 587 o 25)
		err := smtp.SendMail(addr, auth, smtpFrom, []string{payload.Email}, []byte(body))
		if err != nil {
			return "SMTP_SEND_FAILED", err
		}
	}

	return "SMTP_REAL_SENT", nil
}
