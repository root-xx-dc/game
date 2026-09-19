from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Company, Building, Log
from app.schemas.game import BuyBuilding
from app.gamedata import BUILDINGS
from app.services.money import add_money
router = APIRouter(prefix="/api/buildings", tags=["buildings"])
@router.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    own = db.query(Building).filter_by(user_id=u.id).all()
    return {"catalog": BUILDINGS, "owned": [{"id": b.id, "type": b.type, "level": b.level} for b in own]}
@router.post("/buy")
def buy(d: BuyBuilding, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.type not in BUILDINGS: raise HTTPException(400, "Unknown building.")
    c = db.query(Company).filter_by(user_id=u.id).one()
    req = BUILDINGS[d.type].get("req", 1)
    if c.level < req: raise HTTPException(400, f"Building requires level {req}.")
    price = BUILDINGS[d.type]["price"]
    n = db.query(Building).filter_by(user_id=u.id, type=d.type).count()
    price = round(price * (1 + 0.15 * n), 2)
    if c.money < price: raise HTTPException(400, "Insufficient funds.")
    add_money(db, u.id, -price, "building", f"Buy {d.type}")
    c.assets = round(c.assets + price, 2)
    db.add(Building(user_id=u.id, type=d.type))
    db.add(Log(kind="game", user_id=u.id, text=f"buy {d.type}"))
    db.commit()
    return {"ok": True, "price": price}
