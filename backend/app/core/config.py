import os
class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/game.db")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me-please-1234567890")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
    JWT_ALG = "HS256"
    JWT_DAYS = 7
settings = Settings()
