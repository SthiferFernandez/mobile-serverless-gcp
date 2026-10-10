@echo off
title Servidor Go Fiber - Backend
cd /d "%~dp0Backend"
echo ==================================================
echo   Iniciando Backend API REST en Go + Fiber
echo   Estudiante: Sthifer Fernandez (1222483)
echo ==================================================
go run ./cmd/api/main.go
pause
