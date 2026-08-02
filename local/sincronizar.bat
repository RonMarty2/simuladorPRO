@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
title Simulador PRO - Sincronizar con GitHub

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No encuentro Git. Instalalo desde https://git-scm.com
  pause
  exit /b 1
)

:menu
cls
echo ============================================
echo    SIMULADOR PRO - sincronizar con GitHub
echo ============================================
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set RAMA=%%b
echo    Rama actual: %RAMA%
echo --------------------------------------------
echo    1^) Traer lo ultimo de GitHub  (bajar)
echo    2^) Subir mis cambios a GitHub (subir)
echo    3^) Salir
echo ============================================
set /p op="Elegi una opcion (1/2/3): "

if "%op%"=="1" goto pull
if "%op%"=="2" goto push
if "%op%"=="3" goto fin
goto menu

:pull
echo.
echo Trayendo cambios de GitHub...
git pull
echo.
echo Listo. Si hubo cambios, reinicia el simulador (iniciar.bat).
pause
goto menu

:push
echo.
set /p msg="Describi en pocas palabras que cambiaste: "
if "%msg%"=="" set msg=Cambios locales
git add -A
git commit -m "%msg%"
if errorlevel 1 (
  echo.
  echo No habia cambios nuevos para subir ^(o el commit fallo^).
  pause
  goto menu
)
git push -u origin HEAD
echo.
echo Cambios subidos a GitHub.
pause
goto menu

:fin
exit /b 0
