"""Silnik rynku: kupno/sprzedaż po cenie serwera + zlecenia limit."""
from sqlalchemy.orm import Session
from app.models.all import MarketItem, MarketOrder, MarketHistory
from app.services.money import add_money
from app.services.settle import inv_add, settle
def buy(db: Session, uid: int, item: str, qty: float):
    settle(db, uid)
    mi = db.query(MarketItem).filter_by(item_id=item).first()
    if not mi: raise ValueError("Unknown item.")
    cost = round(mi.price * qty, 2)
    add_money(db, uid, -cost, "market_buy", f"Buy {qty:g}x {item} @ {mi.price}")
    inv_add(db, uid, item, qty, mi.price)
    mi.supply = max(10, mi.supply - qty); mi.demand += qty * 0.5
    db.add(MarketHistory(item_id=item, price=mi.price))
    return {"qty": qty, "price": mi.price, "cost": cost}
def sell(db: Session, uid: int, item: str, qty: float):
    settle(db, uid)
    mi = db.query(MarketItem).filter_by(item_id=item).first()
    if not mi: raise ValueError("Unknown item.")
    inv_add(db, uid, item, -qty)
    gain = round(mi.price * qty * 0.98, 2)  # 2% prowizji
    add_money(db, uid, gain, "market_sell", f"Sell {qty:g}x {item} @ {mi.price}")
    from app.services.missions import mission_add
    mission_add(db, uid, "sell", qty)
    mi.supply += qty; mi.demand = max(10, mi.demand - qty * 0.3)
    db.add(MarketHistory(item_id=item, price=mi.price))
    return {"qty": qty, "price": mi.price, "gain": gain}
def match_limit(db: Session):
    """Prosty matching: zlecenia BUY/SELL vs cena rynkowa."""
    filled = 0
    for o in db.query(MarketOrder).filter_by(status="open").all():
        mi = db.query(MarketItem).filter_by(item_id=o.item_id).first()
        if not mi: continue
        if o.side == "BUY" and mi.price <= o.price:
            cost = round(mi.price * (o.qty - o.filled), 2)
            try:
                add_money(db, o.user_id, -cost, "market_buy", f"Limit BUY {o.item_id}")
                inv_add(db, o.user_id, o.item_id, o.qty - o.filled, mi.price)
                o.filled = o.qty; o.status = "filled"; filled += 1
            except ValueError:
                o.status = "cancelled"
        elif o.side == "SELL" and mi.price >= o.price:
            try:
                inv_add(db, o.user_id, o.item_id, -(o.qty - o.filled))
                gain = round(mi.price * (o.qty - o.filled) * 0.98, 2)
                add_money(db, o.user_id, gain, "market_sell", f"Limit SELL {o.item_id}")
                o.filled = o.qty; o.status = "filled"; filled += 1
            except ValueError:
                o.status = "cancelled"
    db.flush()
    return filled
