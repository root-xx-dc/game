"""Produkcja w czasie - start na serwerze, koniec po timestampie."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import Building, Production, Research
from app.services.settle import inv_add
from app.gamedata import RECIPES, BUILDINGS
def start(db: Session, uid: int, recipe: str, qty: float):
    r = RECIPES.get(recipe)
    if not r: raise ValueError("Unknown recipe.")
    need_b = r["building"]
    b = db.query(Building).filter_by(user_id=uid, type=need_b).first()
    if not b and need_b == "Industrial Complex":
        b = db.query(Building).filter_by(user_id=uid, type="Factory").first()
    if not b: raise ValueError(f"Building requires {need_b}.")
    bonus = BUILDINGS.get(b.type, {}).get("bonus", 0)
    lvl = db.query(Research).filter_by(user_id=uid, branch="Production").first()
    if lvl: bonus += lvl.level * 0.03
    for item, per in r["in"].items():
        inv_add(db, uid, item, -per * qty)  # anty-cheat: nie sprzedaj powietrza
    secs = max(10, int(r["time"] * qty * (1 - min(0.5, bonus))))
    now = datetime.utcnow()
    p = Production(user_id=uid, recipe=recipe, qty=qty, start=now, end=now + timedelta(seconds=secs))
    db.add(p); db.flush()
    return {"id": p.id, "ends_in": secs}
