from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Company, Transaction, Statistic
from app.schemas.game import CompanyPatch
from app.services.settle import settle
router = APIRouter(prefix="/api", tags=["company"])
@router.get("/company")
def company(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rep = settle(db, u.id); db.commit()
    c = db.query(Company).filter_by(user_id=u.id).one()
    return {"company": {k: getattr(c, k) for k in
        ("name","logo","sector","level","xp","reputation","money","assets","debt","revenue","expenses","value")},
        "away": rep}
@router.patch("/company")
def patch(d: CompanyPatch, u: User = Depends(current_user), db: Session = Depends(get_db)):
    from app.gamedata import COMPANY_LOGOS
    c = db.query(Company).filter_by(user_id=u.id).one()
    if d.name: c.name = d.name[:60]
    if d.logo:
        if d.logo not in COMPANY_LOGOS: raise HTTPException(400, "Unknown logo.")
        c.logo = d.logo
    if d.sector: c.sector = d.sector[:30]
    db.commit(); return {"ok": True}
@router.get("/users/me")
def me(u: User = Depends(current_user)):
    return {"id": u.id, "username": u.username, "email": u.email, "admin": u.is_admin}
@router.get("/statistics")
def stats(u: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.query(Statistic).filter_by(user_id=u.id).order_by(Statistic.day).limit(30).all()
    tx = db.query(Transaction).filter_by(user_id=u.id).order_by(Transaction.id.desc()).limit(20).all()
    return {"stats": [{"day": r.day, "revenue": r.revenue, "profit": r.profit, "value": r.value} for r in rows],
            "tx": [{"type": t.type, "amount": t.amount, "after": t.balance_after, "desc": t.description} for t in tx]}
