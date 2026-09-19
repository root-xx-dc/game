"""Czat: globalny, prywatny 1:1, grupowy. Pokoje: global | dm:<a>:<b> | g:<id>."""
import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, ChatMessage, ChatGroup, ChatMember
from app.websocket.manager import manager
router = APIRouter(prefix="/api/chat", tags=["chat"])
_last: dict[int, float] = {}
def spam(uid: int):
    t = time.time()
    if t - _last.get(uid, 0) < 2: raise HTTPException(429, "Piszesz za szybko. Poczekaj chwilę.")
    _last[uid] = t
class Msg(BaseModel):
    text: str = Field(min_length=1, max_length=500)
class GroupNew(BaseModel):
    name: str = Field(min_length=3, max_length=40)
def dm_room(a: int, b: int) -> str:
    x, y = sorted((a, b))
    return f"dm:{x}:{y}"
def can_read(db: Session, u: User, room: str) -> bool:
    if room == "global": return True
    if room.startswith("dm:"):
        try: a, b = room.split(":")[1:3]; return str(u.id) in (a, b)
        except Exception: return False
    if room.startswith("g:"):
        try: gid = int(room[2:])
        except ValueError: return False
        return db.query(ChatMember).filter_by(group_id=gid, user_id=u.id).first() is not None
    return False
def out(db: Session, room: str, limit: int = 50):
    names = {x.id: x.username for x in db.query(User).all()}
    rows = db.query(ChatMessage).filter_by(room=room).order_by(ChatMessage.id.desc()).limit(limit).all()
    return {"room": room, "messages": [{
        "id": m.id, "from": names.get(m.sender_id, "?"), "text": m.text,
        "at": m.created_at.isoformat()} for m in rows][::-1]}
@router.get("/global")
def g_get(u: User = Depends(current_user), db: Session = Depends(get_db)):
    return out(db, "global")
@router.post("/global")
async def g_post(d: Msg, u: User = Depends(current_user), db: Session = Depends(get_db)):
    spam(u.id)
    t = d.text.strip()
    if not t: raise HTTPException(400, "Pusta wiadomość.")
    db.add(ChatMessage(room="global", sender_id=u.id, text=t)); db.commit()
    await manager.broadcast({"type": "chat", "room": "global", "from": u.username, "text": t})
    return {"ok": True}
@router.get("/dm/{username}")
def dm_get(username: str, u: User = Depends(current_user), db: Session = Depends(get_db)):
    to = db.query(User).filter_by(username=username).first()
    if not to or to.id == u.id: raise HTTPException(404, "Gracz nie istnieje.")
    return out(db, dm_room(u.id, to.id))
@router.post("/dm/{username}")
async def dm_post(username: str, d: Msg, u: User = Depends(current_user), db: Session = Depends(get_db)):
    to = db.query(User).filter_by(username=username).first()
    if not to or to.id == u.id or to.banned: raise HTTPException(404, "Gracz nie istnieje.")
    spam(u.id)
    t = d.text.strip()
    if not t: raise HTTPException(400, "Pusta wiadomość.")
    room = dm_room(u.id, to.id)
    db.add(ChatMessage(room=room, sender_id=u.id, text=t)); db.commit()
    await manager.broadcast({"type": "chat", "room": room, "from": u.username, "text": t})
    return {"ok": True}
@router.get("/groups")
def groups(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ms = db.query(ChatMember).filter_by(user_id=u.id).all()
    gs = db.query(ChatGroup).filter(ChatGroup.id.in_([m.group_id for m in ms])).all() if ms else []
    allg = db.query(ChatGroup).order_by(ChatGroup.id.desc()).limit(30).all()
    return {"mine": [{"id": g.id, "name": g.name} for g in gs],
            "public": [{"id": g.id, "name": g.name} for g in allg]}
@router.post("/groups")
def group_new(d: GroupNew, u: User = Depends(current_user), db: Session = Depends(get_db)):
    g = ChatGroup(name=d.name.strip(), owner_id=u.id)
    db.add(g); db.flush()
    db.add(ChatMember(group_id=g.id, user_id=u.id)); db.commit()
    return {"id": g.id, "name": g.name}
@router.post("/groups/{gid}/join")
def group_join(gid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    g = db.get(ChatGroup, gid)
    if not g: raise HTTPException(404, "Grupa nie istnieje.")
    if not db.query(ChatMember).filter_by(group_id=gid, user_id=u.id).first():
        db.add(ChatMember(group_id=gid, user_id=u.id)); db.commit()
    return {"ok": True, "room": f"g:{gid}"}
@router.get("/groups/{gid}")
def group_msgs(gid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    room = f"g:{gid}"
    if not can_read(db, u, room): raise HTTPException(403, "Najpierw dołącz do grupy.")
    return out(db, room)
@router.post("/groups/{gid}")
async def group_post(gid: int, d: Msg, u: User = Depends(current_user), db: Session = Depends(get_db)):
    room = f"g:{gid}"
    if not can_read(db, u, room): raise HTTPException(403, "Najpierw dołącz do grupy.")
    spam(u.id)
    t = d.text.strip()
    if not t: raise HTTPException(400, "Pusta wiadomość.")
    db.add(ChatMessage(room=room, sender_id=u.id, text=t)); db.commit()
    await manager.broadcast({"type": "chat", "room": room, "from": u.username, "text": t})
    return {"ok": True}
