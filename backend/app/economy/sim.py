"""Tick globalnej gospodarki + eventy + newsy + AI (wydajny, 1x/60s)."""
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all import Economy, MarketItem, MarketHistory, EventLog, News, Company
from app.gamedata import ITEMS, EVENTS, NEWS_T, STOCKS
def tick(db: Session):
    eco = db.query(Economy).first()
    if not eco:
        eco = Economy(); db.add(eco); db.flush()
    eco.tick += 1
    eco.inflation = round(max(-0.02, min(0.15, eco.inflation + random.uniform(-0.005, 0.005))), 4)
    eco.interest = round(max(0.01, min(0.2, eco.interest + random.uniform(-0.004, 0.004))), 4)
    eco.unemployment = round(max(0.02, min(0.25, eco.unemployment + random.uniform(-0.004, 0.004))), 4)
    eco.energy_mult = round(max(0.5, min(2.0, eco.energy_mult + random.uniform(-0.05, 0.05))), 3)
    eco.demand_mult = round(max(0.6, min(1.8, eco.demand_mult + random.uniform(-0.05, 0.05))), 3)
    # dryf cen wg supply/demand + inflacja
    for mi in db.query(MarketItem).all():
        base = ITEMS.get(mi.item_id, 10)
        ratio = (mi.demand + 1) / (mi.supply + 1)
        target = base * (0.5 + ratio) * (1 + eco.inflation) * eco.demand_mult
        mi.price = round(max(base * 0.2, min(base * 5, mi.price * 0.9 + target * 0.1)), 2)
        mi.supply = round(mi.supply * 0.995 + 500 * 0.005, 1)
        mi.demand = round(mi.demand * 0.995 + 500 * 0.005, 1)
        db.add(MarketHistory(item_id=mi.item_id, price=mi.price))
    # event co ~5 ticków
    if eco.tick % 5 == 0:
        title, eff, mods = EVENTS[(eco.tick // 5) % len(EVENTS)]
        for item, mult in mods.items():
            mi = db.query(MarketItem).filter_by(item_id=item).first()
            if mi: mi.price = round(mi.price * mult, 2)
        db.add(EventLog(title=title, effect=eff))
        db.add(News(text=f"{title}. {eff}"))
    if eco.tick % 3 == 0:
        db.add(News(text=NEWS_T[eco.tick % len(NEWS_T)]))
    # AI: losowa firma NPC porusza rynkiem
    if eco.tick % 2 == 0:
        mi = db.query(MarketItem).order_by(MarketItem.item_id).offset(eco.tick % len(ITEMS)).first()
        if mi:
            dq = random.uniform(-40, 40)
            mi.demand = max(50, mi.demand + dq)
    # czyść stare historie (zostaw 200/punkt)
    db.flush()
    return {"tick": eco.tick, "inflation": eco.inflation, "interest": eco.interest,
            "energy_mult": eco.energy_mult, "demand_mult": eco.demand_mult}
