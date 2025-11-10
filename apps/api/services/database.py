"""
Service de gestion de la base de données avec SQLAlchemy.
Configuration PostgreSQL avec support async.
"""
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime, JSON, Text, Integer
from datetime import datetime
import uuid

from config import settings, get_logger


logger = get_logger(__name__)


# Base pour les modèles
Base = declarative_base()


# ============================================================================
# MODÈLES SQLAlchemy
# ============================================================================

class Project(Base):
    """Modèle Project pour la base de données."""

    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: f"proj_{uuid.uuid4().hex[:12]}")
    name = Column(String(200), nullable=False, index=True)
    brief = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft", index=True)

    # Workflow
    current_workflow_id = Column(String, nullable=True)
    workflow_status = Column(String(50), nullable=True)

    # Outputs des agents (JSON)
    outputs = Column(JSON, nullable=False, default=dict)

    # Métadonnées
    tags = Column(JSON, nullable=False, default=list)
    metadata = Column(JSON, nullable=False, default=dict)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relations
    created_by = Column(String, nullable=True)


class Execution(Base):
    """Modèle Execution pour logger les exécutions d'agents."""

    __tablename__ = "executions"

    id = Column(String, primary_key=True, default=lambda: f"exec_{uuid.uuid4().hex[:12]}")
    workflow_id = Column(String, nullable=False, index=True)
    project_id = Column(String, nullable=False, index=True)
    agent_name = Column(String(50), nullable=False, index=True)

    # Exécution
    status = Column(String(50), nullable=False)  # pending, running, completed, failed
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Résultats
    output = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)

    # Logs
    logs = Column(JSON, nullable=False, default=list)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


# ============================================================================
# DATABASE SERVICE
# ============================================================================

class DatabaseService:
    """
    Service de gestion de la base de données.

    Gère:
    - Connexion à PostgreSQL
    - Sessions async
    - Transactions
    - Migrations (via Alembic)
    """

    def __init__(self, database_url: Optional[str] = None):
        """
        Initialise le service de base de données.

        Args:
            database_url: URL de connexion (utilise settings.database_url si None)
        """
        self.database_url = database_url or settings.database_url
        self.logger = get_logger(__name__)

        # Créer le moteur async
        self.engine: AsyncEngine = create_async_engine(
            self.database_url,
            echo=settings.debug,
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
        )

        # Créer le session maker
        self.async_session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

        self.logger.info("Database service initialized", database_url=self.database_url)

    async def create_tables(self):
        """
        Crée toutes les tables dans la base de données.

        Note: En production, utiliser Alembic pour les migrations.
        """
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            self.logger.info("Database tables created")

    async def drop_tables(self):
        """
        Supprime toutes les tables (DANGER: perte de données).

        À utiliser uniquement en développement.
        """
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            self.logger.warning("Database tables dropped")

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Context manager pour obtenir une session de base de données.

        Gère automatiquement le commit/rollback.

        Usage:
            async with db_service.session() as session:
                # Utiliser la session
                project = await session.get(Project, "proj_123")

        Yields:
            AsyncSession: Session de base de données
        """
        session = self.async_session_maker()
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            self.logger.error("Database transaction failed", error=str(e))
            raise
        finally:
            await session.close()

    async def health_check(self) -> bool:
        """
        Vérifie que la connexion à la base de données fonctionne.

        Returns:
            bool: True si la connexion est OK

        Raises:
            Exception: Si la connexion échoue
        """
        try:
            async with self.session() as session:
                await session.execute("SELECT 1")
            self.logger.debug("Database health check passed")
            return True
        except Exception as e:
            self.logger.error("Database health check failed", error=str(e))
            raise

    async def close(self):
        """Ferme les connexions à la base de données."""
        await self.engine.dispose()
        self.logger.info("Database connections closed")


# Instance globale
_database_service: Optional[DatabaseService] = None


def get_database_service() -> DatabaseService:
    """
    Obtient l'instance globale du service de base de données.

    Returns:
        DatabaseService: Instance du service
    """
    global _database_service
    if _database_service is None:
        _database_service = DatabaseService()
    return _database_service


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency pour FastAPI qui fournit une session de base de données.

    Usage dans une route FastAPI:
        @app.get("/projects/{project_id}")
        async def get_project(
            project_id: str,
            db: AsyncSession = Depends(get_db_session)
        ):
            project = await db.get(Project, project_id)
            return project

    Yields:
        AsyncSession: Session de base de données
    """
    db_service = get_database_service()
    async with db_service.session() as session:
        yield session
