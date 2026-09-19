# Baza danych - pliki SQLite (dev) i migracje proste (create_all).
# Produkcja: PostgreSQL z docker-compose (wolumen pgdata).
# Tabele tworzone automatycznie przy starcie backendu (Base.metadata.create_all)
# + seed danych startowych (surowce, miasta, osiągnięcia, kontrakty NPC).
# init.sql - minimalny podgląd dla admina Postgresa:
CREATE TABLE IF NOT EXISTS _readme(id SERIAL PRIMARY KEY, note TEXT);
