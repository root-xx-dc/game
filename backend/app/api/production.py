from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Production, Inventory
from app.schemas.game import StartProduction
from app.gamedata import RECIPES
from app.production.engine import start
from app.services.settle import settle
router = APIRouter(prefix="/api/production", tags=["production"])
@router.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rep = settle(db, u.id); db.commit()
    ps = db.query(Production).filter_by(user_id=u.id).order_by(Production.id.desc()).limit(20).all()
    return {"recipes": RECIPES, "queue": [{"id": p.id, "recipe": p.recipe, "qty": p.qty,
        "end": p.end.isoformat(), "done": p.done} for p in ps], "away": rep}
@router.post("/start")
def start_p(d: StartProduction, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        r = start(db, u.id, d.recipe, d.qty)
    except ValueError as e:
        raise HTTPException(400, str(e))
    db.commit(); return r
@router.get("/inventory")
def inv(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(Inventory).filter_by(user_id=u.id).all()
    return {"items": [{"item": r.item_id, "qty": r.qty, "avg": r.avg_cost} for r in rows if r.qty > 0]}
