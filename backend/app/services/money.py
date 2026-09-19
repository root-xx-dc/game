"""Wspólne operacje pieniężne - JEDYNE miejsce zmiany salda (anty-cheat)."""
from sqlalchemy.orm import Session
from app.models.all import Company, Transaction, Statistic
from datetime import date
def add_money(db: Session, user_id: int, amount: float, type_: str, desc: str = ""):
    c = db.query(Company).filter_by(user_id=user_id).one()
    c.money = round(c.money + amount, 2)
    if c.money < -0.01:
        raise ValueError("Insufficient funds.")
    db.add(Transaction(user_id=user_id, type=type_, amount=round(amount, 2),
                       balance_after=c.money, description=desc[:200]))
    if amount > 0:
        c.revenue = round(c.revenue + amount, 2)
    else:
        c.expenses = round(c.expenses - amount, 2)
    c.value = round(c.money + c.assets - c.debt, 2)
    gain = int(abs(amount) // 100)
    if gain:
        c.xp += gain
        while c.xp >= c.level * 1000:
            c.xp -= c.level * 1000
            c.level += 1
    d = date.today().isoformat()
    st = db.query(Statistic).filter_by(user_id=user_id, day=d).first()
    if not st:
        st = Statistic(user_id=user_id, day=d, revenue=0, profit=0, value=0)
        db.add(st)
    if amount > 0:
        st.revenue += amount
    st.profit = (st.profit or 0) + amount
    st.value = c.value
    db.flush()
    if amount > 0 and type_ in ("market_sell", "contract", "invest", "mission", "property"):
        from app.services.missions import mission_add
        if type_ != "mission":
            mission_add(db, user_id, "earn", amount)
    return c.money
