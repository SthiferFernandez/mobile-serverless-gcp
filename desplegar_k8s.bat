@echo off
title Despliegue en Docker y Kubernetes - Sthifer Fernandez (1222483)
echo ==========================================================
echo   Despliegue en Docker y Kubernetes
echo   Estudiante: Sthifer Odaliz Fernandez Cepeda (1222483)
echo ==========================================================

echo [1/5] Construyendo imagen Docker del Backend...
docker build -t backend:v1 ./Backend
if %ERRORLEVEL% neq 0 (
    echo Error al construir la imagen de backend.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/5] Construyendo imagen Docker del Frontend...
docker build -t frontend:v1 ./frontend
if %ERRORLEVEL% neq 0 (
    echo Error al construir la imagen de frontend.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/5] Verificando imagenes creadas (docker images)...
docker images

echo [4/5] Aplicando manifiestos YAML en Kubernetes...
kubectl apply -f k8s/

echo [5/5] Consultando estado inicial (Backend con 2 replicas)...
timeout /t 5 /nobreak >nul
kubectl get deployments
kubectl get pods -o wide
kubectl get svc

echo.
echo ==========================================================
echo   Escalando Backend a 5 replicas...
echo ==========================================================
kubectl scale deployment backend-deployment --replicas=5
timeout /t 5 /nobreak >nul

echo Estado luego del escalado:
kubectl get deployments
kubectl get pods -l app=backend -o wide

echo ==========================================================
echo   Proceso finalizado con exito.
echo ==========================================================
pause
