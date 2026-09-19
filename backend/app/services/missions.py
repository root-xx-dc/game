"""Misje daily/weekly: nadawanie, postęp, nagrody (serwer)."""
from datetime import date
from sqlalchemy.orm import Session
from app.models.all import Mission
DAILY = [("earn", "Earn 2000", 2000), ("sell", "Sell 50 goods", 50), ("produce", "Produce 30 units", 30)]
WEEKLY = [("value", "Reach company value 50000", 50000), ("contracts", "Complete 5 contracts", 5)]
BONUS = {"daily": 500, "weekly": 3000}
def ensure_missions(db: Session, uid: int):
    today = date.today().isoformat()
    if not db.query(Mission).filter_by(user_id=uid, kind="daily", day=today).first():
        for metric, text, target in DAILY:
            db.add(Mission(user_id=uid, kind="daily", metric=metric, day=today, text=text, target=target))
    if not db.query(Mission).filter_by(user_id=uid, kind="weekly").first():
        for metric, text, target in WEEKLY:
            db.add(Mission(user_id=uid, kind="weekly", metric=metric, day=today, text=text, target=target))
    db.flush()
def mission_add(db: Session, uid: int, metric: str, amount: float):
    if amount <= 0: return
    for m in db.query(Mission).filter_by(user_id=uid, metric=metric, done=False).all():
        m.progress = round(m.progress + amount, 2)
        if m.progress >= m.target:
            m.done = True
            from app.services.money import add_money
            try: add_money(db, uid, BONUS.get(m.kind, 500), "mission", f"Mission: {m.text}")
            except ValueError: pass
    db.flush()
