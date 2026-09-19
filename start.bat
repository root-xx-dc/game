@echo off
REM NEON MAGNAT - serwer gry ONLINE (gra + API na porcie 8000).
cd /d %~dp0
if not exist .env copy .env.example .env
if "%1"=="--docker" (
  echo Start przez Docker Compose... (gra: http://localhost:3000)
  docker compose up --build
  exit /b
)
echo === NEON MAGNAT: start serwera gry ===
pip install -q -r backend\requirements.txt
if "%DATABASE_URL%"=="" set DATABASE_URL=sqlite:///./database/game.db
if "%SECRET_KEY%"=="" set SECRET_KEY=dev-secret-change-me-please-1234567890
if not exist database mkdir database
start "tycoon-server" cmd /c "uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000"
timeout /t 6 >nul
start http://localhost:8000/
echo Serwer gry ONLINE: gra http://localhost:8000/ , api http://localhost:8000/api
