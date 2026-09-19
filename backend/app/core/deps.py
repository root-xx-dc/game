from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .db import get_db
from .security import decode_token
from app.models.all import User
bearer = HTTPBearer(auto_error=False)
def current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if not creds:
        raise HTTPException(401, "Authentication required.")
    try:
        data = decode_token(creds.credentials)
        u = db.get(User, int(data["sub"]))
    except Exception:
        raise HTTPException(401, "Invalid or expired token.")
    if not u or u.banned:
        raise HTTPException(401, "Authentication required.")
    return u
def admin_user(u: User = Depends(current_user)) -> User:
    if not u.is_admin:
        raise HTTPException(403, "Admin only.")
    return u
