from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Contract
from app.schemas.game import P2PContract
from app.services.money import add_money
from app.services.settle import inv_add, settle
router = APIRouter(prefix="/api/contracts", tags=["contracts"])
@router.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    settle(db, u.id)
    if not db.query(Contract).filter_by(status="open").first():
        from app.gamedata import ITEMS
        for i, (item, base) in enumerate(list(ITEMS.items())[:6]):
            db.add(Contract(giver_id=0, title=f"NPC needs {item}", item_id=item,
                qty=20 + i * 10, reward=round(base * (20 + i * 10) * 1.3, 2),
                penalty=200, deadline=datetime.utcnow() + timedelta(days=2)))
        db.commit()
    names = {x.id: x.username for x in db.query(User).all()}
    rows = db.query(Contract).filter(
        (Contract.status == "open") | (Contract.taker_id == u.id) | (Contract.giver_id == u.id)
    ).order_by(Contract.id.desc()).limit(40).all()
    return {"me": u.username, "contracts": [{
        "id": c.id, "title": c.title, "item": c.item_id, "qty": c.qty,
        "reward": c.reward, "penalty": c.penalty, "status": c.status,
        "deadline": c.deadline.isoformat(),
        "giver": names.get(c.giver_id, "NPC") if c.giver_id else "NPC",
        "mine_giver": c.giver_id == u.id, "mine_taker": c.taker_id == u.id} for c in rows]}
@router.post("/{cid}/take")
def take(cid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.query(Contract).filter_by(id=cid, status="open").first()
    if not c: raise HTTPException(400, "Contract expired.")
    c.taker_id = u.id; c.status = "taken"; db.commit(); return {"ok": True}
@router.post("/{cid}/fulfill")
def fulfill(cid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.query(Contract).filter_by(id=cid, taker_id=u.id, status="taken").first()
    if not c: raise HTTPException(404, "Contract not found.")
    try: inv_add(db, u.id, c.item_id, -c.qty)
    except ValueError: raise HTTPException(400, "Not enough inventory.")
    add_money(db, u.id, c.reward, "contract", f"Contract #{c.id}")
    from app.services.missions import mission_add
    mission_add(db, u.id, "contracts", 1)
    c.status = "done"; db.commit(); return {"reward": c.reward}
@router.post("/{cid}/decline")
def decline(cid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.query(Contract).filter_by(id=cid, taker_id=u.id, status="taken").first()
    if not c: raise HTTPException(404, "Contract not found.")
    c.status = "cancelled"
    if c.giver_id:  # zwrot escrow zleceniodawcy
        add_money(db, c.giver_id, c.reward, "contract_refund", f"Refund #{c.id}")
    db.commit(); return {"ok": True}
@router.post("/{cid}/sue")
def sue(cid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    """Sąd: zleceniodawca pozywa za niewywiązanie się z umowy (failed)."""
    from app.models.all import Company, Log
    c = db.query(Contract).filter_by(id=cid, status="failed").first()
    if not c or c.giver_id != u.id or not c.giver_id:
        raise HTTPException(404, "No failed contract to sue for.")
    t = db.query(Company).filter_by(user_id=c.taker_id).first()
    if not t: raise HTTPException(400, "Defendant has no company.")
    damages = round(c.reward, 2)
    paid = round(min(damages, max(0.0, t.money)), 2)
    rest = round(damages - paid, 2)
    if paid > 0:
        add_money(db, c.taker_id, -paid, "court", f"Damages #{c.id}")
        add_money(db, u.id, paid, "court", f"Won damages #{c.id}")
    if rest > 0:  # reszta zamieniana na dług + utrata reputacji
        t.debt = round(t.debt + rest, 2)
        t.money = 0.0
        t.reputation = max(0, t.reputation - 10)
        t.value = round(t.money + t.assets - t.debt, 2)
    c.status = "closed"
    db.add(Log(kind="court", user_id=u.id, text=f"sued #{cid}, won {paid} (claimed {damages})"))
    db.commit()
    return {"ok": True, "verdict": "guilty", "awarded": paid, "claimed": damages}
@router.post("/p2p")
def p2p(d: P2PContract, u: User = Depends(current_user), db: Session = Depends(get_db)):
    from app.models.all import MarketItem
    to = db.query(User).filter_by(username=d.to_user.strip()).first()
    if not to or to.id == u.id or to.banned: raise HTTPException(400, "Recipient not found.")
    if not db.query(MarketItem).filter_by(item_id=d.item_id).first():
        raise HTTPException(400, "Unknown item.")
    if len(d.title.strip()) < 3: raise HTTPException(400, "Title too short.")
    add_money(db, u.id, -d.reward, "contract", f"Escrow for {d.to_user}")
    db.add(Contract(giver_id=u.id, taker_id=to.id, title=d.title, item_id=d.item_id,
        qty=d.qty, reward=d.reward, penalty=0, deadline=datetime.utcnow() + timedelta(days=3), status="taken"))
    db.commit(); return {"ok": True}
