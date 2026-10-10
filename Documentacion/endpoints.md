# Catálogo Completo de Endpoints - API REST

**Servidor:** Go Fiber v2  
**Host por defecto:** `http://localhost:8080` (o `http://<IP_LAN>:8080`)  
**Autenticación:** Cabecera `Authorization: Bearer <TOKEN>`  

---

## 1. Módulo de Autenticación

### `POST /login`
Inicia sesión verificando credenciales con hashing Bcrypt y devuelve el token JWT.
- **Acceso:** Público
- **Request Body:**
```json
{
  "email": "sthifer@test.com",
  "password": "admin123"
}
```
- **Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Sthifer",
    "apellido": "Fernandez",
    "email": "sthifer@test.com",
    "foto": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "createdAt": "2026-10-04T18:00:00Z",
    "updatedAt": "2026-10-04T18:00:00Z"
  }
}
```

---

### `POST /register`
Registra un nuevo usuario en la base de datos con contraseña encriptada con Bcrypt.
- **Acceso:** Público
- **Request Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@test.com",
  "password": "password123",
  "foto": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
}
```
- **Response `201 Created`:** Retorna el token JWT generado y los datos del nuevo usuario.

---

### `GET /profile`
Obtiene los datos del usuario dueño del token JWT actual.
- **Acceso:** Protegido (`Bearer <token>`)
- **Response `200 OK`:** Objeto `User`.

---

## 2. CRUD de Usuarios

### `GET /users`
Lista todos los usuarios registrados en el sistema.
- **Acceso:** Protegido
- **Response `200 OK`:**
```json
[
  {
    "id": 1,
    "nombre": "Sthifer",
    "apellido": "Fernandez",
    "email": "sthifer@test.com",
    "foto": "https://...",
    "createdAt": "2026-10-04T18:00:00Z"
  }
]
```

---

### `GET /users/{id}`
Obtiene el detalle completo de un usuario por su ID numérico.
- **Acceso:** Protegido
- **Response `200 OK`:** Datos del usuario solicitado.

---

### `POST /users`
Crea un usuario desde la interfaz administrativa.
- **Acceso:** Protegido
- **Request Body:**
```json
{
  "nombre": "Laura",
  "apellido": "Gomez",
  "email": "laura@test.com",
  "password": "seguraPassword",
  "foto": "https://..."
}
```
- **Response `201 Created`:** Usuario creado.

---

### `PUT /users/{id}`
Actualiza los datos y/o foto de un usuario existente.
- **Acceso:** Protegido
- **Request Body:**
```json
{
  "nombre": "Laura Modificada",
  "apellido": "Gomez",
  "email": "laura@test.com",
  "foto": "/uploads/nueva_foto.jpg"
}
```
- **Response `200 OK`:** Usuario actualizado.

---

### `DELETE /users/{id}`
Elimina un usuario de la base de datos.
- **Acceso:** Protegido
- **Response `200 OK`:**
```json
{
  "message": "Usuario eliminado exitosamente",
  "id": 4
}
```

---

## 3. Módulo de Archivos

### `POST /upload`
Sube un archivo en formato `multipart/form-data`.
- **Acceso:** Protegido
- **Header:** `Content-Type: multipart/form-data`
- **Body:** campo `file` con el archivo binario (JPG, PNG, WEBP o PDF, máx. 10MB).
- **Response `201 Created`:**
```json
{
  "id": 15,
  "filename": "foto_usuario_15.jpg",
  "url": "/uploads/foto_usuario_15.jpg",
  "size": 245100,
  "mimeType": "image/jpeg"
}
```

---

### `DELETE /upload/{id}`
Elimina un archivo físicamente del disco y remueve su registro de la base de datos.
- **Acceso:** Protegido
- **Response `200 OK`:**
```json
{
  "message": "Archivo eliminado exitosamente",
  "id": 15
}
```

---

### `GET /files`
Lista todos los archivos registrados en la base de datos.
- **Acceso:** Protegido
- **Response `200 OK`:** Arreglo con la lista de registros de archivos.

---

## 4. Endpoints para Concurrencia y Métricas

### `GET /stats`
Métricas consolidadas del servidor y de la base de datos.
- **Acceso:** Protegido
- **Response `200 OK`:**
```json
{
  "totalUsers": 5,
  "totalFiles": 12,
  "activeSessions": 1,
  "serverUptime": "2h45m",
  "databaseStatus": "Connected (Healthy)",
  "timestamp": "2026-10-04T18:30:00Z"
}
```

---

### `GET /notifications`
Notificaciones del sistema generadas dinámicamente.
- **Acceso:** Protegido
- **Response `200 OK`:** Lista de notificaciones del sistema.

---

### `GET /benchmark/task/{id}?delay=600`
Endpoint de benchmarking con retardo configurable para simular carga de trabajo I/O o procesamiento en el servidor.
- **Acceso:** Protegido
- **Query Params:** `delay` (milisegundos, por defecto 500ms o 600ms).
- **Response `200 OK`:**
```json
{
  "taskId": "1",
  "status": "COMPLETED",
  "delayMs": 600,
  "message": "Tarea 1 procesada exitosamente tras 600 ms",
  "timestamp": "2026-10-04T18:30:00Z"
}
```
