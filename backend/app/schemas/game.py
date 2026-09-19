from pydantic import BaseModel, Field
class Register(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=6, max_length=100)
    company: str = Field(min_length=2, max_length=60, default="My Company")
class Login(BaseModel):
    login: str
    password: str
class PasswordChange(BaseModel):
    old: str
    new: str = Field(min_length=6, max_length=100)
class CompanyPatch(BaseModel):
    name: str | None = None
    logo: str | None = None
    sector: str | None = None
class BuyBuilding(BaseModel):
    type: str
class StartProduction(BaseModel):
    recipe: str
    qty: float = Field(gt=0, le=10000)
class MarketTrade(BaseModel):
    item_id: str
    qty: float = Field(gt=0, le=100000)
class LimitOrder(BaseModel):
    item_id: str
    side: str
    qty: float = Field(gt=0, le=100000)
    price: float = Field(gt=0)
class Ship(BaseModel):
    vehicle: str
    item_id: str
    qty: float = Field(gt=0)
    dest: str
class Hire(BaseModel):
    role: str
class Invest(BaseModel):
    symbol: str
    qty: float = Field(gt=0)
class LoanTake(BaseModel):
    amount: float = Field(gt=0, le=1000000)
class DepositTake(BaseModel):
    amount: float = Field(gt=0)
class P2PContract(BaseModel):
    title: str
    item_id: str
    qty: float = Field(gt=0)
    reward: float = Field(gt=0)
    to_user: str
class ResearchUp(BaseModel):
    branch: str
class PropertyBuy(BaseModel):
    kind: str
    city: str
