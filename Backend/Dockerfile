# Multi-stage Dockerfile for Go Fiber API
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install git and build essentials if needed
RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary for Linux
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/api ./cmd/api

# Runner stage
FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy compiled binary from builder
COPY --from=builder /app/api /app/api
COPY .env.example /app/.env

# Expose port
EXPOSE 8080

# Run the API
CMD ["/app/api"]
