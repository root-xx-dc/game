import bcrypt, jwt, time
from .config import settings
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
def verify_pw(pw: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), h.encode())
    except Exception:
        return False
def make_token(uid: int, is_admin: bool = False) -> str:
    now = int(time.time())
    return jwt.encode({"sub": str(uid), "admin": is_admin, "iat": now,
        "exp": now + settings.JWT_DAYS * 86400}, settings.SECRET_KEY, algorithm=settings.JWT_ALG)
def decode_token(tok: str):
    return jwt.decode(tok, settings.SECRET_KEY, algorithms=[settings.JWT_ALG])
