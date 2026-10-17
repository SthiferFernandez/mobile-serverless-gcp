package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheck(t *testing.T) {
	req := httptest.NewRequest("GET", "/health", nil)
	rr := httptest.NewRecorder()

	handleHealth(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Esperaba 200 OK, obtuve %d", status)
	}
}

func TestDirectJSONNotification(t *testing.T) {
	payload := NotificationPayload{
		Email:   "test@ejemplo.com",
		Subject: "Prueba Directa",
		Message: "Hola Mundo",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest("POST", "/pubsub", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handleNotification(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Esperaba 200 OK, obtuve %d", status)
	}
}

func TestPubSubPushNotification(t *testing.T) {
	innerPayload := NotificationPayload{
		Email:   "destinatario@correo.com",
		Subject: "Prueba PUB/SUB",
		Message: "Hola desde GCP Serverless",
	}
	innerBytes, _ := json.Marshal(innerPayload)
	encodedData := base64.StdEncoding.EncodeToString(innerBytes)

	pushReq := PubSubPushRequest{
		Subscription: "projects/semana-3-sthifer/subscriptions/notification-sub",
	}
	pushReq.Message.Data = encodedData
	pushReq.Message.MessageID = "msg-12345"

	body, _ := json.Marshal(pushReq)

	req := httptest.NewRequest("POST", "/", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	handleNotification(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Esperaba 200 OK, obtuve %d: %s", status, rr.Body.String())
	}
}
