"""
Application FastAPI principale pour la plateforme SSII IA.
Point d'entrée avec configuration, middleware, routes et WebSocket.
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from config import settings, configure_logging, get_logger
from services import get_database_service, get_redis_service


# Configuration du logging
configure_logging()
logger = get_logger(__name__)


# ============================================================================
# LIFECYCLE EVENTS
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestion du cycle de vie de l'application.
    Startup et shutdown hooks.
    """
    # STARTUP
    logger.info(
        "Starting SSII IA Platform API",
        version=settings.app_version,
        environment=settings.environment
    )

    # Initialiser la base de données
    db_service = get_database_service()
    try:
        await db_service.create_tables()
        await db_service.health_check()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error("Database initialization failed", error=str(e))
        # En dev, on continue même si DB échoue
        if settings.is_production:
            raise

    # Initialiser Redis
    redis_service = get_redis_service()
    try:
        await redis_service.connect()
        await redis_service.health_check()
        logger.info("Redis initialized successfully")
    except Exception as e:
        logger.error("Redis initialization failed", error=str(e))
        # En dev, on continue même si Redis échoue
        if settings.is_production:
            raise

    logger.info("Application startup complete")

    yield

    # SHUTDOWN
    logger.info("Shutting down application")

    # Fermer les connexions
    await db_service.close()
    await redis_service.disconnect()

    logger.info("Application shutdown complete")


# ============================================================================
# APPLICATION FASTAPI
# ============================================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Plateforme SSII IA - Génération automatique d'applications via 6 agents spécialisés",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)


# ============================================================================
# MIDDLEWARE
# ============================================================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    """Log toutes les requêtes HTTP."""
    logger.info(
        "HTTP request",
        method=request.method,
        url=str(request.url),
        client=request.client.host if request.client else None
    )

    response = await call_next(request)

    logger.info(
        "HTTP response",
        status_code=response.status_code,
        method=request.method,
        url=str(request.url)
    )

    return response


# ============================================================================
# ROUTES DE BASE
# ============================================================================

@app.get("/")
async def root():
    """Route racine."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "environment": settings.environment,
        "docs": "/docs" if settings.debug else "disabled in production"
    }


@app.get("/health")
async def health_check():
    """
    Health check pour monitoring.
    Vérifie la santé de tous les services critiques.
    """
    health_status = {
        "status": "healthy",
        "services": {}
    }

    # Check Database
    try:
        db_service = get_database_service()
        await db_service.health_check()
        health_status["services"]["database"] = "healthy"
    except Exception as e:
        health_status["services"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"

    # Check Redis
    try:
        redis_service = get_redis_service()
        await redis_service.health_check()
        health_status["services"]["redis"] = "healthy"
    except Exception as e:
        health_status["services"]["redis"] = f"unhealthy: {str(e)}"
        health_status["status"] = "degraded"

    return health_status


# ============================================================================
# WEBSOCKET MANAGER
# ============================================================================

class ConnectionManager:
    """
    Gestionnaire de connexions WebSocket pour les updates en temps réel.
    """

    def __init__(self):
        """Initialise le manager."""
        self.active_connections: dict[str, list[WebSocket]] = {}
        self.logger = get_logger("websocket")

    async def connect(self, websocket: WebSocket, workflow_id: str):
        """
        Accepte une nouvelle connexion WebSocket.

        Args:
            websocket: WebSocket client
            workflow_id: ID du workflow à suivre
        """
        await websocket.accept()
        if workflow_id not in self.active_connections:
            self.active_connections[workflow_id] = []
        self.active_connections[workflow_id].append(websocket)

        self.logger.info(
            "WebSocket connected",
            workflow_id=workflow_id,
            total_connections=len(self.active_connections[workflow_id])
        )

    def disconnect(self, websocket: WebSocket, workflow_id: str):
        """
        Déconnecte un WebSocket.

        Args:
            websocket: WebSocket client
            workflow_id: ID du workflow
        """
        if workflow_id in self.active_connections:
            self.active_connections[workflow_id].remove(websocket)
            if not self.active_connections[workflow_id]:
                del self.active_connections[workflow_id]

        self.logger.info("WebSocket disconnected", workflow_id=workflow_id)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Envoie un message à un WebSocket spécifique.

        Args:
            message: Message à envoyer
            websocket: WebSocket cible
        """
        await websocket.send_json(message)

    async def broadcast_to_workflow(self, workflow_id: str, message: dict):
        """
        Broadcast un message à tous les clients abonnés à un workflow.

        Args:
            workflow_id: ID du workflow
            message: Message à broadcaster
        """
        if workflow_id in self.active_connections:
            dead_connections = []

            for websocket in self.active_connections[workflow_id]:
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    self.logger.error(
                        "Failed to send WebSocket message",
                        workflow_id=workflow_id,
                        error=str(e)
                    )
                    dead_connections.append(websocket)

            # Nettoyer les connexions mortes
            for websocket in dead_connections:
                self.disconnect(websocket, workflow_id)


# Instance globale du manager
websocket_manager = ConnectionManager()


@app.websocket("/ws/{workflow_id}")
async def websocket_endpoint(websocket: WebSocket, workflow_id: str):
    """
    Endpoint WebSocket pour suivre la progression d'un workflow.

    Args:
        websocket: Connexion WebSocket
        workflow_id: ID du workflow à suivre
    """
    await websocket_manager.connect(websocket, workflow_id)

    try:
        # Envoyer un message de bienvenue
        await websocket_manager.send_personal_message(
            {
                "type": "connected",
                "workflow_id": workflow_id,
                "message": f"Connected to workflow {workflow_id}"
            },
            websocket
        )

        # Boucle pour recevoir des messages (heartbeat, etc.)
        while True:
            data = await websocket.receive_text()
            logger.debug("WebSocket message received", data=data)

            # Heartbeat
            if data == "ping":
                await websocket_manager.send_personal_message(
                    {"type": "pong"},
                    websocket
                )

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, workflow_id)
        logger.info("WebSocket client disconnected", workflow_id=workflow_id)


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    Handler global pour toutes les exceptions non gérées.

    Args:
        request: Request FastAPI
        exc: Exception levée

    Returns:
        JSONResponse: Réponse d'erreur standardisée
    """
    logger.error(
        "Unhandled exception",
        url=str(request.url),
        error=str(exc),
        exc_info=True
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.debug else "An error occurred",
            "type": type(exc).__name__
        }
    )


# ============================================================================
# IMPORT DES ROUTES
# ============================================================================

# Import des routers (après la création de l'app pour éviter les imports circulaires)
from api import projects, agents, websocket as ws_routes

# Inclure les routers
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])


# ============================================================================
# MAIN (pour lancement direct)
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
