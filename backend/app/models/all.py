"""Wszystkie modele SQLAlchemy (tabele z rozdz. 41)."""
from datetime import datetime, timezone
from sqlalchemy import (String, Integer, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db import Base
def now(): return datetime.now(timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    pw: Mapped[str] = mapped_column(String(200))
    is_admin: Mapped[bool] = mapped_column(default=False)
    banned: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    last_login: Mapped[datetime] = mapped_column(DateTime, default=now)

class Company(Base):
    __tablename__ = "companies"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(60))
    logo: Mapped[str] = mapped_column(String(10), default="factory")
    sector: Mapped[str] = mapped_column(String(30), default="Manufacturing")
    headquarters_city: Mapped[str] = mapped_column(String(30), default="Warszawa")
    specialization_tier: Mapped[int] = mapped_column(default=1)
    level: Mapped[int] = mapped_column(default=1)
    xp: Mapped[int] = mapped_column(default=0)
    reputation: Mapped[int] = mapped_column(default=50)
    money: Mapped[float] = mapped_column(default=10000.0)
    assets: Mapped[float] = mapped_column(default=0.0)
    debt: Mapped[float] = mapped_column(default=0.0)
    revenue: Mapped[float] = mapped_column(default=0.0)
    expenses: Mapped[float] = mapped_column(default=0.0)
    value: Mapped[float] = mapped_column(default=10000.0)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=now)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    city: Mapped[str] = mapped_column(String(30), index=True)
    capacity: Mapped[float] = mapped_column(default=5000.0)
    level: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)
    __table_args__ = (UniqueConstraint("user_id", "city"),)

class Building(Base):
    __tablename__ = "buildings"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String(30), index=True)
    city: Mapped[str] = mapped_column(String(30), default="Warszawa")
    level: Mapped[int] = mapped_column(default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(30))
    skill: Mapped[int] = mapped_column(default=1)
    salary: Mapped[float] = mapped_column(default=100.0)
    morale: Mapped[int] = mapped_column(default=70)

class Inventory(Base):
    __tablename__ = "inventory"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    city: Mapped[str] = mapped_column(String(30), default="Warszawa", index=True)
    item_id: Mapped[str] = mapped_column(String(30), index=True)
    qty: Mapped[float] = mapped_column(default=0.0)
    avg_cost: Mapped[float] = mapped_column(default=0.0)
    __table_args__ = (UniqueConstraint("user_id", "city", "item_id"),)

class MarketItem(Base):
    __tablename__ = "market_items"
    item_id: Mapped[str] = mapped_column(String(30), primary_key=True)
    price: Mapped[float] = mapped_column(default=10.0)
    supply: Mapped[float] = mapped_column(default=1000.0)
    demand: Mapped[float] = mapped_column(default=1000.0)

class MarketOrder(Base):
    __tablename__ = "market_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_id: Mapped[str] = mapped_column(String(30), index=True)
    side: Mapped[str] = mapped_column(String(4))  # BUY/SELL
    qty: Mapped[float] = mapped_column(default=0)
    price: Mapped[float] = mapped_column(default=0)
    filled: Mapped[float] = mapped_column(default=0)
    status: Mapped[str] = mapped_column(String(10), default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class MarketHistory(Base):
    __tablename__ = "market_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[str] = mapped_column(String(30), index=True)
    price: Mapped[float] = mapped_column(default=0)
    at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    type: Mapped[str] = mapped_column(String(30), index=True)
    amount: Mapped[float] = mapped_column(default=0)
    balance_after: Mapped[float] = mapped_column(default=0)
    description: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)

class Production(Base):
    __tablename__ = "production"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    recipe: Mapped[str] = mapped_column(String(30))
    qty: Mapped[float] = mapped_column(default=0)
    start: Mapped[datetime] = mapped_column(DateTime, default=now)
    end: Mapped[datetime] = mapped_column(DateTime, default=now)
    done: Mapped[bool] = mapped_column(default=False)

class Contract(Base):
    __tablename__ = "contracts"
    id: Mapped[int] = mapped_column(primary_key=True)
    giver_id: Mapped[int] = mapped_column(default=0)  # 0 = NPC
    taker_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(80))
    item_id: Mapped[str] = mapped_column(String(30))
    qty: Mapped[float] = mapped_column(default=0)
    reward: Mapped[float] = mapped_column(default=0)
    penalty: Mapped[float] = mapped_column(default=0)
    deadline: Mapped[datetime] = mapped_column(DateTime, default=now)
    status: Mapped[str] = mapped_column(String(12), default="open")

class Shipment(Base):
    __tablename__ = "shipments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    vehicle: Mapped[str] = mapped_column(String(20))
    item_id: Mapped[str] = mapped_column(String(30))
    qty: Mapped[float] = mapped_column(default=0)
    origin: Mapped[str] = mapped_column(String(30))
    dest: Mapped[str] = mapped_column(String(30))
    arrive: Mapped[datetime] = mapped_column(DateTime, default=now)
    cost: Mapped[float] = mapped_column(default=0.0)
    distance_km: Mapped[float] = mapped_column(default=0.0)
    done: Mapped[bool] = mapped_column(default=False)

class Holding(Base):
    __tablename__ = "holdings"  # inwestycje: akcje/obligacje/fundusze
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    symbol: Mapped[str] = mapped_column(String(12))
    qty: Mapped[float] = mapped_column(default=0)
    avg_cost: Mapped[float] = mapped_column(default=0)

class Loan(Base):
    __tablename__ = "loans"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    principal: Mapped[float] = mapped_column(default=0)
    left: Mapped[float] = mapped_column(default=0)
    rate: Mapped[float] = mapped_column(default=0.05)
    due: Mapped[datetime] = mapped_column(DateTime, default=now)
    paid: Mapped[bool] = mapped_column(default=False)

class Deposit(Base):
    __tablename__ = "deposits"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[float] = mapped_column(default=0)
    rate: Mapped[float] = mapped_column(default=0.03)
    unlock: Mapped[datetime] = mapped_column(DateTime, default=now)
    closed: Mapped[bool] = mapped_column(default=False)

class Research(Base):
    __tablename__ = "research"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    branch: Mapped[str] = mapped_column(String(20))
    level: Mapped[int] = mapped_column(default=0)

class Property(Base):
    __tablename__ = "properties"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    kind: Mapped[str] = mapped_column(String(20))
    city: Mapped[str] = mapped_column(String(30))
    value: Mapped[float] = mapped_column(default=0)
    income: Mapped[float] = mapped_column(default=0)

class City(Base):
    __tablename__ = "cities"
    name: Mapped[str] = mapped_column(String(30), primary_key=True)
    population: Mapped[int] = mapped_column(default=100000)
    demand: Mapped[float] = mapped_column(default=1.0)
    wages: Mapped[float] = mapped_column(default=100.0)
    taxes: Mapped[float] = mapped_column(default=0.19)
    land: Mapped[float] = mapped_column(default=5000.0)

class Economy(Base):
    __tablename__ = "economy"
    id: Mapped[int] = mapped_column(primary_key=True)
    inflation: Mapped[float] = mapped_column(default=0.02)
    interest: Mapped[float] = mapped_column(default=0.05)
    unemployment: Mapped[float] = mapped_column(default=0.06)
    gdp: Mapped[float] = mapped_column(default=1.0)
    energy_mult: Mapped[float] = mapped_column(default=1.0)
    demand_mult: Mapped[float] = mapped_column(default=1.0)
    tick: Mapped[int] = mapped_column(default=0)

class EventLog(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    effect: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class News(Base):
    __tablename__ = "news"
    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(String(220))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Achievement(Base):
    __tablename__ = "achievements"
    code: Mapped[str] = mapped_column(String(30), primary_key=True)
    title: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(200), default="")

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    code: Mapped[str] = mapped_column(String(30))
    at: Mapped[datetime] = mapped_column(DateTime, default=now)

class Mission(Base):
    __tablename__ = "missions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    kind: Mapped[str] = mapped_column(String(10))  # daily/weekly
    metric: Mapped[str] = mapped_column(String(12), default="earn")  # earn/sell/produce/contracts/value
    day: Mapped[str] = mapped_column(String(10), default="")  # iso date for daily reset
    text: Mapped[str] = mapped_column(String(120))
    target: Mapped[float] = mapped_column(default=0)
    progress: Mapped[float] = mapped_column(default=0)
    done: Mapped[bool] = mapped_column(default=False)

class Statistic(Base):
    __tablename__ = "statistics"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    day: Mapped[str] = mapped_column(String(10), index=True)
    revenue: Mapped[float] = mapped_column(default=0)
    profit: Mapped[float] = mapped_column(default=0)
    value: Mapped[float] = mapped_column(default=0)

class Log(Base):
    __tablename__ = "logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    kind: Mapped[str] = mapped_column(String(20), index=True)
    user_id: Mapped[int] = mapped_column(default=0)
    text: Mapped[str] = mapped_column(String(250), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    room: Mapped[str] = mapped_column(String(60), index=True)  # global | dm:<a>:<b> | g:<id>
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    text: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=now, index=True)

class ChatGroup(Base):
    __tablename__ = "chat_groups"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

class ChatMember(Base):
    __tablename__ = "chat_members"
    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("chat_groups.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
