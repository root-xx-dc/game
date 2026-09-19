from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Shipment, Warehouse, Inventory, Company
from app.schemas.game import Ship
from app.gamedata import VEHICLES, CITIES, SECTORS
from app.logistics.engine import ship, calc_route
from app.services.money import add_money
from app.services.settle import settle

router = APIRouter(prefix="/api/logistics", tags=["logistics"])

@router.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    settle(db, u.id)
    comp = db.query(Company).filter_by(user_id=u.id).first()
    hq = comp.headquarters_city if comp else "Warszawa"

    # Upewnij się, że gracz ma przynajmniej magazyn w HQ
    wh_hq = db.query(Warehouse).filter_by(user_id=u.id, city=hq).first()
    if not wh_hq:
        db.add(Warehouse(user_id=u.id, city=hq, capacity=5000.0, level=1))
        db.commit()

    # Pobierz wszystkie magazyny gracza i ich stan magazynowy
    warehouses = db.query(Warehouse).filter_by(user_id=u.id).all()
    invs = db.query(Inventory).filter_by(user_id=u.id).all()

    wh_data = []
    for w in warehouses:
        city_items = [{"id": i.item_id, "qty": i.qty, "avg_cost": i.avg_cost}
                      for i in invs if i.city == w.city and i.qty > 0.001]
        used_cap = sum(i["qty"] for i in city_items)
        wh_data.append({
            "id": w.id,
            "city": w.city,
            "capacity": w.capacity,
            "used": round(used_cap, 1),
            "level": w.level,
            "items": city_items
        })

    ss = db.query(Shipment).filter_by(user_id=u.id).order_by(Shipment.id.desc()).limit(30).all()

    return {
        "vehicles": VEHICLES,
        "cities": [c["name"] for c in CITIES],
        "warehouses": wh_data,
        "shipments": [
            {
                "id": s.id,
                "v": s.vehicle,
                "item": s.item_id,
                "qty": s.qty,
                "origin": s.origin or hq,
                "dest": s.dest,
                "cost": s.cost,
                "distance_km": s.distance_km,
                "arrive": s.arrive.isoformat(),
                "done": s.done
            }
            for s in ss
        ]
    }

@router.get("/quote")
def quote(origin: str, dest: str, vehicle: str = "Truck", qty: float = 100,
          u: User = Depends(current_user), db: Session = Depends(get_db)):
    comp = db.query(Company).filter_by(user_id=u.id).first()
    r = calc_route(origin, dest, vehicle, qty)
    if comp and comp.sector == "Logistics":
        r["cost"] = round(r["cost"] * 0.65, 2)
        r["travel_minutes"] = max(1, round(r["travel_minutes"] * 0.70))
        r["sector_discount"] = True
    return r

@router.post("/ship")
def ship_r(d: Ship, u: User = Depends(current_user), db: Session = Depends(get_db)):
    settle(db, u.id)
    try:
        r = ship(db, u.id, d.vehicle, d.item_id, d.qty, d.dest, d.origin)
    except ValueError as e:
        raise HTTPException(400, str(e))
    db.commit()
    return r

@router.post("/warehouse/build")
def build_warehouse(d: dict, u: User = Depends(current_user), db: Session = Depends(get_db)):
    city = str(d.get("city") or "").strip()
    valid_cities = [c["name"] for c in CITIES]
    if city not in valid_cities:
        raise HTTPException(400, "Nieprawidłowe miasto.")

    existing = db.query(Warehouse).filter_by(user_id=u.id, city=city).first()
    if existing:
        # Upgrade
        cost = existing.level * 15000
        comp = db.query(Company).filter_by(user_id=u.id).one()
        if comp.money < cost:
            raise HTTPException(400, f"Za mało gotówki na rozbudowę magazynu ({cost} $).")
        add_money(db, u.id, -cost, "build", f"Rozbudowa magazynu w {city} do poziomu {existing.level + 1}")
        existing.level += 1
        existing.capacity += 5000
        db.commit()
        return {"ok": True, "city": city, "level": existing.level, "capacity": existing.capacity}
    else:
        cost = 10000
        comp = db.query(Company).filter_by(user_id=u.id).one()
        if comp.money < cost:
            raise HTTPException(400, f"Za mało gotówki na otwarcie magazynu w {city} ({cost} $).")
        add_money(db, u.id, -cost, "build", f"Budowa nowego magazynu w {city}")
        w = Warehouse(user_id=u.id, city=city, capacity=5000.0, level=1)
        db.add(w)
        db.commit()
        return {"ok": True, "city": city, "level": 1, "capacity": 5000.0}
