"""Offline progress + rozliczanie produkcji/wysyłek/kontraktów/bankowości."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import Company, Production, Shipment, Inventory, Contract, Loan, Deposit, Mission, Warehouse
from app.services.money import add_money
from app.gamedata import RECIPES, ITEMS

def inv_add(db, uid, item, qty, cost=0.0, city=None):
    if not city:
        comp = db.query(Company).filter_by(user_id=uid).first()
        city = comp.headquarters_city if comp else "Warszawa"
    # Ensure warehouse exists in this city
    wh = db.query(Warehouse).filter_by(user_id=uid, city=city).first()
    if not wh:
        db.add(Warehouse(user_id=uid, city=city, capacity=5000.0, level=1))
        db.flush()
    inv = db.query(Inventory).filter_by(user_id=uid, city=city, item_id=item).first()
    if not inv:
        inv = Inventory(user_id=uid, city=city, item_id=item, qty=0, avg_cost=0)
        db.add(inv); db.flush()
    if qty < 0 and inv.qty + qty < -1e-9:
        raise ValueError(f"Brak wystarczającej ilości {item} w magazynie w mieście {city}.")
    if qty > 0 and cost >= 0:
        total = inv.qty + qty
        inv.avg_cost = round((inv.avg_cost * inv.qty + cost) / total, 2) if total else cost
    inv.qty = round(inv.qty + qty, 2)
    return inv.qty

def settle(db: Session, uid: int):
    """Rozlicz wszystko co minęło. Zwraca raport 'while you were away'."""
    rep = {"produced": [], "arrived": [], "contracts": 0, "interest": 0.0}
    now = datetime.utcnow()
    comp = db.query(Company).filter_by(user_id=uid).first()
    hq_city = comp.headquarters_city if comp else "Warszawa"

    for p in db.query(Production).filter_by(user_id=uid, done=False).all():
        if p.end <= now:
            p.done = True
            inv_add(db, uid, p.recipe, p.qty, 0.0, city=hq_city)
            rep["produced"].append(f"{p.qty:g}x {p.recipe} ({hq_city})")
            from app.services.missions import mission_add
            mission_add(db, uid, "produce", p.qty)
    for s in db.query(Shipment).filter_by(user_id=uid, done=False).all():
        if s.arrive <= now:
            s.done = True
            inv_add(db, uid, s.item_id, s.qty, 0.0, city=s.dest)
            rep["arrived"].append(f"{s.qty:g}x {s.item_id} → {s.dest}")
    for c in db.query(Contract).filter_by(taker_id=uid, status="taken").all():
        if c.deadline < now:
            c.status = "failed"
            try: add_money(db, uid, -c.penalty, "penalty", f"Contract penalty #{c.id}")
            except ValueError: pass
    # misja "value" + osiągnięcia sprawdzane centralnie przy każdym settle
    comp = db.query(Company).filter_by(user_id=uid).first()
    if comp:
        from app.services.missions import mission_add
        for m in db.query(Mission).filter_by(user_id=uid, metric="value", done=False).all():
            if comp.value >= m.target:
                mission_add(db, uid, "value", m.target - m.progress)
        from app.services.achievements import check_achievements
        rep["achievements"] = check_achievements(db, uid)
    db.flush()
    return rep
