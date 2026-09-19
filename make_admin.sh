#!/usr/bin/env bash
# Promocja użytkownika na admina: ./make_admin.sh <username>
# Działa bez instalowania zależności (stdlib) dla SQLite; dla Postgres wymaga psql lub psycopg.
set -e
cd "$(dirname "$0")"
if [ -f .env ]; then set -a; . ./.env; set +a; fi
U=${1:?usage: ./make_admin.sh <username>}
URL=${DATABASE_URL:-sqlite:///./database/game.db}
case "$URL" in
  sqlite:*)
    P=${URL#sqlite://}
    case "$P" in
      /./*) F=".${P#/}";;   # sqlite:///./rel -> ./rel
      /*)   F="$P";;         # sqlite:////abs -> /abs
      *)    F="$P";;         # relatywna
    esac
    [ -f "$F" ] || { echo "Brak bazy $F - najpierw uruchom backend i załóż konto."; exit 1; }
    python3 - "$F" "$U" <<'EOF'
import sqlite3, sys
con = sqlite3.connect(sys.argv[1]); cur = con.cursor()
cur.execute("UPDATE users SET is_admin=1 WHERE username=?", (sys.argv[2],))
print("admin:" if cur.rowcount else "no user:", sys.argv[2]); con.commit()
EOF
    ;;
  *)
    echo "Postgres: docker compose exec db psql -U tycoon -c \"UPDATE users SET is_admin=1 WHERE username='$U';\""
    ;;
esac
