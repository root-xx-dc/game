from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Shipment
from app.schemas.game import Ship
from app.gamedata import VEHICLES
from app.logistics.engine import ship
from app.services.money import add_money
router = APIRouter(prefix="/api/logistics", tags=["logistics"])
@router.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ss = db.query(Shipment).filter_by(user_id=u.id).order_by(Shipment.id.desc()).limit(20).all()
    return {"vehicles": VEHICLES, "shipments": [{"id": s.id, "v": s.vehicle, "item": s.item_id,
        "qty": s.qty, "dest": s.dest, "arrive": s.arrive.isoformat(), "done": s.done} for s in ss]}
@router.post("/ship")
def ship_r(d: Ship, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        r = ship(db, u.id, d.vehicle, d.item_id, d.qty, d.dest)
        add_money(db, u.id, -VEHICLES[d.vehicle]["cost"], "logistics", f"Shipment {d.vehicle}")
    except ValueError as e: raise HTTPException(400, str(e))
    db.commit(); return r
