@echo off
setlocal
cd /d "%~dp0"
title Sistema Solar 3D

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js nao encontrado.
  echo     Abra o arquivo index.html diretamente no navegador — funciona igual.
  pause
  exit /b 1
)

echo Iniciando servidor em http://localhost:5500 ...
start "" http://localhost:5500
node servidor.js 5500
echo.
echo Servidor encerrado.
pause
