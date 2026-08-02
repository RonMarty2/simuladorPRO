@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
title Simulador PRO - Iniciar

echo ============================================
echo    SIMULADOR PRO - iniciar en local
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No encuentro Node.js.
  echo Instalalo desde https://nodejs.org ^(version LTS^) y volve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Primera vez: instalando dependencias. Esto tarda 1-3 minutos...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Fallo la instalacion de dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Abriendo el simulador en el navegador: http://localhost:5173
echo (Para APAGARLO: cerra esta ventana o apreta Ctrl+C)
echo.
start "" http://localhost:5173
call npm run dev

pause
