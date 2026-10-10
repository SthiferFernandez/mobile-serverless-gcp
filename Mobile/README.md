# Aplicación Móvil React Native (MVVM) - UTESA

**Estudiante:** Sthifer Odaliz Fernandez Cepeda  
**Matrícula:** 1222483  
**Tecnología Móvil:** React Native + TypeScript (Expo SDK)  
**Mecanismo de Concurrencia:** `Promise.all()`, `async/await`, Event Loop  
**Arquitectura:** MVVM (Model - View - ViewModel - Repository - Services)  

---

## 🏗️ Arquitectura del Proyecto (MVVM Estricto)

El proyecto sigue estrictamente el flujo requerido en la rúbrica de evaluación:

```text
View (UI / Screens / Form / Components)
   ↓
ViewModel (Custom Hooks: Estado, Loading, Errores, Resultados)
   ↓
Repository (Coordinación de datos y persistencia)
   ↓
Services (Axios, Interceptor Bearer JWT, Multipart, BaseURL)
   ↓
API (Go Fiber REST Backend)
```

### Estructura de Carpetas:
```text
Mobile/
├── src/
│   ├── models/            # DTOs e interfaces (User, Auth, Dashboard, File, Benchmark)
│   ├── services/          # Clientes HTTP (Axios + JWT interceptor, Storage, Upload)
│   ├── repositories/      # Repositorios (AuthRepository, UserRepository, DashboardRepository...)
│   ├── viewmodels/        # Hooks MVVM (useAuthViewModel, useDashboardViewModel, useUserViewModel...)
│   ├── views/             # Pantallas (Screens) y componentes de interfaz
│   │   ├── components/    # Header, ServerConfigModal...
│   │   └── screens/       # Login, Register, Dashboard, Users, Detail, Form, Upload, Concurrency
│   ├── navigation/        # React Navigation (Bottom Tabs + Stack)
│   └── context/           # AuthContext (Estado global de sesión y URL del servidor)
├── App.tsx
└── package.json
```

---

## ⚡ Concurrencia y Paralelismo (Evaluación Principal)

### 1. Consumo Simultáneo en Dashboard (`DashboardScreen`)
Al ingresar al Dashboard o presionar "Cargar Concurrente", la app ejecuta simultáneamente 4 peticiones independientes mediante `Promise.all()`:
- `GET /users`
- `GET /profile`
- `GET /stats`
- `GET /notifications`

### 2. Módulo de Comparación Obligatoria (`ConcurrencyBenchmarkScreen`)
Permite demostrar en vivo ante el profesor la diferencia de rendimiento:
- **Modo Secuencial:** Ejecuta 5 tareas una tras otra esperando cada respuesta ($\approx 3.2 - 8.5\text{ s}$).
- **Modo Concurrente:** Ejecuta las 5 tareas en paralelo con `Promise.all()` ($\approx 0.6 - 1.2\text{ s}$).
- **Métricas:** Muestra tiempo secuencial, tiempo concurrente, factor de aceleración ($\approx 4\times$ a $5\times$ más rápido), porcentaje de optimización y gráficos de barras comparativos.

---

## 📱 Cómo Ejecutar la Aplicación

### Opción A: En tu Teléfono Físico Android (Muy Rápido)
1. Instala la app **Expo Go** desde Google Play Store en tu teléfono.
2. Asegúrate de que tu computadora y tu teléfono estén conectados a la misma red Wi-Fi.
3. En la terminal de la carpeta `Mobile`, ejecuta:
   ```bash
   npx expo start
   ```
4. Escanea el código QR que aparece en la terminal o navegador usando la cámara o la app Expo Go.
5. *(Nota: La app incluye un botón arriba a la derecha "Configurar API" para que puedas ajustar la IP de tu PC si cambia de red).*

### Opción B: En el Emulador de Android Studio
1. Abre tu emulador en Android Studio.
2. Ejecuta:
   ```bash
   npm run android
   ```
3. La aplicación se instalará y abrirá automáticamente en el emulador.
4. Para el emulador, la URL por defecto recomendada es `http://10.0.2.2:8080`.

---

## 🔑 Credenciales de Prueba

- **Usuario Admin:** `sthifer@test.com`
- **Contraseña:** `admin123`
*(O puedes registrar una nueva cuenta directamente desde la pantalla de Registro).*
