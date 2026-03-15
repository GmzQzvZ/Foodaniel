@echo off
setlocal

cd /d "%~dp0"

if not exist "BackEnd\package.json" (
  echo [ERROR] No se encontro BackEnd\package.json
  pause
  exit /b 1
)

cd BackEnd

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Fallo npm install
    pause
    exit /b 1
  )
)

echo Iniciando backend en modo desarrollo...
call npm run dev

endlocal
