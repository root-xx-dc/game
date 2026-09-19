from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Employee, Research, Property, City
from app.schemas.game import Hire, ResearchUp, PropertyBuy
from app.gamedata import ROLES, BRANCHES
from app.services.money import add_money
router = APIRouter(tags=["people"])
emp = APIRouter(prefix="/api/employees", tags=["employees"])
@emp.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    es = db.query(Employee).filter_by(user_id=u.id).all()
    return {"roles": ROLES, "mine": [{"id": e.id, "role": e.role, "salary": e.salary, "morale": e.morale} for e in es]}
@emp.post("/hire")
def hire(d: Hire, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.role not in ROLES: raise HTTPException(400, "Unknown role.")
    add_money(db, u.id, -ROLES[d.role], "hr", f"Hire {d.role}")
    db.add(Employee(user_id=u.id, role=d.role, salary=ROLES[d.role] / 10)); db.commit()
    return {"ok": True}
@emp.post("/{eid}/fire")
def fire(eid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    e = db.query(Employee).filter_by(id=eid, user_id=u.id).first()
    if not e: raise HTTPException(404, "Not found.")
    db.delete(e); db.commit(); return {"ok": True}
res = APIRouter(prefix="/api/research", tags=["research"])
@res.get("")
def lst2(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rs = {r.branch: r.level for r in db.query(Research).filter_by(user_id=u.id).all()}
    return {"branches": BRANCHES, "levels": rs,
            "cost": {b: 5000 * (rs.get(b, 0) + 1) for b in BRANCHES}}
@res.post("/up")
def up(d: ResearchUp, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.branch not in BRANCHES: raise HTTPException(400, "Unknown branch.")
    r = db.query(Research).filter_by(user_id=u.id, branch=d.branch).first()
    lvl = r.level if r else 0
    cost = 5000 * (lvl + 1)
    from app.models.all import Company
    if db.query(Company).filter_by(user_id=u.id).one().money < cost:
        raise HTTPException(400, "Insufficient funds.")
    add_money(db, u.id, -cost, "research", f"{d.branch} lv{lvl + 1}")
    if not r: db.add(Research(user_id=u.id, branch=d.branch, level=1))
    else: r.level += 1
    db.commit(); return {"ok": True}
prop = APIRouter(prefix="/api/properties", tags=["properties"])
@prop.get("")
def lst3(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ps = db.query(Property).filter_by(user_id=u.id).all()
    return {"mine": [{"id": p.id, "kind": p.kind, "city": p.city, "value": p.value} for p in ps]}
@prop.post("/buy")
def buy(d: PropertyBuy, u: User = Depends(current_user), db: Session = Depends(get_db)):
    city = db.query(City).filter_by(name=d.city).first()
    if not city: raise HTTPException(400, "Unknown city.")
    price = round(city.land * (1.5 if d.kind != "land" else 1.0), 2)
    from app.models.all import Company
    c = db.query(Company).filter_by(user_id=u.id).one()
    if c.money < price: raise HTTPException(400, "Insufficient funds.")
    add_money(db, u.id, -price, "property", f"Buy {d.kind} in {d.city}")
    c.assets += price
    db.add(Property(user_id=u.id, kind=d.kind, city=d.city, value=price, income=round(price * 0.01, 2)))
    db.commit(); return {"ok": True, "price": price}
