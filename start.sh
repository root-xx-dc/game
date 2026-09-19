#!/usr/bin/env bash
# NEON MAGNAT - serwer gry ONLINE. Jeden proces serwuje grę (index.html) i API.
#   ./start.sh           -> serwer lokalny (SQLite), gra: http://localhost:8000/
#   ./start.sh --docker  -> docker compose (gra: http://localhost:3000)
# Na VPS: uruchom ./start.sh (najlepiej pod systemd/tmux), gracze wchodzą na http://IP-SERWERA:8000/
set -e
cd "$(dirname "$0")"
if [ ! -f .env ]; then cp .env.example .env; echo "Utworzono .env z .env.example (uzupelnij SECRET_KEY)."; fi
set -a; . ./.env 2>/dev/null; set +a
if [ "${1:-}" = "--docker" ]; then
  echo "Start przez Docker Compose... (gra: http://localhost:3000)"
  exec docker compose up --build
fi
echo "=== NEON MAGNAT: start serwera gry ==="
python3 -m venv .venv 2>/dev/null || true
# shellcheck disable=SC1091
. .venv/bin/activate 2>/dev/null || true
pip install -q -r backend/requirements.txt
export DATABASE_URL="${DATABASE_URL:-sqlite:///./database/game.db}"
if [ -z "${SECRET_KEY:-}" ] || [ "$SECRET_KEY" = "change-me-to-a-long-random-string-min-32-chars" ]; then
  export SECRET_KEY="dev-secret-change-me-please-1234567890"
  echo "UWAGA: domyslny SECRET_KEY (dev). Na VPS ustaw wlasny w .env!"
fi
command -v curl >/dev/null 2>&1 || { echo "Brak curl - zainstaluj: apt install curl"; exit 1; }
mkdir -p database
pkill -f "uvicorn app.main:app --app-dir backend" 2>/dev/null || true
sleep 1
nohup uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 >backend.log 2>&1 &
BPID=$!
cleanup() { echo; echo "Zatrzymywanie serwera..."; kill $BPID 2>/dev/null || true; }
# Bez EXIT: rozlaczenie SSH (HUP) nie zabija serwera (nohup) - wazne na VPS.
trap cleanup INT TERM
echo "Czekanie na serwer (http://localhost:8000/api/health)..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/api/health >/dev/null 2>&1; then break; fi
  if ! kill -0 $BPID 2>/dev/null; then echo "Serwer nie wystartował - patrz backend.log"; tail -20 backend.log; exit 1; fi
  sleep 1
done
curl -sf http://localhost:8000/api/health >/dev/null || { echo "Serwer nie odpowiada."; exit 1; }
echo "Serwer gry ONLINE:"
echo "  gra (index.html): http://localhost:8000/   (na VPS: http://IP-SERWERA:8000/)"
echo "  api / docs:       http://localhost:8000/api  http://localhost:8000/docs"
(python3 -m webbrowser http://localhost:8000/ >/dev/null 2>&1 &) || true
echo "Ctrl+C aby zatrzymać serwer. (Na VPS zostaw w tmux/systemd.)"
wait $BPID
