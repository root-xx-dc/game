"""FastAPI entry: REST + WebSocket + sim loop + seed."""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.db import engine, Base, SessionLocal, get_db
from app.models import all as _models  # noqa - rejestracja tabel
from app.seed import seed
from app.websocket.manager import manager
from app.api import auth, company, buildings, production, market, contracts, logistics, money, people, world, admin, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try: seed(db)
    finally: db.close()
    task = asyncio.create_task(sim_loop())
    yield
    task.cancel()

async def sim_loop():
    from app.economy.sim import tick
    from app.economy.upkeep import tick_all
    from app.market.engine import match_limit
    from app.ai.companies import ai_tick
    n = 0
    while True:
        try:
            await asyncio.sleep(60)
            db = SessionLocal()
            try:
                r = tick(db); tick_all(db); match_limit(db); ai_tick(db, r["tick"]); db.commit()
                n = r["tick"]
                await manager.broadcast({"type": "tick", "tick": n})
                items = {}
                from app.models.all import MarketItem
                for mi in db.query(MarketItem).all(): items[mi.item_id] = mi.price
                await manager.broadcast({"type": "prices", "items": items})
            finally: db.close()
        except asyncio.CancelledError: break
        except Exception: pass

app = FastAPI(title="Neon Magnat API", lifespan=lifespan)
if settings.ENVIRONMENT == "development":
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False,
                       allow_methods=["*"], allow_headers=["*"])
else:
    app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.exception_handler(ValueError)
async def vh(_: Request, e: ValueError): return JSONResponse(400, {"detail": str(e)})
@app.get("/api")
def api_root(): return {"name": "Neon Magnat API", "docs": "/docs"}
@app.get("/api/health")
def health(): return {"ok": True}

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(buildings.router)
app.include_router(production.router)
app.include_router(market.router)
app.include_router(contracts.router)
app.include_router(logistics.router)
app.include_router(money.inv); app.include_router(money.bank)
app.include_router(people.emp); app.include_router(people.res)
app.include_router(people.prop)
app.include_router(world.m); app.include_router(world.n)
app.include_router(world.r); app.include_router(world.a)
app.include_router(world.sec)
app.include_router(admin.router)
app.include_router(chat.router)

@app.websocket("/ws")
async def ws(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True: await ws.receive_text()
    except Exception: manager.drop(ws)

# ---- Gra online: ten sam serwer serwuje stronę (index.html) pod / ----
FRONT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.isdir(FRONT):
    for sub in ("css", "js", "assets"):
        p = os.path.join(FRONT, sub)
        if os.path.isdir(p):
            app.mount(f"/{sub}", StaticFiles(directory=p), name=f"front-{sub}")
    @app.get("/", include_in_schema=False)
    def root_page():
        return FileResponse(os.path.join(FRONT, "index.html"))
    @app.get("/index.html", include_in_schema=False)
    def root_page2():
        return FileResponse(os.path.join(FRONT, "index.html"))
    @app.get("/privacy.html", include_in_schema=False)
    @app.get("/privacy", include_in_schema=False)
    def privacy_page():
        return FileResponse(os.path.join(FRONT, "privacy.html"))
    @app.get("/404.html", include_in_schema=False)
    def page_404():
        return FileResponse(os.path.join(FRONT, "404.html"), status_code=404)
    @app.get("/favicon.ico", include_in_schema=False)
    def favicon():
        ico = os.path.join(FRONT, "favicon.ico")
        if os.path.isfile(ico):
            return FileResponse(ico)
        return FileResponse(os.path.join(FRONT, "assets", "logo.svg"))

from starlette.exceptions import HTTPException as StarletteHTTPException
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        if request.url.path.startswith("/api/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        p404 = os.path.join(FRONT, "404.html")
        if os.path.isfile(p404):
            return FileResponse(p404, status_code=404)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

