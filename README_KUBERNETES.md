# Despliegue de Aplicación con Docker y Kubernetes

**Universidad:** UTESA  
**Asignatura:** Programación Móvil & Arquitectura Cloud  
**Estudiante:** Sthifer Odaliz Fernandez Cepeda  
**Matrícula:** 1222483  

---

## 1. Descripción del Proyecto
Este proyecto contiene una arquitectura desacoplada basada en microservicios, contenerizada con **Docker** y orquestada mediante **Kubernetes**:
- **Backend API:** Desarrollado en **Go (Golang)** con el framework **Fiber v2**, base de datos SQLite/PostgreSQL y autenticación JWT.
- **Frontend Web:** Desarrollado en **HTML5/CSS3/JavaScript** servido con un servidor web **Nginx (Alpine)** de alto rendimiento que actúa como proxy inverso hacia el servicio interno del backend en Kubernetes.
- **Orquestación en Kubernetes:** Despliegue con alta disponibilidad, servicios ClusterIP/NodePort, escalabilidad horizontal (de 2 a 5 réplicas) y comprobaciones de salud (`livenessProbe` y `readinessProbe`).

---

## 2. Estructura de Archivos del Proyecto

```text
├── Backend/                      # Código fuente del Backend (Go Fiber)
│   ├── cmd/api/main.go           # Punto de entrada de la API
│   ├── internal/                 # Controladores, modelos, base de datos
│   └── Dockerfile                # Dockerfile multi-stage para compilar y empaquetar el binario
├── frontend/                     # Código fuente del Frontend Web
│   ├── index.html                # Interfaz de usuario interactiva
│   ├── nginx.conf                # Configuración de Nginx y proxy inverso
│   └── Dockerfile                # Dockerfile para Nginx Alpine
├── k8s/                          # Manifiestos de Kubernetes (YAML)
│   ├── backend-deployment.yaml   # Deployment con 2 réplicas iniciales del backend
│   ├── backend-service.yaml      # Service ClusterIP (puerto 8080)
│   ├── frontend-deployment.yaml  # Deployment del frontend (2 réplicas)
│   ├── frontend-service.yaml     # Service NodePort (puerto 80 / 30080)
│   └── k8s-all-in-one.yaml       # Todos los manifiestos en un solo archivo
├── desplegar_k8s.sh              # Script automatizado para Linux / Cloud Shell
├── desplegar_k8s.bat             # Script automatizado para Windows
└── README_KUBERNETES.md          # Esta documentación
```

---

## 3. Guía Paso a Paso de Ejecución

### Paso 1: Construcción de las Imágenes Docker
Desde la raíz del repositorio, construimos las imágenes para el backend y el frontend:

```bash
# 1. Construir la imagen del Backend
docker build -t backend:v1 ./Backend

# 2. Construir la imagen del Frontend
docker build -t frontend:v1 ./frontend
```

**Verificar las imágenes creadas (Evidencia obligatoria):**
```bash
docker images
```

---

### Paso 2: Despliegue de los Manifiestos en Kubernetes
Aplicamos los archivos YAML para crear los Deployments y Services:

```bash
kubectl apply -f k8s/
```

Salida esperada:
```text
deployment.apps/backend-deployment created
service/backend-service created
deployment.apps/frontend-deployment created
service/frontend-service created
```

---

### Paso 3: Verificación del Estado Inicial (2 Réplicas de Backend)

Consultamos los Deployments, Pods y Servicios:

```bash
# 1. Ver Deployments
kubectl get deployments

# 2. Ver Pods (Debe mostrar 2 réplicas de backend y 2 de frontend)
kubectl get pods -o wide

# 3. Ver Servicios (ClusterIP para backend, NodePort para frontend)
kubectl get svc
```

---

### Paso 4: Escalado del Backend a 5 Réplicas (Requisito Obligatorio)

Ejecutamos el comando de escalado:

```bash
kubectl scale deployment backend-deployment --replicas=5
```

Salida esperada:
```text
deployment.apps/backend-deployment scaled
```

Verificamos que Kubernetes aprovisionó inmediatamente las 5 réplicas:

```bash
kubectl get pods -l app=backend -o wide
```

Y verificamos el estado del Deployment:
```bash
kubectl get deployments backend-deployment
```

---

### Paso 5: Comprobación de la Aplicación Funcionando

1. **Acceso Web:**
   - Si se usa **Minikube**:
     ```bash
     minikube service frontend-service
     ```
   - Si se usa **Kubernetes Local**: Abrir en el navegador:
     `http://localhost:30080` o `http://localhost`
   - O usando port-forward:
     ```bash
     kubectl port-forward svc/frontend-service 8080:80
     ```
     y abrir en el navegador `http://localhost:8080`.

2. **Prueba de Endpoint /health:**
   ```bash
   curl http://localhost:30080/health
   ```
   Respuesta en JSON:
   ```json
   {
     "status": "OK",
     "engine": "Go + Fiber v2",
     "student": "Sthifer Fernandez (1222483)"
   }
   ```

---

## 4. Resumen de Evidencias a Capturar para el PDF

1. **Captura 1:** `docker images` mostrando `backend:v1` y `frontend:v1`.
2. **Captura 2:** `kubectl get deployments` mostrando `backend-deployment` (2 réplicas iniciales) y `frontend-deployment`.
3. **Captura 3:** `kubectl get pods` con los pods en estado `Running`.
4. **Captura 4:** `kubectl get svc` mostrando `backend-service` y `frontend-service`.
5. **Captura 5:** Escalado con `kubectl scale deployment backend-deployment --replicas=5` y posterior `kubectl get pods` mostrando 5 pods de backend.
6. **Captura 6:** Aplicación funcionando en el navegador web o terminal respondiendo `/health` y mostrando la interfaz web de UTESA.
