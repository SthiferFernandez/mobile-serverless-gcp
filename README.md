# Proyecto Integrador: Aplicación Móvil con Consumo Concurrente de API REST

**Universidad:** UTESA  
**Estudiante:** Sthifer Odaliz Fernandez Cepeda  
**Matrícula:** 1222483  
**Tecnología Móvil:** React Native (TypeScript, Expo SDK)  
**Backend:** Go (Golang) + Fiber Framework v2 + GORM  
**Base de Datos:** PostgreSQL (Docker) / SQLite (Local)  
**Contenedores:** Docker & Docker Compose  

---

## Estructura del Repositorio

```text
mobile/
├── Backend/                 # API REST en Go + Fiber
│   ├── cmd/api/main.go      # Servidor y endpoints
│   ├── internal/            # Arquitectura limpia (config, db, handlers, middleware, models)
│   ├── uploads/             # Almacenamiento local de archivos estáticos
│   ├── Dockerfile           # Multi-stage build para Go
│   ├── docker-compose.yml   # Orquestación de API y PostgreSQL
│   └── README.md
│
├── Mobile/                  # Aplicación React Native
│   ├── src/                 # Arquitectura MVVM estricta
│   │   ├── models/          # DTOs e interfaces TypeScript
│   │   ├── services/        # Axios, Storage, JWT Bearer interceptor
│   │   ├── repositories/    # Repositorios y orquestación de datos
│   │   ├── viewmodels/      # Hooks reactivos (loading, error, estados)
│   │   ├── views/           # Pantallas (Dashboard, CRUD, Benchmark, Upload)
│   │   ├── navigation/      # React Navigation (Tabs + Stack)
│   │   └── context/         # AuthContext
│   ├── App.tsx
│   └── README.md
│
└── Documentacion/           # Documentación técnica requerida
    ├── arquitectura.md      # Diagramas y explicación de MVVM y Go Fiber
    ├── endpoints.md         # Catálogo exhaustivo de endpoints REST y respuestas
    ├── concurrencia.md      # Análisis teórico y práctico de concurrencia y paralelismo
    └── guia_exposicion.md   # Guion paso a paso y respuestas a preguntas del profesor
```

---

## Inicio Rápido

### 1. Iniciar el Backend (Go Fiber)
```bash
cd Backend
go run ./cmd/api/main.go
# O mediante Docker:
docker compose up -d
```
El servidor escuchará en `http://localhost:8080` y sembrará los usuarios por defecto:
- **Email:** `sthifer@test.com`
- **Contraseña:** `admin123`
- NO SE METAN A PUNCHAR

### 2. Iniciar la Aplicación Móvil (React Native)
```bash
cd Mobile
npx expo start
```
- **En Celular Físico:** Escanea el código QR desde la aplicación **Expo Go**.
- **En Emulador Android Studio:** Presiona la tecla `a` en la terminal.

*(Nota: En la pantalla de login o en el header puedes presionar el botón de configuración para cambiar la IP de la API en caso de estar en una red Wi-Fi diferente).*
