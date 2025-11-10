from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SSII IA Platform"
    ENVIRONMENT: str = os.getenv("NODE_ENV", "development")
    API_PORT: int = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://ssii_user:ssii_pass_2024@localhost:5432/ssii_ia_platform")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION: int = 7 * 24 * 60 * 60  # 7 days in seconds
    BCRYPT_ROUNDS: int = int(os.getenv("BCRYPT_ROUNDS", "10"))

    # CORS
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
    ALLOWED_HOSTS: List[str] = ["*"]

    # Rate Limiting
    RATE_LIMIT_MAX: int = int(os.getenv("RATE_LIMIT_MAX", "100"))
    RATE_LIMIT_WINDOW_MS: int = int(os.getenv("RATE_LIMIT_WINDOW_MS", "60000"))

    # AI Agents
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "4000"))
    AGENT_TIMEOUT: int = int(os.getenv("AGENT_TIMEOUT", "300"))
    MAX_CONCURRENT_AGENTS: int = int(os.getenv("MAX_CONCURRENT_AGENTS", "3"))

    # Feature Flags
    ENABLE_ANALYTICS: bool = os.getenv("ENABLE_ANALYTICS", "true").lower() == "true"
    ENABLE_AI_AGENTS: bool = os.getenv("ENABLE_AI_AGENTS", "true").lower() == "true"

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
