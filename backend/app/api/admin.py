from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import admin_user
from app.models.all import User, Company, Economy, EventLog, News, Log
from app.economy.sim import tick
router = APIRouter(prefix="/api/admin", tags=["admin"])
@router.get("/overview")
def over(a=Depends(admin_user), db: Session = Depends(get_db)):
    logs = db.query(Log).order_by(Log.id.desc()).limit(30).all()
    return {"users": db.query(User).count(), "companies": db.query(Company).count(),
            "logs": [{"k": l.kind, "u": l.user_id, "t": l.text} for l in logs]}
@router.get("/users")
def users(a=Depends(admin_user), db: Session = Depends(get_db)):
    return {"users": [{"id": u.id, "name": u.username, "banned": u.banned, "admin": u.is_admin} for u in db.query(User).limit(100).all()]}
@router.post("/ban/{uid}")
def ban(uid: int, a=Depends(admin_user), db: Session = Depends(get_db)):
    u = db.get(User, uid)
    if not u: raise HTTPException(404, "No user.")
    u.banned = not u.banned
    db.add(Log(kind="admin", user_id=a.id, text=f"ban {uid} -> {u.banned}")); db.commit()
    return {"banned": u.banned}
@router.post("/event")
def ev(title: str, effect: str = "", a=Depends(admin_user), db: Session = Depends(get_db)):
    db.add(EventLog(title=title, effect=effect)); db.add(News(text=title)); db.commit()
    return {"ok": True}
@router.post("/tick")
def tick_r(a=Depends(admin_user), db: Session = Depends(get_db)):
    r = tick(db); db.commit(); return r
@router.post("/economy")
def eco(inflation: float = 0.02, interest: float = 0.05, a=Depends(admin_user), db: Session = Depends(get_db)):
    e = db.query(Economy).first(); e.inflation = inflation; e.interest = interest
    db.add(Log(kind="admin", user_id=a.id, text="economy edit")); db.commit(); return {"ok": True}
