"""Seed startowy bazy."""
from sqlalchemy.orm import Session
from app.models.all import MarketItem, City, Achievement
from app.gamedata import ITEMS, CITIES, ACHIEVEMENTS
def seed(db: Session):
    if db.query(MarketItem).first(): return
    for item, base in ITEMS.items():
        db.add(MarketItem(item_id=item, price=float(base), supply=1000, demand=1000))
    for c in CITIES:
        db.add(City(**c))
    for code, title, desc in ACHIEVEMENTS:
        db.add(Achievement(code=code, title=title, description=desc))
    db.commit()
