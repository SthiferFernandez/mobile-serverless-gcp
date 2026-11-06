#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado en Docker y Kubernetes
# Estudiante: Sthifer Odaliz Fernandez Cepeda (1222483)
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 1. Verificando o iniciando clúster de Kubernetes (Minikube)"
echo "=========================================================="
if command -v minikube &> /dev/null; then
    if ! minikube status &> /dev/null; then
        echo "Iniciando Minikube..."
        minikube start --driver=docker
    fi
    echo "Configurando entorno de Docker para Minikube..."
    eval $(minikube docker-env)
fi

echo "=========================================================="
echo "🐳 2. Construyendo Imágenes Docker"
echo "=========================================================="
echo "Construyendo imagen de Backend (Go Fiber)..."
docker build -t backend:v1 ./Backend

echo "Construyendo imagen de Frontend (Nginx Web)..."
docker build -t frontend:v1 ./frontend

echo "=========================================================="
echo "📸 EVIDENCIA 1: Listado de Imágenes Docker (docker images)"
echo "=========================================================="
docker images | grep -E "backend|frontend|REPOSITORY"

echo "=========================================================="
echo "☸️ 3. Desplegando en Kubernetes (Backend 2 réplicas + Frontend)"
echo "=========================================================="
kubectl apply -f k8s/

echo "Esperando a que los Pods estén en estado Running..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=60s
kubectl wait --for=condition=ready pod -l app=frontend --timeout=60s

echo "=========================================================="
echo "📸 EVIDENCIA 2: Deployments (kubectl get deployments)"
echo "=========================================================="
kubectl get deployments

echo "=========================================================="
echo "📸 EVIDENCIA 3: Pods Iniciales (2 réplicas del Backend)"
echo "=========================================================="
kubectl get pods -o wide

echo "=========================================================="
echo "📸 EVIDENCIA 4: Servicios (kubectl get svc)"
echo "=========================================================="
kubectl get svc

echo "=========================================================="
echo "📈 4. Escalando Backend a 5 réplicas (Requisito Obligatorio)"
echo "=========================================================="
kubectl scale deployment backend-deployment --replicas=5
echo "Esperando que las 5 réplicas del backend se levanten..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=60s

echo "=========================================================="
echo "📸 EVIDENCIA 5: Pods Escalados a 5 Réplicas (kubectl get pods)"
echo "=========================================================="
kubectl get pods -l app=backend -o wide

echo "=========================================================="
echo "🌐 5. Probando la Aplicación Funcionando (curl /health)"
echo "=========================================================="
# Si estamos en minikube, obtener la URL del servicio
if command -v minikube &> /dev/null; then
    FRONTEND_URL=$(minikube service frontend-service --url)
    echo "Frontend accesible en: $FRONTEND_URL"
    echo "Consultando /health a través de Kubernetes:"
    curl -s "$FRONTEND_URL/health" || true
    echo ""
fi

echo "=========================================================="
echo "✅ Despliegue completado con éxito."
echo "=========================================================="
