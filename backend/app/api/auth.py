import time, re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import hash_pw, verify_pw, make_token
from app.core.deps import current_user
from app.models.all import User, Company, Log, Inventory, Research
from app.schemas.game import Register, Login, PasswordChange
from app.gamedata import ITEMS
router = APIRouter(prefix="/api/auth", tags=["auth"])
_calls: dict[str, list[float]] = {}
def limit(key: str, n: int = 20, win: int = 60):
    t = time.time()
    arr = [x for x in _calls.get(key, []) if t - x < win]
    if len(arr) >= n: raise HTTPException(429, "Too many requests, slow down.")
    arr.append(t); _calls[key] = arr
@router.post("/register")
def register(d: Register, db: Session = Depends(get_db)):
    limit("reg", 10, 300)
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", d.email): raise HTTPException(400, "Invalid email.")
    if db.query(User).filter((User.username == d.username) | (User.email == d.email)).first():
        raise HTTPException(400, "Username or email already taken.")
    u = User(username=d.username.strip(), email=d.email.strip().lower(), pw=hash_pw(d.password))
    db.add(u); db.flush()
    c = Company(user_id=u.id, name=d.company.strip()[:60])
    db.add(c); db.flush()
    for item in ("iron", "coal"):
        db.add(Inventory(user_id=u.id, item_id=item, qty=50, avg_cost=ITEMS[item]))
    db.add(Log(kind="auth", user_id=u.id, text=f"register {u.username}"))
    db.commit()
    return {"token": make_token(u.id), "username": u.username}
@router.post("/login")
def login(d: Login, db: Session = Depends(get_db)):
    limit("login", 20, 300)
    u = db.query(User).filter((User.email == d.login.lower()) | (User.username == d.login)).first()
    if not u or not verify_pw(d.password, u.pw): raise HTTPException(401, "Invalid credentials.")
    if u.banned: raise HTTPException(403, "Account banned.")
    from datetime import datetime
    u.last_login = datetime.utcnow()
    db.add(Log(kind="auth", user_id=u.id, text="login"))
    # offline progress + misje dzienne/tygodniowe
    from app.services.settle import settle
    from app.services.missions import ensure_missions
    rep = settle(db, u.id)
    ensure_missions(db, u.id)
    db.commit()
    return {"token": make_token(u.id, u.is_admin), "username": u.username,
            "admin": u.is_admin, "away": rep}
@router.post("/logout")
def logout(u: User = Depends(current_user), db: Session = Depends(get_db)):
    db.add(Log(kind="auth", user_id=u.id, text="logout")); db.commit()
    return {"ok": True}
@router.post("/password")
def password(d: PasswordChange, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if not verify_pw(d.old, u.pw): raise HTTPException(400, "Wrong current password.")
    u.pw = hash_pw(d.new); db.commit()
    return {"ok": True}

@router.post("/discord")
def discord_login(d: dict, db: Session = Depends(get_db)):
    code = str(d.get("code") or "").strip()
    if not code:
        raise HTTPException(400, "Kod Discord jest wymagany.")
    # Normalizacja kodu logowania z bota
    norm_code = re.sub(r"[^A-Za-z0-9]", "", code.upper())
    uname = f"DC_{norm_code[-6:]}" if len(norm_code) >= 6 else f"DC_{norm_code}"
    u = db.query(User).filter(User.username == uname).first()
    if not u:
        u = User(username=uname, email=f"{uname.lower()}@discord.neonmagnat.local", pw=hash_pw(norm_code + "_dc_salt"))
        db.add(u); db.flush()
        c = Company(user_id=u.id, name=f"{uname} Enterprises")
        db.add(c); db.flush()
        for item in ("iron", "coal"):
            db.add(Inventory(user_id=u.id, item_id=item, qty=50, avg_cost=ITEMS[item]))
        db.add(Log(kind="auth", user_id=u.id, text=f"discord register {u.username}"))
        db.commit()
    from datetime import datetime
    u.last_login = datetime.utcnow()
    from app.services.settle import settle
    from app.services.missions import ensure_missions
    rep = settle(db, u.id)
    ensure_missions(db, u.id)
    db.commit()
    return {"token": make_token(u.id, u.is_admin), "username": u.username, "admin": u.is_admin, "away": rep}

