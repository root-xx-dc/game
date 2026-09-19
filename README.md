# NEON MAGNAT - Economic Strategy / Business Tycoon (online, multiplayer)

Frontend (HTML/CSS/JS) + Backend (Python FastAPI) + DB (SQLite dev / PostgreSQL prod). Ten sam kod działa lokalnie i na VPS - zmienia się tylko konfiguracja `.env`.

## Gra z ludźmi
Kontrakty między graczami (ekran Kontrakty → „Kontrakt z graczem"): nagroda blokowana w escrow, odrzucenie zwraca escrow, niewywiązanie się = kara + **pozew do sądu** (odszkodowanie ze środków pozwanego, reszta w dług + −10 reputacji).
**Czat**: ogólny dla wszystkich, prywatny 1:1 i grupowy (tworzenie/dołączanie), na żywo przez WebSocket + anty-spam.
**Demo** działa z każdej opcji bez konta: Pulpit, Rynek, Budynki, Produkcja, Kontrakty, Inwestycje i Ranking (boty).
Ikony: pliki w `frontend/assets/icons/` + sprite `assets/icons.svg`; generator `python3 tools/make_icons.py`.

## 0. Upload (GitHub)
```bash
cd game && git init && git add -A && git commit -m "Neon Magnat v1" 
git branch -M main && git remote add origin git@github.com:TWOJ-LOGIN/tycoon.git
git push -u origin main
```
Repo nie zawiera sekretów (`.env` jest w `.gitignore`) ani baz (`.db` ignorowane).

## 1. Instalacja lokalna
```bash
cp .env.example .env   # uzupełnij SECRET_KEY (openssl rand -hex 32)
```

## 2. Uruchomienie (gra online: index.html + serwer)
```bash
./start.sh            # stawia SERWER GRY i otwiera grę w przeglądarce
# Wejście do gry: http://localhost:8000/   (index.html serwowany przez backend)
# api:  http://localhost:8000/api   docs: http://localhost:8000/docs
```
Na VPS gracze wchodzą na `http://IP-SERWERA:8000/`. Bez konta można kliknąć **Demo bez konta** - lokalna gra w przeglądarce, bez innych graczy (postęp tylko lokalnie).
**Opcja Docker:**
```bash
./start.sh --docker   # albo: docker compose up --build (gra: http://localhost:3000)
```

**Opcja B - bez Dockera (SQLite):**
```bash
./start.sh   # robi to za Ciebie (venv + pip + serwer :8000 z grą i API)
```

## 3. Konfiguracja `.env`
`DATABASE_URL, SECRET_KEY, ENVIRONMENT, CORS_ORIGINS, FRONTEND_URL` - wzorzec w `.env.example`.
Lokalnie: `DATABASE_URL=sqlite:///./database/game.db` (plik w `database/`). Produkcja: `DATABASE_URL=postgresql://tycoon:XXX@db:5432/tycoon`.

## 4. Docker
`docker-compose.yml`: frontend (nginx) + backend (uvicorn) + database (postgres:16). Sekrety tylko z `.env`, nigdy w kodzie.

## 5. Administrator
```bash
./make_admin.sh <login>   # SQLite: update przez stdlib; Postgres: poda komendę psql
```

## 6. Migracje
Proste `create_all` przy starcie (wystarcza dla tej skali) + `app/seed.py`. Na produkcję można dodać Alembic bez zmian modeli.

## 7. Testy
```bash
cd backend && python -m pytest -q
# testuje: rejestrację, logowanie, buy/sell, anty-cheat inventory, produkcję, kontrakty, kredyty, uprawnienia, walidację
```

## 8. Wdrożenie na VPS - gra online (Ubuntu)
```bash
apt update && apt install -y python3-venv docker.io docker-compose-plugin ufw
ufw allow 8000/tcp && ufw allow 80/tcp && ufw allow 443/tcp
git clone <repo> /opt/tycoon && cd /opt/tycoon/game && cp .env.example .env  # ustaw SECRET_KEY
./start.sh                     # test: gra http://IP-SERWERA:8000/
# na stałe (systemd):
cp systemd/tycoon.service.example /etc/systemd/system/tycoon.service
systemctl daemon-reload && systemctl enable --now tycoon
```
Jeden serwer (`:8000`) serwuje graczom stronę (index.html) i API - wystarczy otworzyć port 8000.
Topologia z domeną: Internet → Nginx (:80/443, `nginx/tycoon.conf.example`) → FastAPI (:8000) → gra+API. Bez zmian kodu - tylko `.env` i Nginx.

## 9. Domena / HTTPS
DNS A → IP VPS. `certbot --nginx -d domena` (patrz `nginx/tycoon.conf.example`).

## 10. API
`/api/auth, /api/company, /api/buildings, /api/production(+/inventory), /api/market(+orders), /api/contracts, /api/logistics, /api/investments, /api/bank, /api/employees, /api/research, /api/properties, /api/map, /api/news, /api/rankings, /api/achievements, /api/statistics, /api/admin` + Swagger `/docs` + WS `/ws` (tick + ceny live). Cała ekonomia na backendzie; frontend nigdy nie ustala pieniędzy/cen/XP.
