"""Silnik logistyki: trasy międzymiastowe, transport ładunków między własnymi magazynami, kalkulacja odległości i czasu."""
import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import Shipment, Company, Warehouse
from app.services.settle import inv_add
from app.services.money import add_money
from app.gamedata import VEHICLES, CITIES, SECTORS

CITY_MAP = {c["name"]: c for c in CITIES}

def calc_route(origin: str, dest: str, vehicle: str, qty: float = 100):
    c1 = CITY_MAP.get(origin)
    c2 = CITY_MAP.get(dest)
    v = VEHICLES.get(vehicle, VEHICLES["Truck"])
    if not c1 or not c2:
        dist_km = 450
    else:
        dist_km = max(80, round(math.hypot(c1["x"] - c2["x"], c1["y"] - c2["y"]) * 2.8))

    # Czas w minutach (dla dynamicznej rozgrywki: 1h czasu realnego = np. 2 minuty gry)
    travel_minutes = max(1, round((dist_km / v["speed_kmh"]) * 8))
    # Koszt transportu
    fuel_cost = round(v["base_cost"] + (dist_km * v["cost_km"] * max(0.5, qty / v["cap"])), 2)
    return {
        "distance_km": dist_km,
        "travel_minutes": travel_minutes,
        "cost": fuel_cost
    }

def ship(db: Session, uid: int, vehicle: str, item: str, qty: float, dest: str, origin: str = None):
    v = VEHICLES.get(vehicle)
    if not v: raise ValueError("Nieznany typ pojazdu.")
    if qty <= 0: raise ValueError("Ilość musi być większa od zera.")
    if qty > v["cap"] * 1.5: raise ValueError(f"Przekroczono maksymalną ładowność ({v['cap']} j.).")

    comp = db.query(Company).filter_by(user_id=uid).first()
    if not origin:
        origin = comp.headquarters_city if comp else "Warszawa"

    if origin == dest:
        raise ValueError("Miasto początkowe i docelowe nie mogą być takie same.")

    # Pobierz informacje o trasie
    route = calc_route(origin, dest, vehicle, qty)
    cost = route["cost"]
    minutes = route["travel_minutes"]

    # Zastosuj bonus branży logistycznej
    if comp and comp.sector == "Logistics":
        cost = round(cost * 0.65, 2)
        minutes = max(1, round(minutes * 0.70))

    if comp and comp.money < cost:
        raise ValueError(f"Niewystarczające środki na opłacenie transportu ({cost} $).")

    # Pobierz towar z magazynu w mieście początkowym
    inv_add(db, uid, item, -qty, city=origin)

    # Pobierz opłatę transportową
    add_money(db, uid, -cost, "logistics", f"Fracht {vehicle}: {origin} → {dest}")

    # Upewnij się, że gracz ma zarejestrowany magazyn docelowy
    wh_dest = db.query(Warehouse).filter_by(user_id=uid, city=dest).first()
    if not wh_dest:
        db.add(Warehouse(user_id=uid, city=dest, capacity=5000.0, level=1))
        db.flush()

    arrive_time = datetime.utcnow() + timedelta(minutes=minutes)
    s = Shipment(
        user_id=uid,
        vehicle=vehicle,
        item_id=item,
        qty=qty,
        origin=origin,
        dest=dest,
        cost=cost,
        distance_km=route["distance_km"],
        arrive=arrive_time,
        done=False
    )
    db.add(s)
    db.flush()

    return {
        "id": s.id,
        "origin": origin,
        "dest": dest,
        "vehicle": vehicle,
        "qty": qty,
        "cost": cost,
        "distance_km": route["distance_km"],
        "arrive": arrive_time.isoformat(),
        "minutes": minutes
    }
