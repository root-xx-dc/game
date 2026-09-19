"""Firmy NPC: strategie kupna/sprzedaży/rozwoju (po stronie serwera)."""
import random
COMPANIES = [
    {"name": "Titan Industries", "strategy": "aggressive"},
    {"name": "Volta Energy", "strategy": "energy"},
    {"name": "Nexus Tech", "strategy": "tech"},
    {"name": "Orbit Logistics", "strategy": "logistics"},
]
def ai_tick(db, eco_tick: int):
    from app.models.all import MarketItem
    items = db.query(MarketItem).all()
    if not items: return []
    random.seed(eco_tick)
    acts = []
    for c in COMPANIES:
        mi = random.choice(items)
        d = random.uniform(-60, 80)
        mi.demand = max(50, mi.demand + d)
        acts.append(f"{c['name']} {'buys' if d > 0 else 'sells'} {mi.item_id}")
    db.flush()
    return acts
