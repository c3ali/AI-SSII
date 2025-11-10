"""
Configuration centralisée pour l'application SSII IA Platform.
Utilise pydantic-settings pour la validation et le chargement des variables d'environnement.
"""
from typing import List
from pydantic import Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration principale de l'application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    app_name: str = Field(default="SSII-IA-Platform", description="Nom de l'application")
    app_version: str = Field(default="1.0.0", description="Version de l'application")
    environment: str = Field(default="development", description="Environnement (development, staging, production)")
    debug: bool = Field(default=True, description="Mode debug")
    api_host: str = Field(default="0.0.0.0", description="Host de l'API")
    api_port: int = Field(default=8000, description="Port de l'API")

    # CORS
    cors_origins: str = Field(default="http://localhost:3000", description="Origines CORS autorisées")

    @property
    def cors_origins_list(self) -> List[str]:
        """Convertit la chaîne CORS en liste."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    # OpenAI
    openai_api_key: str = Field(default="", description="Clé API OpenAI")
    openai_model: str = Field(default="gpt-4-turbo-preview", description="Modèle OpenAI à utiliser")
    openai_temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Température pour la génération")
    openai_max_tokens: int = Field(default=4000, gt=0, description="Nombre maximum de tokens")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/ssii_ia_platform",
        description="URL de connexion à la base de données"
    )
    database_pool_size: int = Field(default=10, gt=0, description="Taille du pool de connexions")
    database_max_overflow: int = Field(default=20, gt=0, description="Nombre max de connexions supplémentaires")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", description="URL de connexion Redis")
    redis_max_connections: int = Field(default=10, gt=0, description="Nombre max de connexions Redis")

    # Security
    secret_key: str = Field(default="change-me-in-production-min-32-chars", min_length=32, description="Clé secrète pour JWT")
    algorithm: str = Field(default="HS256", description="Algorithme de chiffrement JWT")
    access_token_expire_minutes: int = Field(default=30, gt=0, description="Durée de validité du token (minutes)")

    # Logging
    log_level: str = Field(default="INFO", description="Niveau de log")
    log_format: str = Field(default="json", description="Format des logs (json ou text)")

    # Agent Configuration
    agent_timeout: int = Field(default=300, gt=0, description="Timeout pour l'exécution d'un agent (secondes)")
    max_retries: int = Field(default=3, ge=0, description="Nombre maximum de tentatives")
    retry_delay: int = Field(default=2, gt=0, description="Délai entre les tentatives (secondes)")

    # Workflow
    checkpoint_enabled: bool = Field(default=True, description="Activer les checkpoints du workflow")
    human_review_required: bool = Field(default=True, description="Requiert une validation humaine")

    @validator("environment")
    def validate_environment(cls, v):
        """Valide que l'environnement est valide."""
        allowed = ["development", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"Environment must be one of {allowed}")
        return v

    @validator("log_level")
    def validate_log_level(cls, v):
        """Valide que le niveau de log est valide."""
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v = v.upper()
        if v not in allowed:
            raise ValueError(f"Log level must be one of {allowed}")
        return v

    @property
    def is_production(self) -> bool:
        """Vérifie si l'environnement est en production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Vérifie si l'environnement est en développement."""
        return self.environment == "development"


# Instance globale des settings
settings = Settings()


# Configuration de logging structuré
def configure_logging():
    """Configure le logging structuré avec structlog."""
    import structlog
    import logging
    import sys

    # Configuration du niveau de log
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )

    # Processors pour structlog
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.log_format == "json":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper())
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


# Logger global
def get_logger(name: str = None):
    """Obtient un logger structlog."""
    import structlog
    return structlog.get_logger(name or __name__)
