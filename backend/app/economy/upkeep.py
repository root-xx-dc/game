"""Minutowy tick na firmę: upkeep, pensje, przychody, respawn kontraktów, dryf akcji, pruning."""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import (Company, Building, Employee, Property, Contract,
                            MarketHistory, News, Log)
from app.gamedata import BUILDINGS, ITEMS, STOCKS
def tick_all(db: Session):
    """Lekkie operacje per firma (1x/60s). Ciężka symulacja tylko globalnie."""
    for c in db.query(Company).all():
        upkeep = sum(BUILDINGS.get(b.type, {}).get("upkeep_h", 0) for b in
                     db.query(Building).filter_by(user_id=c.user_id).all()) / 60.0
        salaries = sum(e.salary for e in
                       db.query(Employee).filter_by(user_id=c.user_id).all()) / 60.0
        income = sum(p.income for p in
                     db.query(Property).filter_by(user_id=c.user_id).all()) / 60.0
        net = round(income - upkeep - salaries, 2)
        if abs(net) >= 0.01:
            if c.money + net >= 0:
                c.money = round(c.money + net, 2)
                c.expenses = round(c.expenses + max(0, -net), 2)
                c.revenue = round(c.revenue + max(0, net), 2)
            else:  # nie stać na utrzymanie → dług + utrata reputacji
                c.debt = round(c.debt - net, 2)
                c.money = 0.0
                c.reputation = max(0, c.reputation - 1)
        c.value = round(c.money + c.assets - c.debt, 2)
    # respawn kontraktów NPC (min. 6 otwartych)
    if db.query(Contract).filter_by(status="open").count() < 6:
        items = list(ITEMS.items())
        item, base = items[db.query(Contract).count() % len(items)]
        qty = 20 + (db.query(Contract).count() * 7) % 80
        db.add(Contract(giver_id=0, title=f"NPC needs {item}", item_id=item, qty=qty,
            reward=round(base * qty * 1.3, 2), penalty=200,
            deadline=datetime.utcnow() + timedelta(days=2)))
    # dryf akcji ±3%
    for s in list(STOCKS):
        STOCKS[s] = round(STOCKS[s] * (1 + random.uniform(-0.03, 0.03)), 2)
    # pruning: historia cen (ostatnie 200/item), newsy (ostatnie 50)
    for item in ITEMS:
        ids = [r.id for r in db.query(MarketHistory).filter_by(item_id=item)
               .order_by(MarketHistory.id.desc()).limit(200).all()]
        if ids:
            db.query(MarketHistory).filter(MarketHistory.item_id == item,
                                           ~MarketHistory.id.in_(ids)).delete(synchronize_session=False)
    old = [r.id for r in db.query(News).order_by(News.id.desc()).limit(50).all()]
    if old:
        db.query(News).filter(~News.id.in_(old)).delete(synchronize_session=False)
    db.flush()
