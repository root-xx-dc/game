"""Wysyłki między miastami."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import Shipment
from app.services.settle import inv_add
from app.gamedata import VEHICLES
def ship(db: Session, uid: int, vehicle: str, item: str, qty: float, dest: str, origin: str = "HQ"):
    v = VEHICLES.get(vehicle)
    if not v: raise ValueError("Unknown vehicle.")
    if qty > v["cap"]: raise ValueError("Exceeds vehicle capacity.")
    inv_add(db, uid, item, -qty)
    s = Shipment(user_id=uid, vehicle=vehicle, item_id=item, qty=qty, origin=origin,
                 dest=dest, arrive=datetime.utcnow() + timedelta(hours=v["hours"]))
    db.add(s); db.flush()
    return {"id": s.id, "arrive": s.arrive.isoformat(), "fee": v["cost"]}
