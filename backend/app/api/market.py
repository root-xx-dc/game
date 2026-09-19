from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, MarketItem, MarketOrder, MarketHistory, Company
from app.schemas.game import MarketTrade, LimitOrder
from app.market.engine import buy, sell, get_regional_price
from app.gamedata import CITIES

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("")
def allm(city: str = None, u: User = Depends(current_user), db: Session = Depends(get_db)):
    comp = db.query(Company).filter_by(user_id=u.id).first()
    active_city = city or (comp.headquarters_city if comp else "Warszawa")

    items = db.query(MarketItem).order_by(MarketItem.item_id).all()
    res = []
    for m in items:
        reg_price = get_regional_price(m.item_id, m.price, active_city)
        res.append({
            "id": m.item_id,
            "base_price": m.price,
            "price": reg_price,
            "supply": m.supply,
            "demand": m.demand,
            "city": active_city
        })

    return {
        "city": active_city,
        "cities": [c["name"] for c in CITIES],
        "items": res
    }

@router.get("/arbitrage")
def arbitrage(u: User = Depends(current_user), db: Session = Depends(get_db)):
    """Wyszukuje najbardziej opłacalne okazje arbitrażowe pomiędzy miastami."""
    items = db.query(MarketItem).all()
    opportunities = []

    for it in items:
        city_prices = [(c["name"], get_regional_price(it.item_id, it.price, c["name"])) for c in CITIES]
        city_prices.sort(key=lambda x: x[1])
        cheapest_city, min_price = city_prices[0]
        priciest_city, max_price = city_prices[-1]
        spread = round(max_price - min_price, 2)
        profit_pct = round(((max_price - min_price) / min_price) * 100, 1)

        if spread > 0.5:
            opportunities.append({
                "item": it.item_id,
                "buy_city": cheapest_city,
                "buy_price": min_price,
                "sell_city": priciest_city,
                "sell_price": max_price,
                "spread": spread,
                "profit_pct": profit_pct
            })

    opportunities.sort(key=lambda x: x["spread"], reverse=True)
    return {"opportunities": opportunities}

@router.get("/{item}")
def hist(item: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(MarketHistory).filter_by(item_id=item).order_by(MarketHistory.id.desc()).limit(50).all()
    return {"prices": [r.price for r in rows][::-1]}

@router.post("/buy")
def buy_r(d: MarketTrade, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        r = buy(db, u.id, d.item_id, d.qty, d.city)
    except ValueError as e:
        raise HTTPException(400, str(e))
    db.commit()
    return r

@router.post("/sell")
def sell_r(d: MarketTrade, u: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        r = sell(db, u.id, d.item_id, d.qty, d.city)
    except ValueError as e:
        raise HTTPException(400, str(e))
    db.commit()
    return r

@router.get("/orders/mine")
def mine(u: User = Depends(current_user), db: Session = Depends(get_db)):
    os = db.query(MarketOrder).filter_by(user_id=u.id).order_by(MarketOrder.id.desc()).limit(20).all()
    return {"orders": [{"id": o.id, "item": o.item_id, "side": o.side, "qty": o.qty,
                        "price": o.price, "status": o.status} for o in os]}

@router.post("/orders")
def place(d: LimitOrder, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.side not in ("BUY", "SELL"):
        raise HTTPException(400, "Strona zlecenia musi być BUY lub SELL.")
    if not db.query(MarketItem).filter_by(item_id=d.item_id).first():
        raise HTTPException(400, "Nieznany towar.")
    o = MarketOrder(user_id=u.id, item_id=d.item_id, side=d.side, qty=d.qty, price=d.price)
    db.add(o)
    db.commit()
    return {"id": o.id}

@router.post("/orders/{oid}/cancel")
def cancel(oid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    o = db.query(MarketOrder).filter_by(id=oid, user_id=u.id, status="open").first()
    if not o:
        raise HTTPException(404, "Zlecenie nie zostało znalezione.")
    o.status = "cancelled"
    db.commit()
    return {"ok": True}
