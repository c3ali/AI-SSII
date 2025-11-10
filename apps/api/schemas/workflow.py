"""
Schémas Pydantic pour la gestion du workflow LangGraph.
Définit les états, transitions et checkpoints du workflow.
"""
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum


class WorkflowStatus(str, Enum):
    """Statuts possibles du workflow."""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    WAITING_REVIEW = "waiting_review"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentStatus(str, Enum):
    """Statuts possibles pour chaque agent."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class AgentProgress(BaseModel):
    """Progression d'un agent spécifique."""
    agent_name: str = Field(..., description="Nom de l'agent")
    status: AgentStatus = Field(default=AgentStatus.PENDING, description="Statut actuel")
    started_at: Optional[datetime] = Field(default=None, description="Heure de début")
    completed_at: Optional[datetime] = Field(default=None, description="Heure de fin")
    progress_percentage: int = Field(default=0, ge=0, le=100, description="Pourcentage de progression")
    current_step: Optional[str] = Field(default=None, description="Étape actuelle")
    logs: List[str] = Field(default_factory=list, description="Logs de l'agent")
    error: Optional[str] = Field(default=None, description="Message d'erreur si échec")
    output: Optional[Dict[str, Any]] = Field(default=None, description="Sortie de l'agent")

    class Config:
        json_schema_extra = {
            "example": {
                "agent_name": "director",
                "status": "running",
                "started_at": "2025-01-15T10:30:00Z",
                "progress_percentage": 45,
                "current_step": "Analyzing user stories",
                "logs": ["Started analysis", "Processing brief"],
            }
        }


class WorkflowState(BaseModel):
    """État complet du workflow LangGraph."""

    # Identifiants
    workflow_id: str = Field(..., description="ID unique du workflow")
    project_id: str = Field(..., description="ID du projet associé")

    # Statut général
    status: WorkflowStatus = Field(default=WorkflowStatus.PENDING, description="Statut du workflow")
    current_node: Optional[str] = Field(default=None, description="Nœud actuel du graph")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    started_at: Optional[datetime] = Field(default=None, description="Date de début d'exécution")
    completed_at: Optional[datetime] = Field(default=None, description="Date de fin")

    # Input initial
    brief: str = Field(..., description="Brief initial du projet")

    # Progression des agents
    agents_progress: Dict[str, AgentProgress] = Field(
        default_factory=dict,
        description="Progression de chaque agent"
    )

    # Outputs de chaque agent
    director_output: Optional[Dict[str, Any]] = Field(default=None, description="Output du Director")
    architect_output: Optional[Dict[str, Any]] = Field(default=None, description="Output de l'Architect")
    developer_output: Optional[Dict[str, Any]] = Field(default=None, description="Output du Developer")
    security_output: Optional[Dict[str, Any]] = Field(default=None, description="Output de la Security")
    qa_output: Optional[Dict[str, Any]] = Field(default=None, description="Output du QA")
    devops_output: Optional[Dict[str, Any]] = Field(default=None, description="Output du DevOps")

    # Checkpoints humains
    human_review_checkpoints: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Points de validation humaine"
    )

    # Métadonnées
    retry_count: int = Field(default=0, description="Nombre de tentatives")
    error_message: Optional[str] = Field(default=None, description="Message d'erreur global")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Métadonnées additionnelles")

    class Config:
        json_schema_extra = {
            "example": {
                "workflow_id": "wf_123456",
                "project_id": "proj_789",
                "status": "running",
                "current_node": "architect",
                "brief": "Build a task management app with React and FastAPI",
                "agents_progress": {
                    "director": {
                        "agent_name": "director",
                        "status": "completed",
                        "progress_percentage": 100
                    }
                }
            }
        }


class CheckpointData(BaseModel):
    """Données d'un checkpoint de validation humaine."""
    checkpoint_id: str = Field(..., description="ID du checkpoint")
    workflow_id: str = Field(..., description="ID du workflow")
    checkpoint_type: Literal["architecture_review", "code_review"] = Field(
        ...,
        description="Type de checkpoint"
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    agent_name: str = Field(..., description="Agent ayant déclenché le checkpoint")
    data_to_review: Dict[str, Any] = Field(..., description="Données à valider")
    status: Literal["pending", "approved", "rejected"] = Field(
        default="pending",
        description="Statut de la validation"
    )
    reviewer_comments: Optional[str] = Field(default=None, description="Commentaires du reviewer")
    reviewed_at: Optional[datetime] = Field(default=None, description="Date de validation")
    reviewed_by: Optional[str] = Field(default=None, description="ID du validateur")

    class Config:
        json_schema_extra = {
            "example": {
                "checkpoint_id": "cp_123",
                "workflow_id": "wf_123456",
                "checkpoint_type": "architecture_review",
                "agent_name": "architect",
                "data_to_review": {
                    "architecture": "Microservices with Next.js + FastAPI",
                    "stack": ["Next.js", "FastAPI", "PostgreSQL"]
                },
                "status": "pending"
            }
        }


class WorkflowEvent(BaseModel):
    """Événement émis pendant l'exécution du workflow (pour WebSocket)."""
    event_type: Literal[
        "workflow_started",
        "workflow_completed",
        "workflow_failed",
        "agent_started",
        "agent_progress",
        "agent_completed",
        "agent_failed",
        "checkpoint_created",
        "checkpoint_resolved"
    ] = Field(..., description="Type d'événement")
    workflow_id: str = Field(..., description="ID du workflow")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp de l'événement")
    agent_name: Optional[str] = Field(default=None, description="Nom de l'agent concerné")
    data: Dict[str, Any] = Field(default_factory=dict, description="Données de l'événement")
    message: str = Field(..., description="Message descriptif")

    class Config:
        json_schema_extra = {
            "example": {
                "event_type": "agent_progress",
                "workflow_id": "wf_123456",
                "agent_name": "director",
                "message": "Analyzing user stories...",
                "data": {"progress": 50}
            }
        }


class WorkflowInput(BaseModel):
    """Input pour démarrer un nouveau workflow."""
    brief: str = Field(..., min_length=10, description="Brief du projet (minimum 10 caractères)")
    project_name: Optional[str] = Field(default=None, description="Nom du projet (optionnel)")
    options: Dict[str, Any] = Field(
        default_factory=dict,
        description="Options additionnelles pour le workflow"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "brief": "Create a task management application with user authentication, task CRUD operations, and real-time notifications",
                "project_name": "TaskMaster Pro",
                "options": {
                    "skip_human_review": False,
                    "preferred_stack": "Next.js + FastAPI"
                }
            }
        }


class WorkflowResponse(BaseModel):
    """Réponse après création d'un workflow."""
    workflow_id: str = Field(..., description="ID du workflow créé")
    project_id: str = Field(..., description="ID du projet créé")
    status: WorkflowStatus = Field(..., description="Statut initial")
    message: str = Field(..., description="Message de confirmation")
    websocket_url: str = Field(..., description="URL WebSocket pour suivre la progression")

    class Config:
        json_schema_extra = {
            "example": {
                "workflow_id": "wf_123456",
                "project_id": "proj_789",
                "status": "running",
                "message": "Workflow started successfully",
                "websocket_url": "ws://localhost:8000/ws/wf_123456"
            }
        }
