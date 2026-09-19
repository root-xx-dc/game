"""Automatyczne przyznawanie osiągnięć na podstawie stanu gry (serwer)."""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all import (Company, Building, Employee, Transaction, Production,
                            Holding, Contract, UserAchievement)
def check_achievements(db: Session, uid: int) -> list[str]:
    have = {x.code for x in db.query(UserAchievement).filter_by(user_id=uid).all()}
    c = db.query(Company).filter_by(user_id=uid).one()
    nb = db.query(Building).filter_by(user_id=uid).count()
    ne = db.query(Employee).filter_by(user_id=uid).count()
    ntx = db.query(Transaction).filter_by(user_id=uid).count()
    prod = db.query(func.coalesce(func.sum(Production.qty), 0)).filter_by(user_id=uid, done=True).scalar() or 0
    hold = sum((h.qty * h.avg_cost) for h in db.query(Holding).filter_by(user_id=uid).all())
    ncon = db.query(Contract).filter_by(taker_id=uid, status="done").count()
    conds = {
        "first_factory": db.query(Building).filter_by(user_id=uid, type="Factory").first() is not None,
        "first_million": (c.value or 0) >= 1_000_000,
        "staff100": ne >= 10,
        "ten_buildings": nb >= 10,
        "investor": hold >= 50_000,
        "global": (c.level or 1) >= 10,
        "giant": db.query(Building).filter_by(user_id=uid, type="Industrial Complex").first() is not None,
        "trader10": ntx >= 10,
        "producer1000": prod >= 1000,
        "rich": (c.money or 0) >= 100_000,
    }
    new = []
    for code, ok in conds.items():
        if ok and code not in have:
            db.add(UserAchievement(user_id=uid, code=code)); new.append(code)
    db.flush()
    return new
