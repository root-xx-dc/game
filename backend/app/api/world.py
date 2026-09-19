from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import (User, City, News, EventLog, Company, Achievement,
                            UserAchievement, Mission, Economy)
router = APIRouter(tags=["world"])
m = APIRouter(prefix="/api/map", tags=["map"])
@m.get("")
def cities(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return {"cities": [{"name": c.name, "population": c.population, "demand": c.demand,
        "wages": c.wages, "taxes": c.taxes, "land": c.land} for c in db.query(City).all()]}
n = APIRouter(prefix="/api/news", tags=["news"])
@n.get("")
def news(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ns = db.query(News).order_by(News.id.desc()).limit(20).all()
    es = db.query(EventLog).order_by(EventLog.id.desc()).limit(20).all()
    eco = db.query(Economy).first()
    return {"news": [{"t": x.text, "at": x.created_at.isoformat()} for x in ns],
            "events": [{"t": x.title, "e": x.effect} for x in es],
            "economy": {"inflation": eco.inflation, "interest": eco.interest,
                        "unemployment": eco.unemployment, "gdp": eco.gdp,
                        "energy": eco.energy_mult, "demand": eco.demand_mult,
                        "tick": eco.tick} if eco else {}}
r = APIRouter(prefix="/api/rankings", tags=["rankings"])
@r.get("")
def rank(u: User = Depends(current_user), db: Session = Depends(get_db)):
    cs = db.query(Company).order_by(Company.value.desc()).limit(20).all()
    return {"by_value": [{"name": c.name, "value": c.value, "level": c.level} for c in cs]}
a = APIRouter(prefix="/api/achievements", tags=["achievements"])
@a.get("")
def ach(u: User = Depends(current_user), db: Session = Depends(get_db)):
    from app.services.achievements import check_achievements
    check_achievements(db, u.id); db.commit()
    all_a = db.query(Achievement).all()
    mine = {x.code for x in db.query(UserAchievement).filter_by(user_id=u.id).all()}
    ms = db.query(Mission).filter_by(user_id=u.id).all()
    return {"all": [{"code": x.code, "title": x.title, "owned": x.code in mine} for x in all_a],
            "missions": [{"id": x.id, "text": x.text, "progress": x.progress,
                          "target": x.target, "done": x.done} for x in ms]}
