from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://admin:password123@localhost:5432/customer_db"
    SYNC_DATABASE_URL: str = "postgresql://admin:password123@localhost:5432/customer_db"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Admin Credentials
    ADMIN_USERNAME: str = "Dhruv"
    ADMIN_PASSWORD: str = "Dhruv@2222.MD"
    
    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Uploads
    UPLOAD_DIR: str = "/uploads"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
