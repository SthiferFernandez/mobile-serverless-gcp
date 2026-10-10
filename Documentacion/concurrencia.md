# Documentación de Concurrencia y Paralelismo

**Estudiante:** Sthifer Odaliz Fernandez Cepeda (Matrícula: 1222483)  
**Tecnología Móvil:** React Native (JavaScript/TypeScript - Motor Hermes)  
**Mecanismo Móvil:** `Promise.all()`, `async/await`, Event Loop  
**Backend:** Go + Fiber v2 (Goroutines y Mux de alta velocidad)  

---

## 1. Fundamentos Teóricos

### Concurrencia vs. Paralelismo
- **Concurrencia:** Trata sobre **estructurar** un programa para manejar múltiples cosas a la vez. En un entorno asíncrono con un solo hilo principal (como el hilo de JavaScript en React Native), la concurrencia se logra despachando operaciones de entrada/salida (I/O de red) sin bloquear la ejecución. Mientras el servidor procesa las peticiones de red, el hilo de JavaScript queda libre para atender animaciones, gestos del usuario y eventos de la interfaz.
- **Paralelismo:** Trata sobre **ejecutar** físicamente múltiples tareas en el mismo instante de tiempo sobre diferentes núcleos de CPU. En nuestro sistema, el paralelismo real ocurre en el servidor **Go Fiber**, donde cada petición entrante es procesada en una **Goroutine** separada ejecutándose sobre los múltiples núcleos de la máquina o contenedor Docker.

---

## 2. Mecanismos Implementados en React Native

En cumplimiento con la tabla de tecnologías de la rúbrica para **React Native**, se implementó el mecanismo:
$$\text{Mecanismo: } \texttt{Promise.all()} \text{ con } \texttt{async/await}$$

### ¿Cómo opera internamente `Promise.all()`?
1. Recibe un arreglo iterable de promesas.
2. Inicia todas las peticiones HTTP inmediatamente a través de la API nativa de red (`fetch` / `Axios` respaldado por `OkHttp` en Android).
3. El hilo de JavaScript no se bloquea esperando la primera petición; todas las peticiones vuelan a través de la red de manera simultánea.
4. Conforme el servidor responde, los callbacks se encolan en la cola de microtareas (*Microtask Queue*) del Event Loop.
5. `Promise.all()` resuelve cuando todas las promesas han terminado exitosamente.

---

## 3. Procesos Concurrentes Implementados en el Proyecto

### Proceso 1: Consumo Simultáneo del Dashboard (Punto 6)
Al ingresar al Dashboard o presionar "Cargar Concurrente":
```typescript
// En DashboardRepository.ts:
const [users, profile, stats, notifications] = await Promise.all([
  UserService.getAll(),
  AuthService.getProfile(),
  DashboardService.getStats(),
  DashboardService.getNotifications(),
]);
```
- **Versión Secuencial:** 
  $$\text{Tiempo Total} = T(\text{users}) + T(\text{profile}) + T(\text{stats}) + T(\text{notifications}) \approx 4 \times 300\text{ms} = 1200\text{ms}$$
- **Versión Concurrente:** 
  $$\text{Tiempo Total} = \max(T(\text{users}), T(\text{profile}), T(\text{stats}), T(\text{notifications})) + \text{overhead} \approx 320\text{ms}$$
- **Aceleración:** $\approx 3.75\times$ más rápido.

---

### Proceso 2: Pantalla de Benchmark y Lote de Archivos (Puntos 7 y 8)
En `ConcurrencyBenchmarkScreen.tsx` y `UploadScreen.tsx`, el usuario puede ejecutar un lote de 5 tareas con retardo I/O medido con precisión de milisegundos (`Date.now()`):

```text
Versión Secuencial:
Tarea 1 [600ms] ──→ Tarea 2 [600ms] ──→ Tarea 3 [600ms] ──→ Tarea 4 [600ms] ──→ Tarea 5 [600ms]
Total: ~3,000 - 3,200 ms

Versión Concurrente (Promise.all):
Tarea 1 [600ms] ──┐
Tarea 2 [600ms] ──┤
Tarea 3 [600ms] ──┼──→ [Listo simultáneamente]
Tarea 4 [600ms] ──┤
Tarea 5 [600ms] ──┘
Total: ~620 - 750 ms
```

---

## 4. Comparativa de Tiempos y Rendimiento

| Métrica | Modo Secuencial | Modo Concurrente | Ganancia / Rendimiento |
|---|---|---|---|
| **Tiempo de Ejecución** | $\approx 3.15\text{ s}$ | $\approx 0.68\text{ s}$ | **$4.63\times$ más rápido** |
| **Tiempo Bloqueante I/O** | Alto (acumulativo) | Bajo (solapado) | $\approx 78\%$ de reducción |
| **Experiencia de Usuario (UX)** | Lenta, espera visible | Inmediata y fluida | Fluidez de interfaz preservada |

---

## 5. ¿En qué situaciones NO sería conveniente utilizar paralelismo/concurrencia?

Esta pregunta es evaluada en el **Punto 8 de la rúbrica**. Las situaciones donde NO es recomendable son:

1. **Dependencia estricta de datos (Data Dependency):**
   - Cuando el resultado de una operación es el parámetro de entrada de la siguiente (ej. primero hacer `POST /login` para obtener el JWT, y luego usar ese JWT en `GET /users`). No se pueden paralelizar porque la segunda fallará con 401 si no espera a la primera.
2. **Saturación de recursos de red o servidor (Throttling / DDoS accidental):**
   - Si intentamos enviar 1000 peticiones en paralelo con `Promise.all()`, saturaremos el pool de sockets del sistema operativo móvil o dispararemos las reglas de rate-limiting del servidor. En esos casos es mejor usar concurrencia limitada con *batching* o *colas de tareas* (Worker Pool).
3. **Tareas intensivas en CPU en el hilo principal de JavaScript:**
   - En React Native, JavaScript corre en un único hilo de ejecución. Si se ejecutan operaciones matemáticas pesadas o procesamiento de imagen en JS sin Web Workers ni módulos nativos, el hilo se congela y la pantalla deja de responder a toques.
4. **Condiciones de Carrera (Race Conditions) en escritura:**
   - Cuando dos tareas concurrentes intentan modificar el mismo registro o estado compartido sin mecanismos de exclusión mutua (Mutex).
