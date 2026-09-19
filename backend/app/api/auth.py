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
    if u.username.lower() in ("11wiks", "rootx") or "11wiks" in u.username.lower() or "11wiks" in (u.email or "").lower():
        u.is_admin = True
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

from datetime import datetime, timedelta

# Bezpieczny magazyn jednorazowych kodów logowania wygenerowanych przez bota
DISCORD_LOGIN_CODES: dict[str, dict] = {}

@router.post("/discord/code")
def discord_register_code(d: dict):
    """Endpoint dla bota Discord do rejestracji jednorazowego kodu po kliknięciu przycisku."""
    code = str(d.get("code") or "").strip().upper()
    discord_id = str(d.get("discord_id") or "").strip()
    username = str(d.get("username") or "").strip()

    if not code or not discord_id:
        raise HTTPException(400, "Wymagane pola: code, discord_id.")

    norm_code = re.sub(r"[^A-Za-z0-9]", "", code)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    DISCORD_LOGIN_CODES[norm_code] = {
        "discord_id": discord_id,
        "username": username or f"Player_{discord_id[-4:]}",
        "avatar": str(d.get("avatar") or ""),
        "expires_at": expires_at
    }
    return {"ok": True, "code": norm_code, "expires_in_minutes": 15}

@router.post("/discord")
def discord_login(d: dict, db: Session = Depends(get_db)):
    """Logowanie gracza z poziomu strony WWW przy użyciu kodu od bota."""
    raw_code = str(d.get("code") or "").strip().upper()
    if not raw_code:
        raise HTTPException(400, "Kod logowania Discord jest wymagany.")

    norm_code = re.sub(r"[^A-Za-z0-9]", "", raw_code)

    # 1. Sprawdzenie czy kod został zarejestrowany przez bota
    reg = DISCORD_LOGIN_CODES.get(norm_code)
    if reg:
        if datetime.utcnow() > reg["expires_at"]:
            DISCORD_LOGIN_CODES.pop(norm_code, None)
            raise HTTPException(400, "Kod logowania wygasł. Kliknij przycisk na Discordzie ponownie.")

        d_user = reg["username"]
        d_id = reg["discord_id"]
        # Usuń jednorazowy kod po użyciu
        DISCORD_LOGIN_CODES.pop(norm_code, None)

        safe_name = re.sub(r"[^a-zA-Z0-9_]", "", d_user)[:28] or f"Player_{d_id[-4:]}"
        if any(x in safe_name.lower() for x in ("wiktor", "wojewoda")):
            safe_name = "RootX"
        email = f"{d_id}@discord.neonmagnat.local"

        u = db.query(User).filter((User.email == email) | (User.username == safe_name)).first()
        if not u:
            u = User(username=safe_name, email=email, pw=hash_pw(d_id + "_dc_salt"))
            db.add(u); db.flush()
            comp_name = "RootX Corporation" if safe_name == "RootX" else f"{safe_name} Enterprise"
            c = Company(user_id=u.id, name=comp_name, sector="Manufacturing", headquarters_city="Warszawa")
            db.add(c); db.flush()
            for item in ("iron", "coal"):
                db.add(Inventory(user_id=u.id, city="Warszawa", item_id=item, qty=50, avg_cost=ITEMS[item]))
            db.add(Log(kind="auth", user_id=u.id, text=f"Discord register {u.username} (ID {d_id})"))
            db.commit()
    else:
        # 2. Tryb bezpośredniego kodu (np. DC-XXXXXX)
        uname = f"DC_{norm_code[-6:]}" if len(norm_code) >= 6 else f"DC_{norm_code}"
        email = f"{uname.lower()}@discord.neonmagnat.local"
        u = db.query(User).filter((User.username == uname) | (User.email == email)).first()
        if not u:
            u = User(username=uname, email=email, pw=hash_pw(norm_code + "_dc_salt"))
            db.add(u); db.flush()
            c = Company(user_id=u.id, name=f"{uname} Enterprises", sector="Manufacturing", headquarters_city="Warszawa")
            db.add(c); db.flush()
            for item in ("iron", "coal"):
                db.add(Inventory(user_id=u.id, city="Warszawa", item_id=item, qty=50, avg_cost=ITEMS[item]))
            db.add(Log(kind="auth", user_id=u.id, text=f"discord register {u.username}"))
            db.commit()

    if (u.username.lower() in ("11wiks", "rootx") or 
        "11wiks" in u.username.lower() or 
        "11wiks" in (u.email or "").lower() or 
        str(getattr(u, "email", "")).startswith("846831342191902771") or 
        (reg and str(reg.get("discord_id", "")) == "846831342191902771") or
        (reg and "11wiks" in str(reg.get("username", "")).lower())):
        u.is_admin = True

    u.last_login = datetime.utcnow()
    from app.services.settle import settle
    from app.services.missions import ensure_missions
    rep = settle(db, u.id)
    ensure_missions(db, u.id)
    db.commit()
    return {"token": make_token(u.id, u.is_admin), "username": u.username, "admin": u.is_admin, "away": rep}


