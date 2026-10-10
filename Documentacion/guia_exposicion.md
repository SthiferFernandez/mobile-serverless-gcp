# Guía de Exposición y Demostración en Clase (100/100)

**Estudiante:** Sthifer Odaliz Fernandez Cepeda  
**Matrícula:** 1222483  
**Tecnologías:** React Native (Móvil) + Go Fiber (Backend) + Docker  

Esta guía está diseñada paso a paso para que expongas tu proyecto ante el profesor con total seguridad y cubras cada uno de los puntos evaluados.

---

## 🕒 Antes de Iniciar la Exposición

1. **Abre una terminal en `Backend`:**
   ```bash
   cd Backend
   go run ./cmd/api/main.go
   # O si usas Docker:
   docker compose up -d
   ```
   *Verifica que diga: `🚀 Servidor Go Fiber iniciado en http://0.0.0.0:8080`.*

2. **Abre otra terminal en `Mobile`:**
   ```bash
   cd Mobile
   npx expo start
   ```
   - Si usas tu **celular físico:** abre la app Expo Go y escanea el código QR.
   - Si usas el **emulador de Android Studio:** presiona la tecla `a` en la terminal para que abra automáticamente en Android.

---

## 🎤 Guion de Presentación Paso a Paso

### Paso 1: Introducción y Tecnologías Asignadas
> *"Profesor, mi nombre es Sthifer Fernandez (matrícula 1222483). Para este proyecto me correspondió como tecnología móvil **React Native** y como backend **Go (Golang) con el framework Fiber**. He implementado una arquitectura limpia **MVVM** en el móvil y contenerizado el backend con **Docker**."*

---

### Paso 2: Autenticación y Seguridad JWT (Puntos 1, 2 y 12)
1. Muestra la pantalla de **Login**.
2. Explica que la app tiene credenciales precargadas: `sthifer@test.com` y contraseña `admin123`.
3. Presiona **"Entrar con JWT"**.
4. **Lo que debes decir:**
   > *"Al iniciar sesión, el backend en Go valida las credenciales comparando la contraseña mediante **Bcrypt** para no guardar texto plano. El servidor genera un token **JWT firmado con HMAC-SHA256**. La aplicación móvil almacena este token de forma segura en `AsyncStorage` y, a través de un interceptor de Axios en la capa de servicios, adjunta automáticamente la cabecera `Authorization: Bearer <token>` en todas las peticiones posteriores."*

---

### Paso 3: Consumo Simultáneo en Dashboard (Punto 6 de la rúbrica)
1. Estás en la pantalla del **Dashboard**.
2. Muestra la tarjeta superior que dice **Modo: Concurrente (Promise.all)** y el tiempo de carga en milisegundos (ej. `320 ms`).
3. Presiona el botón **"Cargar Secuencial"** y muestra cómo el tiempo sube (ej. `1250 ms`).
4. Luego presiona **"Cargar Concurrente"** para mostrar la diferencia.
5. **Lo que debes decir:**
   > *"Cumpliendo con el Punto 6 de la rúbrica, al entrar al Dashboard no hacemos peticiones en cascada donde una espera a la otra. En lugar de eso, ejecutamos de forma simultánea `GET /users`, `GET /profile`, `GET /stats` y `GET /notifications` utilizando `Promise.all()`. Ambas peticiones viajan en paralelo hacia el servidor Go Fiber, reduciendo el tiempo de carga a una fracción del tiempo secuencial."*

---

### Paso 4: CRUD de Usuarios y Subida de Archivos (Puntos 2, 3 y 4)
1. Toca la pestaña **"Usuarios"**:
   - Muestra la lista de usuarios.
   - Usa la barra de búsqueda en tiempo real.
   - Toca el botón `+` para crear un nuevo usuario o toca el icono de lápiz para editar uno.
2. Muestra la opción de **"Subir/Cambiar Foto"**:
   - Selecciona una foto desde la galería.
   - Muestra cómo se sube mediante el endpoint `POST /upload` (multipart/form-data) y se guarda físicamente en la carpeta `/uploads` del servidor Go.
   - El backend responde con el formato exacto requerido:
     `{ "id": 15, "filename": "...", "url": "/uploads/..." }`.

---

### Paso 5: Demostración Estrella: Test de Rendimiento y Benchmark (Puntos 7, 8 y 9)
1. Toca la pestaña **"Concurrencia"**.
2. Presiona el botón azul: **"Iniciar Comparativa en Vivo"**.
3. Deja que el profesor observe cómo:
   - **Fase 1 (Secuencial):** Cada una de las 5 tareas se ejecuta en serie (Tarea 1 $\rightarrow$ Tarea 2 $\rightarrow$ ... $\approx 3.1\text{ s}$).
   - **Fase 2 (Concurrente):** Las 5 tareas se disparan a la vez con `Promise.all()` ($\approx 0.65\text{ s}$).
4. Muestra la tarjeta de resultados:
   - **Tiempo Secuencial:** ~3.15 segundos.
   - **Tiempo Concurrente:** ~0.68 segundos.
   - **Factor de Aceleración:** ~4.6x Más Rápido (Reducción de latencia del 78%).
   - Gráfico de barras comparativo.

---

### Paso 6: Respuestas a las Preguntas Obligatorias del Profesor (Punto 8)
Abre la sección desplegable **"Preguntas y Respuestas para el Profesor"** en la misma pantalla y responde con precisión:

1. **¿Qué proceso paralelizaron?**
   - El consumo conjunto de los 4 endpoints del Dashboard y el lote de 5 tareas I/O de comunicación con el backend.
2. **¿Por qué puede ejecutarse concurrentemente?**
   - Porque las operaciones son mutuamente independientes: los datos de estadísticas no dependen de los datos de notificaciones ni de la lista de usuarios.
3. **¿Qué mecanismo utilizaron?**
   - En React Native utilizamos `Promise.all()` coordinado por el Event Loop asíncrono sobre el motor JavaScript Hermes.
4. **¿Cuántas tareas utilizaron?**
   - 4 tareas concurrentes en el Dashboard y 5 tareas en el módulo de benchmarking.
5. **¿Tiempo secuencial vs concurrente?**
   - Secuencial: ~3.15 segundos. Concurrente: ~0.68 segundos.
6. **¿Diferencia de rendimiento?**
   - Más de 4 veces de aceleración ($\approx 78\%$ de reducción en tiempo de respuesta percibido).
7. **¿En qué situaciones NO sería conveniente utilizar paralelismo?**
   - Cuando existen dependencias estrictas de datos (ej. requerir el token del login antes de consultar los usuarios).
   - Cuando hay riesgo de saturar el ancho de banda o límites de conexiones concurrentes del servidor (*rate-limiting*).
   - En tareas de alto cómputo de CPU en el hilo principal de JavaScript, donde se congelaría la interfaz si no se usan módulos nativos o Workers.

---

### Paso 7: Explicación de la Arquitectura MVVM (Punto 5)
Muestra la estructura de carpetas en VS Code:
- `Views`: Componentes de pantalla (`DashboardScreen`, `UserListScreen`, etc.)
- `ViewModels`: Hooks reactivos (`useDashboardViewModel`, `useUserViewModel`, etc.)
- `Repositories`: Abstracción de datos (`DashboardRepository`, `UserRepository`)
- `Services`: Configuración de Axios con JWT Bearer (`ApiService`, `UploadService`)
- `Models`: Interfaces TypeScript (`User`, `DashboardStats`, etc.)

---

### Paso 8: Dockerización (Punto 10)
Muestra en VS Code los archivos `Dockerfile` y `docker-compose.yml`:
- Muestra cómo `docker-compose.yml` levanta tanto la **API en Go Fiber** como la base de datos **PostgreSQL**.
