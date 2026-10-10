# Backend API REST - Go (Golang) + Fiber

**Estudiante:** Sthifer Odaliz Fernandez Cepeda  
**Matrícula:** 1222483  
**Framework:** Go + Fiber v2  
**Base de Datos:** PostgreSQL (Docker) / SQLite (Local)  
**ORM:** GORM  
**Seguridad:** Autenticación JWT (HMAC-SHA256) + Hashing con Bcrypt  

---

## 🚀 Requisitos y Características Implementadas

1. **Autenticación y Seguridad:**
   - `POST /login`: Validación de credenciales, hash Bcrypt y generación de JWT.
   - `POST /register`: Registro de usuario con hash seguro.
   - Middleware de protección con Bearer Token en cabecera `Authorization: Bearer <token>`.
2. **CRUD de Usuarios:**
   - `GET /users`: Listado de usuarios (sin contraseña).
   - `GET /users/:id`: Detalle de usuario.
   - `POST /users`: Creación de usuario.
   - `PUT /users/:id`: Edición de información y foto.
   - `DELETE /users/:id`: Eliminación de usuario.
3. **Módulo de Subida de Archivos:**
   - `POST /upload`: Carga de archivo multipart/form-data, validación de extensión (JPG, PNG, WEBP, PDF) y tamaño (máx 10MB), almacenamiento físico en `./uploads` y registro en DB.
   - `DELETE /upload/:id`: Borrado de archivo físico y DB.
   - Servido estático en `http://localhost:8080/uploads/:filename`.
4. **Endpoints para Dashboard y Concurrencia:**
   - `GET /profile`: Perfil del usuario autenticado.
   - `GET /stats`: Métricas de base de datos, uptime y conteo de recursos.
   - `GET /notifications`: Notificaciones en tiempo real del sistema.
   - `GET /benchmark/task/:id?delay=500`: Endpoint para pruebas comparativas de concurrencia vs ejecución secuencial.
5. **Dockerización:**
   - `Dockerfile` multi-stage optimizado (compilación Go estática + imagen final Alpine de ~20MB).
   - `docker-compose.yml` que orquestra la API y PostgreSQL con volúmenes persistentes.

---

## 🐳 Ejecución con Docker (Requisito Oficial)

Para levantar la base de datos PostgreSQL y la API en contenedores:

```bash
docker compose up -d
```

Para verificar que los contenedores están corriendo:

```bash
docker compose ps
```

Para ver los logs en tiempo real:

```bash
docker compose logs -f api
```

Para detener los servicios:

```bash
docker compose down
```

---

## 💻 Ejecución Local Directa (Sin Docker)

Si deseas probar la API directamente en tu máquina con SQLite:

```bash
cd Backend
go run ./cmd/api/main.go
```

La base de datos SQLite `mobile_app.db` se creará automáticamente y sembrará los siguientes usuarios de prueba:
- **Email:** `sthifer@test.com`
- **Contraseña:** `admin123`

---

## 📋 Endpoints de la API

| Método | Endpoint | Protegido | Descripción |
|---|---|---|---|
| `GET` | `/health` | No | Verificación de estado del servidor |
| `POST` | `/login` | No | Autenticación y obtención de JWT |
| `POST` | `/register` | No | Registro de nuevo usuario |
| `GET` | `/profile` | Sí | Datos del usuario conectado |
| `GET` | `/users` | Sí | Lista todos los usuarios |
| `GET` | `/users/:id` | Sí | Obtiene un usuario por ID |
| `POST` | `/users` | Sí | Crea un nuevo usuario |
| `PUT` | `/users/:id` | Sí | Actualiza un usuario |
| `DELETE` | `/users/:id` | Sí | Elimina un usuario |
| `POST` | `/upload` | Sí | Sube un archivo (multipart/form-data) |
| `DELETE` | `/upload/:id` | Sí | Elimina un archivo |
| `GET` | `/files` | Sí | Lista archivos subidos |
| `GET` | `/stats` | Sí | Estadísticas del sistema |
| `GET` | `/notifications` | Sí | Notificaciones del sistema |
| `GET` | `/benchmark/task/:id` | Sí | Simulación de tareas para benchmark de concurrencia |
