# Multi-stage Dockerfile para notification-cloud-run
FROM golang:1.24-alpine AS builder

WORKDIR /app
RUN apk add --no-cache git ca-certificates

COPY go.mod ./
RUN go mod download || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/notification-service .

FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/notification-service /app/notification-service

EXPOSE 8080
CMD ["/app/notification-service"]
