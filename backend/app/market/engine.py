"""Silnik rynku: regionalne ceny miast, zlecenia kupna/sprzedaży, arbitraż surowcowy i zlecenia limit."""
from sqlalchemy.orm import Session
from app.models.all import MarketItem, MarketOrder, MarketHistory, Company
from app.services.money import add_money
from app.services.settle import inv_add, settle
from app.gamedata import CITIES

def get_regional_price(item_id: str, base_price: float, city_name: str = None) -> float:
    if not city_name:
        return base_price
    city_cfg = next((c for c in CITIES if c["name"] == city_name), None)
    if not city_cfg:
        return base_price
    mult = city_cfg.get("price_mults", {}).get(item_id, 1.0)
    return round(base_price * mult, 2)

def buy(db: Session, uid: int, item: str, qty: float, city: str = None):
    settle(db, uid)
    comp = db.query(Company).filter_by(user_id=uid).first()
    if not city:
        city = comp.headquarters_city if comp else "Warszawa"
    mi = db.query(MarketItem).filter_by(item_id=item).first()
    if not mi: raise ValueError("Nieznany towar.")

    unit_price = get_regional_price(item, mi.price, city)

    # Bonus branżowy dla Górnictwa
    if comp and comp.sector == "Mining" and item in ("iron", "coal", "silicon"):
        unit_price = round(unit_price * 0.85, 2)

    cost = round(unit_price * qty, 2)
    add_money(db, uid, -cost, "market_buy", f"Zakup {qty:g}x {item} @ {unit_price} $ ({city})")
    inv_add(db, uid, item, qty, unit_price, city=city)

    mi.supply = max(10, mi.supply - qty)
    mi.demand += qty * 0.5
    db.add(MarketHistory(item_id=item, price=unit_price))
    return {"qty": qty, "price": unit_price, "cost": cost, "city": city}

def sell(db: Session, uid: int, item: str, qty: float, city: str = None):
    settle(db, uid)
    comp = db.query(Company).filter_by(user_id=uid).first()
    if not city:
        city = comp.headquarters_city if comp else "Warszawa"
    mi = db.query(MarketItem).filter_by(item_id=item).first()
    if not mi: raise ValueError("Nieznany towar.")

    unit_price = get_regional_price(item, mi.price, city)

    # Bonusy sektorowe dla sprzedaży
    if comp and comp.sector == "HighTech" and item in ("electronics", "computers", "components"):
        unit_price = round(unit_price * 1.15, 2)
    elif comp and comp.sector == "Manufacturing" and item in ("steel", "plastic", "machines"):
        unit_price = round(unit_price * 1.10, 2)

    inv_add(db, uid, item, -qty, city=city)
    gain = round(unit_price * qty * 0.98, 2)  # 2% prowizji
    add_money(db, uid, gain, "market_sell", f"Sprzedaż {qty:g}x {item} @ {unit_price} $ ({city})")
    from app.services.missions import mission_add
    mission_add(db, uid, "sell", qty)

    mi.supply += qty
    mi.demand = max(10, mi.demand - qty * 0.3)
    db.add(MarketHistory(item_id=item, price=unit_price))
    return {"qty": qty, "price": unit_price, "gain": gain, "city": city}

def match_limit(db: Session):
    """Matching zleceń limit BUY/SELL."""
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
