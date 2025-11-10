"""
Routes et helpers pour la gestion des WebSocket.
Fonctions utilitaires pour broadcaster des événements.
"""
from typing import Dict, Any
from config import get_logger


logger = get_logger(__name__)


async def broadcast_workflow_event(
    websocket_manager: Any,
    workflow_id: str,
    event_type: str,
    data: Dict[str, Any]
):
    """
    Broadcast un événement de workflow via WebSocket.

    Args:
        websocket_manager: Instance du ConnectionManager
        workflow_id: ID du workflow
        event_type: Type d'événement (workflow_started, agent_progress, etc.)
        data: Données de l'événement
    """
    message = {
        "type": event_type,
        "workflow_id": workflow_id,
        **data
    }

    await websocket_manager.broadcast_to_workflow(workflow_id, message)

    logger.debug(
        "WebSocket event broadcasted",
        workflow_id=workflow_id,
        event_type=event_type
    )


# Les routes WebSocket sont définies dans main.py
# Ce fichier contient uniquement les helpers
