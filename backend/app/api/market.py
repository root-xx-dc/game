from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, MarketItem, MarketOrder, MarketHistory
from app.schemas.game import MarketTrade, LimitOrder
from app.market.engine import buy, sell
router = APIRouter(prefix="/api/market", tags=["market"])
@router.get("")
def allm(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return {"items": [{"id": m.item_id, "price": m.price, "supply": m.supply, "demand": m.demand}
                      for m in db.query(MarketItem).order_by(MarketItem.item_id).all()]}
@router.get("/{item}")
def hist(item: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(MarketHistory).filter_by(item_id=item).order_by(MarketHistory.id.desc()).limit(50).all()
    return {"prices": [r.price for r in rows][::-1]}
@router.post("/buy")
def buy_r(d: MarketTrade, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try: r = buy(db, u.id, d.item_id, d.qty)
    except ValueError as e: raise HTTPException(400, str(e))
    db.commit(); return r
@router.post("/sell")
def sell_r(d: MarketTrade, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try: r = sell(db, u.id, d.item_id, d.qty)
    except ValueError as e: raise HTTPException(400, str(e))
    db.commit(); return r
@router.get("/orders/mine")
def mine(u: User = Depends(current_user), db: Session = Depends(get_db)):
    os = db.query(MarketOrder).filter_by(user_id=u.id).order_by(MarketOrder.id.desc()).limit(20).all()
    return {"orders": [{"id": o.id, "item": o.item_id, "side": o.side, "qty": o.qty,
                        "price": o.price, "status": o.status} for o in os]}
@router.post("/orders")
def place(d: LimitOrder, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.side not in ("BUY", "SELL"): raise HTTPException(400, "Side must be BUY/SELL.")
    if not db.query(MarketItem).filter_by(item_id=d.item_id).first(): raise HTTPException(400, "Unknown item.")
    o = MarketOrder(user_id=u.id, item_id=d.item_id, side=d.side, qty=d.qty, price=d.price)
    db.add(o); db.commit()
    return {"id": o.id}
@router.post("/orders/{oid}/cancel")
def cancel(oid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    o = db.query(MarketOrder).filter_by(id=oid, user_id=u.id, status="open").first()
    if not o: raise HTTPException(404, "Order not found.")
    o.status = "cancelled"; db.commit(); return {"ok": True}
