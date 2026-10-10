# Documentación de Arquitectura

**Proyecto:** Aplicación Móvil con Consumo Concurrente de API REST  
**Estudiante:** Sthifer Odaliz Fernandez Cepeda (Matrícula: 1222483)  
**Backend:** Go (Golang) + Fiber Framework v2 + GORM + PostgreSQL / SQLite  
**Mobile:** React Native (Expo SDK, TypeScript)  
**Arquitectura:** MVVM (Model - View - ViewModel) + Clean Layered Backend  

---

## 1. Arquitectura General del Sistema

El sistema opera bajo un modelo Cliente-Servidor desacoplado, comunicándose a través del protocolo HTTP/REST y asegurado mediante JSON Web Tokens (JWT).

```text
┌────────────────────────────────────────────────────────┐
│               DISPOSITIVO MÓVIL (REACT NATIVE)         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    VIEW (UI)                     │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │ Estado reactivo          │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │                   VIEWMODEL                      │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │ Reglas de negocio        │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │                   REPOSITORY                     │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │ Abstracción datos        │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │                    SERVICES                      │  │
│  │   (Axios + Interceptor Bearer JWT + Storage)     │  │
│  └──────────────────────────┬───────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
                    JSON / REST sobre HTTP
                    Authorization: Bearer <token>
                              │
┌─────────────────────────────▼──────────────────────────┐
│              BACKEND DOCKERIZADO (GO + FIBER)          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              ROUTER / MIDDLEWARE                 │  │
│  │        (Logger, CORS, JWT Protection)            │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │ Invocación controladores │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │                    HANDLERS                      │  │
│  │    (Auth, Users, Upload, Dashboard, Benchmark)   │  │
│  └──────────────────────────┬───────────────────────┘  │
│                             │ Operaciones ORM          │
│  ┌──────────────────────────▼───────────────────────┐  │
│  │                 GORM / DATABASE                  │  │
│  │              (PostgreSQL / SQLite)               │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura MVVM en React Native

La aplicación móvil implementa el patrón de diseño **MVVM** dividiendo responsabilidades de manera estricta:

### A. View (Vista)
- **Ubicación:** `Mobile/src/views/screens/` y `Mobile/src/views/components/`
- **Responsabilidad:** Representación gráfica en pantalla, renderizado de formularios, listas, botones y modales.
- **Principio:** No contiene lógica de negocio ni llamadas directas a la API; se suscribe al estado expuesto por el ViewModel.

### B. ViewModel (Modelo de Vista)
- **Ubicación:** `Mobile/src/viewmodels/`
- **Responsabilidad:** Gestión reactiva del estado (`loading`, `error`, datos en pantalla), transformaciones y coordinación de acciones del usuario.
- **Implementación:** Custom Hooks de React (`useDashboardViewModel`, `useUserViewModel`, `useUploadViewModel`, `useBenchmarkViewModel`, `useAuthViewModel`).

### C. Repository (Repositorio)
- **Ubicación:** `Mobile/src/repositories/`
- **Responsabilidad:** Servir como única fuente de verdad para el ViewModel. Orquesta si los datos provienen de almacenamiento local (`AsyncStorage`) o de la red (`Services`), e implementa las estrategias de ejecución concurrente (`Promise.all`) frente a secuencial.

### D. Services (Servicios)
- **Ubicación:** `Mobile/src/services/`
- **Responsabilidad:** Configuración de la capa de transporte HTTP con `Axios`, inyección automática de cabeceras (`Authorization: Bearer <token>`), gestión de errores 401 y manejo de subida multipart.

### E. Models / DTOs (Modelos)
- **Ubicación:** `Mobile/src/models/`
- **Responsabilidad:** Definición estricta de tipos de datos e interfaces TypeScript (`User`, `LoginDto`, `UploadedFileResponse`, `BenchmarkComparisonResult`).

---

## 3. Arquitectura del Backend Go + Fiber

El backend está diseñado siguiendo principios de arquitectura modular y alta concurrencia:
- **cmd/api/main.go:** Inicializa dependencias, configura middleware y define las rutas de la aplicación.
- **internal/config:** Lee variables de entorno con valores por defecto seguros.
- **internal/middleware:**
  - `Protected`: Valida la firma del token JWT y extrae los claims del usuario (`userId`, `email`).
  - `CORS`: Habilita el acceso desde emuladores Android (`10.0.2.2`), dispositivos físicos en LAN y entornos web.
- **internal/handlers:** Controladores HTTP desacoplados que interactúan con la base de datos a través de GORM.
- **uploads:** Directorio con servido estático (`app.Static("/uploads", "./uploads")`) para acceso público a las imágenes procesadas.
