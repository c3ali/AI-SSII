"""
Schémas Pydantic pour les projets.
Gère les entités Project et leurs relations avec les workflows et agents.
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

from .workflow import WorkflowStatus
from .agents import (
    ProjectPlan,
    TechnicalArchitecture,
    CodebaseStructure,
    SecurityReport,
    TestSuite,
    DeploymentPlan
)


class ProjectStatus(str, Enum):
    """Statuts possibles d'un projet."""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    FAILED = "failed"
    ARCHIVED = "archived"


class ProjectCreate(BaseModel):
    """Données pour créer un nouveau projet."""
    name: str = Field(..., min_length=3, max_length=100, description="Nom du projet")
    brief: str = Field(..., min_length=10, description="Brief du projet")
    description: Optional[str] = Field(default=None, description="Description détaillée")
    tags: list[str] = Field(default_factory=list, description="Tags pour catégoriser le projet")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Métadonnées additionnelles")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "TaskMaster Pro",
                "brief": "Build a modern task management application with real-time collaboration",
                "description": "A comprehensive task management solution for teams",
                "tags": ["productivity", "collaboration", "saas"],
                "metadata": {"client": "Internal", "priority": "high"}
            }
        }


class ProjectUpdate(BaseModel):
    """Données pour mettre à jour un projet."""
    name: Optional[str] = Field(default=None, min_length=3, max_length=100, description="Nom du projet")
    description: Optional[str] = Field(default=None, description="Description")
    status: Optional[ProjectStatus] = Field(default=None, description="Statut")
    tags: Optional[list[str]] = Field(default=None, description="Tags")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Métadonnées")


class ProjectOutputs(BaseModel):
    """Outputs générés par tous les agents pour un projet."""
    director: Optional[ProjectPlan] = Field(default=None, description="Output de l'agent Director")
    architect: Optional[TechnicalArchitecture] = Field(default=None, description="Output de l'agent Architect")
    developer: Optional[CodebaseStructure] = Field(default=None, description="Output de l'agent Developer")
    security: Optional[SecurityReport] = Field(default=None, description="Output de l'agent Security")
    qa: Optional[TestSuite] = Field(default=None, description="Output de l'agent QA")
    devops: Optional[DeploymentPlan] = Field(default=None, description="Output de l'agent DevOps")


class Project(BaseModel):
    """Modèle complet d'un projet."""
    id: str = Field(..., description="ID unique du projet")
    name: str = Field(..., description="Nom du projet")
    brief: str = Field(..., description="Brief initial")
    description: Optional[str] = Field(default=None, description="Description détaillée")
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT, description="Statut du projet")

    # Workflow
    current_workflow_id: Optional[str] = Field(default=None, description="ID du workflow en cours")
    workflow_status: Optional[WorkflowStatus] = Field(default=None, description="Statut du workflow")

    # Outputs des agents
    outputs: ProjectOutputs = Field(default_factory=ProjectOutputs, description="Outputs des agents")

    # Métadonnées
    tags: list[str] = Field(default_factory=list, description="Tags")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Métadonnées")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Date de création")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Date de mise à jour")
    completed_at: Optional[datetime] = Field(default=None, description="Date de complétion")

    # Relations
    created_by: Optional[str] = Field(default=None, description="ID de l'utilisateur créateur")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "proj_123456",
                "name": "TaskMaster Pro",
                "brief": "Build a task management app",
                "status": "in_progress",
                "current_workflow_id": "wf_789",
                "workflow_status": "running",
                "tags": ["productivity"],
                "created_at": "2025-01-15T10:00:00Z",
                "updated_at": "2025-01-15T11:00:00Z"
            }
        }


class ProjectList(BaseModel):
    """Liste paginée de projets."""
    projects: list[Project] = Field(..., description="Liste des projets")
    total: int = Field(..., description="Nombre total de projets")
    page: int = Field(..., description="Page actuelle")
    page_size: int = Field(..., description="Taille de la page")
    has_more: bool = Field(..., description="Y a-t-il plus de résultats?")


class ProjectStats(BaseModel):
    """Statistiques globales des projets."""
    total_projects: int = Field(..., description="Nombre total de projets")
    by_status: Dict[str, int] = Field(..., description="Répartition par statut")
    completed_this_month: int = Field(..., description="Projets complétés ce mois")
    average_completion_time_hours: float = Field(..., description="Temps moyen de complétion (heures)")
    success_rate_percentage: float = Field(..., ge=0, le=100, description="Taux de succès (%)")

    class Config:
        json_schema_extra = {
            "example": {
                "total_projects": 42,
                "by_status": {
                    "draft": 5,
                    "in_progress": 12,
                    "completed": 20,
                    "failed": 3,
                    "archived": 2
                },
                "completed_this_month": 8,
                "average_completion_time_hours": 24.5,
                "success_rate_percentage": 87.5
            }
        }
