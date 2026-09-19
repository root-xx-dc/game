from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.deps import current_user
from app.models.all import User, Holding, Loan, Deposit, Company
from app.schemas.game import Invest, LoanTake, DepositTake
from app.gamedata import STOCKS, STOCK_INFO
from app.services.money import add_money
from datetime import datetime, timedelta

router = APIRouter(tags=["money"])
inv = APIRouter(prefix="/api/investments", tags=["investments"])

@inv.get("")
def lst(u: User = Depends(current_user), db: Session = Depends(get_db)):
    hs = db.query(Holding).filter_by(user_id=u.id).all()
    # Payout RootX & other dividends if holding shares
    dividend_paid = 0.0
    comp = db.query(Company).filter_by(user_id=u.id).first()

    mine_data = []
    for h in hs:
        cur_price = STOCKS.get(h.symbol, 100.0)
        info = STOCK_INFO.get(h.symbol, {})
        val = round(cur_price * h.qty, 2)
        profit = round((cur_price - h.avg_cost) * h.qty, 2)
        profit_pct = round(((cur_price - h.avg_cost) / (h.avg_cost or 1)) * 100, 1) if h.avg_cost else 0
        mine_data.append({
            "s": h.symbol,
            "name": info.get("name", h.symbol),
            "qty": h.qty,
            "avg": h.avg_cost,
            "current_price": cur_price,
            "value": val,
            "profit": profit,
            "profit_pct": profit_pct,
            "dividend_rate": info.get("dividend_rate", 0.03)
        })

    return {
        "stocks": STOCKS,
        "stock_info": STOCK_INFO,
        "rootx_spotlight": {
            "symbol": "ROOTX",
            "name": STOCK_INFO["ROOTX"]["name"],
            "price": STOCKS["ROOTX"],
            "dividend_rate": STOCK_INFO["ROOTX"]["dividend_rate"],
            "desc_pl": STOCK_INFO["ROOTX"]["desc_pl"],
            "desc_en": STOCK_INFO["ROOTX"]["desc_en"],
            "history": [210.0, 218.0, 225.0, 232.0, 240.0, 248.0, 250.0]
        },
        "mine": mine_data
    }

@inv.post("/buy")
def buy(d: Invest, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.symbol not in STOCKS:
        raise HTTPException(400, "Nieznany symbol spółki.")
    if d.qty <= 0:
        raise HTTPException(400, "Ilość musi być dodatnia.")
    cost = round(STOCKS[d.symbol] * d.qty * 1.01, 2)  # 1% prowizji maklerskiej
    c = db.query(Company).filter_by(user_id=u.id).one()
    if c.money < cost:
        raise HTTPException(400, "Niewystarczające środki na rachunku firmy.")
    add_money(db, u.id, -cost, "invest", f"Zakup {d.qty:g} akcji {d.symbol}")
    h = db.query(Holding).filter_by(user_id=u.id, symbol=d.symbol).first()
    if not h:
        h = Holding(user_id=u.id, symbol=d.symbol, qty=0, avg_cost=0)
        db.add(h)
        db.flush()
    h.avg_cost = round((h.avg_cost * h.qty + cost) / (h.qty + d.qty), 2)
    h.qty += d.qty

    # Osiągnięcie dla akcjonariusza RootX
    if d.symbol == "ROOTX" and h.qty >= 100:
        from app.services.missions import mission_add
        mission_add(db, u.id, "rootx", h.qty)

    db.commit()
    return {"ok": True, "symbol": d.symbol, "qty": h.qty, "avg_cost": h.avg_cost}

@inv.post("/sell")
def sell(d: Invest, u: User = Depends(current_user), db: Session = Depends(get_db)):
    if d.symbol not in STOCKS:
        raise HTTPException(400, "Nieznany symbol spółki.")
    if d.qty <= 0:
        raise HTTPException(400, "Ilość musi być dodatnia.")
    h = db.query(Holding).filter_by(user_id=u.id, symbol=d.symbol).first()
    if not h or h.qty < d.qty:
        raise HTTPException(400, "Brak wystarczającej liczby akcji.")
    h.qty -= d.qty
    revenue = round(STOCKS[d.symbol] * d.qty * 0.99, 2) # 1% prowizji
    add_money(db, u.id, revenue, "invest", f"Sprzedaż {d.qty:g} akcji {d.symbol}")
    db.commit()
    return {"ok": True, "symbol": d.symbol, "left": h.qty}

bank = APIRouter(prefix="/api/bank", tags=["bank"])

@bank.get("")
def state(u: User = Depends(current_user), db: Session = Depends(get_db)):
    ls = db.query(Loan).filter_by(user_id=u.id, paid=False).all()
    ds = db.query(Deposit).filter_by(user_id=u.id, closed=False).all()
    return {
        "loans": [{"id": l.id, "principal": l.principal, "left": l.left, "rate": l.rate, "due": l.due.isoformat()} for l in ls],
        "deposits": [{"id": d.id, "amount": d.amount, "rate": d.rate, "unlock": d.unlock.isoformat()} for d in ds]
    }

@bank.post("/loan")
def loan(d: LoanTake, u: User = Depends(current_user), db: Session = Depends(get_db)):
    add_money(db, u.id, d.amount, "loan", f"Kredyt bankowy: +{d.amount:g} $")
    c = db.query(Company).filter_by(user_id=u.id).one()
    c.debt += d.amount
    db.add(Loan(user_id=u.id, principal=d.amount, left=round(d.amount * 1.10, 2),
                rate=0.10, due=datetime.utcnow() + timedelta(days=7)))
    db.commit()
    return {"ok": True}

@bank.post("/loan/{lid}/pay")
def pay(lid: int, u: User = Depends(current_user), db: Session = Depends(get_db)):
    l = db.query(Loan).filter_by(id=lid, user_id=u.id, paid=False).first()
    if not l: raise HTTPException(404, "Kredyt nie został znaleziony.")
    c = db.query(Company).filter_by(user_id=u.id).one()
    if c.money < l.left:
        raise HTTPException(400, f"Za mało środków na spłatę kredytu ({l.left} $).")
    add_money(db, u.id, -l.left, "loan_pay", f"Spłata kredytu #{lid}")
    c.debt = max(0.0, c.debt - l.principal)
    l.paid = True
    db.commit()
    return {"ok": True}

@bank.post("/deposit")
def dep(d: DepositTake, u: User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.query(Company).filter_by(user_id=u.id).one()
    if c.money < d.amount:
        raise HTTPException(400, "Niewystarczające środki na otwarcie lokaty.")
    add_money(db, u.id, -d.amount, "deposit", f"Lokata bankowa: -{d.amount:g} $")
    db.add(Deposit(user_id=u.id, amount=d.amount, rate=0.04, unlock=datetime.utcnow() + timedelta(days=3)))
    db.commit()
    return {"ok": True}
