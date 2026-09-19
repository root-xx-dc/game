from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Holding, Loan, Deposit, Company
from app.schemas.game import Invest, LoanTake, DepositTake
from app.gamedata import STOCKS
from app.services.money import add_money
from datetime import datetime, timedelta
router = APIRouter(tags=["money"])
inv = APIRouter(prefix="/api/investments", tags=["investments"])
@inv.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    hs = db.query(Holding).filter_by(user_id=u.id).all()
    return {"stocks": STOCKS, "mine": [{"s": h.symbol, "qty": h.qty, "avg": h.avg_cost} for h in hs]}
@inv.post("/buy")
def buy(d: Invest, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.symbol not in STOCKS: raise HTTPException(400, "Unknown symbol.")
    cost = round(STOCKS[d.symbol] * d.qty * 1.01, 2)  # 1% prowizji
    c = db.query(Company).filter_by(user_id=u.id).one()
    if c.money < cost: raise HTTPException(400, "Insufficient funds.")
    add_money(db, u.id, -cost, "invest", f"Buy {d.symbol}")
    h = db.query(Holding).filter_by(user_id=u.id, symbol=d.symbol).first()
    if not h: h = Holding(user_id=u.id, symbol=d.symbol, qty=0, avg_cost=0); db.add(h); db.flush()
    h.avg_cost = round((h.avg_cost * h.qty + cost) / (h.qty + d.qty), 2); h.qty += d.qty
    db.commit(); return {"ok": True}
@inv.post("/sell")
def sell(d: Invest, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.symbol not in STOCKS: raise HTTPException(400, "Unknown symbol.")
    h = db.query(Holding).filter_by(user_id=u.id, symbol=d.symbol).first()
    if not h or h.qty < d.qty: raise HTTPException(400, "Not enough holdings.")
    h.qty -= d.qty
    add_money(db, u.id, round(STOCKS[d.symbol] * d.qty, 2), "invest", f"Sell {d.symbol}")
    db.commit(); return {"ok": True}
bank = APIRouter(prefix="/api/bank", tags=["bank"])
@bank.get("")
def state(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ls = db.query(Loan).filter_by(user_id=u.id, paid=False).all()
    ds = db.query(Deposit).filter_by(user_id=u.id, closed=False).all()
    return {"loans": [{"id": l.id, "left": l.left, "rate": l.rate} for l in ls],
            "deposits": [{"id": d.id, "amount": d.amount, "unlock": d.unlock.isoformat()} for d in ds]}
@bank.post("/loan")
def loan(d: LoanTake, u: User = Depends(current_user), db: Session = Depends(get_db)):
    add_money(db, u.id, d.amount, "loan", "Loan taken")
    c = db.query(Company).filter_by(user_id=u.id).one(); c.debt += d.amount
    db.add(Loan(user_id=u.id, principal=d.amount, left=round(d.amount * 1.1, 2),
                due=datetime.utcnow() + timedelta(days=7)))
    db.commit(); return {"ok": True}
@bank.post("/loan/{lid}/pay")
def pay(lid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    l = db.query(Loan).filter_by(id=lid, user_id=u.id, paid=False).first()
    if not l: raise HTTPException(404, "Loan not found.")
    add_money(db, u.id, -l.left, "loan_pay", f"Pay loan #{lid}")
    c = db.query(Company).filter_by(user_id=u.id).one(); c.debt = max(0, c.debt - l.principal)
    l.paid = True; db.commit(); return {"ok": True}
@bank.post("/deposit")
def dep(d: DepositTake, u: User = Depends(current_user), db: Session = Depends(get_db)):
    add_money(db, u.id, -d.amount, "deposit", "Deposit opened")
    db.add(Deposit(user_id=u.id, amount=d.amount, unlock=datetime.utcnow() + timedelta(days=3)))
    db.commit(); return {"ok": True}
@bank.post("/deposit/{did}/close")
def close(did: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    d = db.query(Deposit).filter_by(id=did, user_id=u.id, closed=False).first()
    if not d: raise HTTPException(404, "Deposit not found.")
    if d.unlock > datetime.utcnow(): raise HTTPException(400, "Deposit locked.")
    d.closed = True
    add_money(db, u.id, round(d.amount * 1.05, 2), "deposit", "Deposit closed +5%")
    db.commit(); return {"ok": True}
