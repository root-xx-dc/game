"""Testy: rejestracja, logowanie, rynek, produkcja, kontrakty, bank, uprawnienia."""
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.core.db import Base, get_db
eng = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
Test = sessionmaker(bind=eng, autoflush=False, autocommit=False)
Base.metadata.create_all(bind=eng)
from app.seed import seed
db0 = Test(); seed(db0); db0.close()
def ovr():
    db = Test()
    try: yield db
    finally: db.close()
app.dependency_overrides[get_db] = ovr
c = TestClient(app)
def auth_flow():
    import uuid
    import app.api.auth as _a
    _a._calls.clear()
    suf = uuid.uuid4().hex[:6]
    r = c.post("/api/auth/register", json={"username": f"jan{suf}", "email": f"jan{suf}@x.pl",
        "password": "secret123", "company": "Jan Corp"})
    assert r.status_code == 200, r.text
    tok = r.json()["token"]
    r = c.post("/api/auth/login", json={"login": f"jan{suf}@x.pl", "password": "secret123"})
    assert r.status_code == 200, r.text
    h = {"Authorization": f"Bearer {tok}"}
    h["user"] = f"jan{suf}"
    return h
def test_register_login():
    h = auth_flow(); assert h["Authorization"].startswith("Bearer ")
def test_market_buy_sell_production_contract_bank():
    h = auth_flow()
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": 10}, headers=h).status_code == 200
    assert c.post("/api/market/sell", json={"item_id": "iron", "qty": 5}, headers=h).status_code == 200
    r = c.post("/api/market/sell", json={"item_id": "iron", "qty": 99999}, headers=h)
    assert r.status_code == 400  # anty-cheat: brak inventory
    assert c.post("/api/buildings/buy", json={"type": "Factory"}, headers=h).status_code in (200, 400)
    # produkcja wymaga surowców - mamy iron; dokup coal i produkuj steel
    c.post("/api/market/buy", json={"item_id": "coal", "qty": 30}, headers=h)
    r = c.post("/api/production/start", json={"recipe": "steel", "qty": 5}, headers=h)
    assert r.status_code in (200, 400)
    r = c.get("/api/contracts", headers=h); assert r.status_code == 200
    cid = r.json()["contracts"][0]["id"]
    assert c.post(f"/api/contracts/{cid}/take", headers=h).status_code == 200
    assert c.post("/api/bank/loan", json={"amount": 1000}, headers=h).status_code == 200
def test_permissions_and_validation():
    assert c.get("/api/company").status_code in (401, 403)
    h = auth_flow()
    assert c.post("/api/buildings/buy", json={"type": "Nope"}, headers=h).status_code == 400
    r = c.post("/api/auth/register", json={"username": "x", "email": "bad", "password": "123456", "company": "C"})
    assert r.status_code in (400, 422)
def test_ws_connect():
    with c.websocket_connect("/ws") as ws:
        ws.send_text("ping")
        ws.close()
def test_upkeep_missions_achievements():
    from app.economy.upkeep import tick_all
    from app.services.missions import ensure_missions, mission_add
    from app.services.achievements import check_achievements
    from app.models.all import Mission
    from tests.test_game import Test as _T
    h = auth_flow()
    me = c.get("/api/users/me", headers=h).json()
    db = _T()
    try:
        ensure_missions(db, me["id"])
        assert db.query(Mission).filter_by(user_id=me["id"]).count() >= 5
        mission_add(db, me["id"], "earn", 5000)
        earn = db.query(Mission).filter_by(user_id=me["id"], metric="earn").first()
        assert earn.progress >= 5000 and earn.done
        tick_all(db)  # upkeep nie wywala się na nowej firmie
        db.commit()
        assert isinstance(check_achievements(db, me["id"]), list)
        db.commit()
    finally:
        db.close()
def test_company_logo():
    h = auth_flow()
    assert c.patch("/api/company", json={"logo": "nope"}, headers=h).status_code == 400
    assert c.patch("/api/company", json={"logo": "trophy"}, headers=h).status_code == 200
    assert c.get("/api/company", headers=h).json()["company"]["logo"] == "trophy"
def test_building_level_gate():
    h = auth_flow()
    r = c.post("/api/buildings/buy", json={"type": "Headquarters"}, headers=h)
    assert r.status_code == 400 and "level 5" in r.text
    r = c.post("/api/buildings/buy", json={"type": "Office"}, headers=h)
    assert r.status_code == 200
def test_money_guards():
    h = auth_flow()
    assert c.post("/api/market/buy", json={"item_id": "unobtainium", "qty": 1}, headers=h).status_code == 400
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": -5}, headers=h).status_code == 422
    assert c.post("/api/market/sell", json={"item_id": "iron", "qty": 99999}, headers=h).status_code == 400
    assert c.post("/api/production/start", json={"recipe": "nope", "qty": 1}, headers=h).status_code == 400
    assert c.post("/api/production/start", json={"recipe": "steel", "qty": 1}, headers=h).status_code == 400
    r = c.post("/api/auth/register", json={"username": h["user"], "email": "dup@x.pl",
        "password": "secret123", "company": "Dup"})
    assert r.status_code == 400
def test_bank_flows():
    from app.models.all import Deposit
    h = auth_flow()
    assert c.post("/api/bank/loan", json={"amount": 2000}, headers=h).status_code == 200
    lid = c.get("/api/bank", headers=h).json()["loans"][0]["id"]
    assert c.post(f"/api/bank/loan/{lid}/pay", headers=h).status_code == 200
    assert c.post("/api/bank/deposit", json={"amount": 1000}, headers=h).status_code == 200
    did = c.get("/api/bank", headers=h).json()["deposits"][0]["id"]
    assert c.post(f"/api/bank/deposit/{did}/close", headers=h).status_code == 400  # lokata
    db = Test()
    try:
        from datetime import datetime, timedelta
        d = db.query(Deposit).filter_by(id=did).one()
        d.unlock = datetime.utcnow() - timedelta(seconds=1); db.commit()
    finally: db.close()
    assert c.post(f"/api/bank/deposit/{did}/close", headers=h).status_code == 200
def test_limit_orders():
    from app.market.engine import match_limit
    h = auth_flow()
    r = c.post("/api/market/orders", json={"item_id": "iron", "side": "BUY", "qty": 5, "price": 99999}, headers=h)
    assert r.status_code == 200
    oid = r.json()["id"]
    db = Test()
    try: n = match_limit(db); db.commit()
    finally: db.close()
    assert n >= 1
    st = [o for o in c.get("/api/market/orders/mine", headers=h).json()["orders"] if o["id"] == oid][0]["status"]
    assert st == "filled"
    r = c.post("/api/market/orders", json={"item_id": "iron", "side": "BUY", "qty": 1, "price": 0.01}, headers=h)
    assert c.post(f"/api/market/orders/{r.json()['id']}/cancel", headers=h).status_code == 200
    assert c.post("/api/market/orders/999999/cancel", headers=h).status_code == 404
def test_p2p_contract():
    a = auth_flow(); b = auth_flow()
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": 30}, headers=a).status_code == 200
    r = c.post("/api/contracts/p2p", json={"title": "Need iron", "item_id": "iron",
        "qty": 10, "reward": 500, "to_user": b["user"]}, headers=a)
    assert r.status_code == 200, r.text
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": 15}, headers=b).status_code == 200
    cid = [x for x in c.get("/api/contracts", headers=b).json()["contracts"] if x["title"] == "Need iron"][0]["id"]
    before = c.get("/api/company", headers=b).json()["company"]["money"]
    assert c.post(f"/api/contracts/{cid}/fulfill", headers=b).status_code == 200
    after = c.get("/api/company", headers=b).json()["company"]["money"]
    assert after > before
def test_admin_ban_flow():
    from app.models.all import User
    a = auth_flow(); v = auth_flow()
    db = Test()
    try:
        u = db.query(User).filter_by(username=a["user"]).one()
        u.is_admin = True; vid = db.query(User).filter_by(username=v["user"]).one().id; db.commit()
    finally: db.close()
    admin_tok = c.post("/api/auth/login", json={"login": a["user"], "password": "secret123"}).json()["token"]
    ah = {"Authorization": f"Bearer {admin_tok}"}
    assert c.post(f"/api/admin/ban/{vid}", headers=ah).json()["banned"] is True
    assert c.post("/api/auth/login", json={"login": v["user"], "password": "secret123"}).status_code == 403
    assert c.post(f"/api/admin/ban/{vid}", headers=ah).json()["banned"] is False
    assert c.post("/api/auth/login", json={"login": v["user"], "password": "secret123"}).status_code == 200
def test_upkeep_debt_path():
    from app.economy.upkeep import tick_all
    from app.models.all import Company, User, Building
    h = auth_flow()
    db = Test()
    try:
        uid = db.query(User).filter_by(username=h["user"]).one().id
        db.query(Company).filter_by(user_id=uid).update({"money": 0})
        db.add(Building(user_id=uid, type="Factory")); db.commit()
        tick_all(db); db.commit()
        co = db.query(Company).filter_by(user_id=uid).one()
        assert co.debt > 0 and co.money == 0.0
    finally: db.close()
def test_p2p_decline_refund():
    a = auth_flow(); b = auth_flow()
    before = c.get("/api/company", headers=a).json()["company"]["money"]
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": 30}, headers=a).status_code == 200
    r = c.post("/api/contracts/p2p", json={"title": "Do odrzucenia", "item_id": "iron",
        "qty": 10, "reward": 500, "to_user": b["user"]}, headers=a)
    assert r.status_code == 200, r.text
    cid = [x for x in c.get("/api/contracts", headers=b).json()["contracts"] if x["title"] == "Do odrzucenia"][0]["id"]
    assert c.post(f"/api/contracts/{cid}/decline", headers=b).status_code == 200
    after = c.get("/api/company", headers=a).json()["company"]["money"]
    items = c.get("/api/market", headers=a).json()["items"]
    iron_cost = next(i["price"] for i in items if i["id"] == "iron") * 30
    assert abs(after - (before - iron_cost)) < 1.0
def test_court_sue():
    from datetime import datetime, timedelta
    from app.models.all import Contract
    from tests.test_game import Test as _T
    a = auth_flow(); b = auth_flow()
    assert c.post("/api/market/buy", json={"item_id": "iron", "qty": 30}, headers=a).status_code == 200
    assert c.post("/api/contracts/p2p", json={"title": "Do sądu", "item_id": "iron",
        "qty": 10, "reward": 500, "to_user": b["user"]}, headers=a).status_code == 200
    cid = [x for x in c.get("/api/contracts", headers=b).json()["contracts"] if x["title"] == "Do sądu"][0]["id"]
    db = _T()
    try:
        db.query(Contract).filter_by(id=cid).update({"deadline": datetime.utcnow() - timedelta(seconds=1)})
        db.commit()
    finally: db.close()
    c.get("/api/company", headers=b)  # settle -> failed
    st = [x for x in c.get("/api/contracts", headers=a).json()["contracts"] if x["id"] == cid][0]["status"]
    assert st == "failed", st
    r = c.post(f"/api/contracts/{cid}/sue", headers=a)
    assert r.status_code == 200, r.text
    assert r.json()["verdict"] == "guilty" and r.json()["awarded"] == 500
    assert c.post(f"/api/contracts/{cid}/sue", headers=a).status_code == 404  # raz wystarczy
    assert c.post(f"/api/contracts/{cid}/sue", headers=b).status_code == 404  # pozwany nie pozywa
def test_chat_global_and_validation():
    h = auth_flow()
    assert c.get("/api/chat/global").status_code == 401
    assert c.post("/api/chat/global", json={"text": "x"}).status_code in (401, 403)
    assert c.get("/api/chat/global", headers=h).status_code == 200
    assert c.post("/api/chat/global", json={"text": "Czesc wszystkim!"}, headers=h).status_code == 200
    msgs = c.get("/api/chat/global", headers=h).json()["messages"]
    assert any(m["text"] == "Czesc wszystkim!" for m in msgs)
    assert c.post("/api/chat/global", json={"text": ""}, headers=h).status_code == 422
    assert c.post("/api/chat/global", json={"text": "x" * 501}, headers=h).status_code == 422
def test_chat_dm_isolation():
    a = auth_flow(); b = auth_flow(); e = auth_flow()
    from app.api import chat as _ch
    _ch._last.clear()
    assert c.post("/api/chat/dm/" + b["user"], json={"text": "Hej B!"}, headers=a).status_code == 200
    got = c.get("/api/chat/dm/" + a["user"], headers=b).json()["messages"]
    assert any(m["text"] == "Hej B!" for m in got)
    _ch._last.clear()
    assert c.post("/api/chat/dm/" + a["user"], json={"text": "nie dla E"}, headers=b).status_code == 200
    other = c.get("/api/chat/dm/" + b["user"], headers=e).json()["messages"]
    assert not any(m["text"] == "nie dla E" for m in other)
    assert c.post("/api/chat/dm/" + a["user"], json={"text": "samo"}, headers=a).status_code == 404
    assert c.post("/api/chat/dm/nieistnieje123", json={"text": "x"}, headers=a).status_code == 404
def test_chat_groups_and_spam():
    from app.api import chat as _ch
    a = auth_flow(); b = auth_flow()
    gid = c.post("/api/chat/groups", json={"name": "Ekipa"}, headers=a).json()["id"]
    assert c.get(f"/api/chat/groups/{gid}", headers=b).status_code == 403
    assert c.post(f"/api/chat/groups/{gid}/join", headers=b).status_code == 200
    _ch._last.clear()
    assert c.post(f"/api/chat/groups/{gid}", json={"text": "Siema ekipa"}, headers=b).status_code == 200
    assert c.post(f"/api/chat/groups/{gid}", json={"text": "za szybko"}, headers=b).status_code == 429
    got = c.get(f"/api/chat/groups/{gid}", headers=a).json()["messages"]
    assert any(m["text"] == "Siema ekipa" for m in got)
