"""
États du workflow LangGraph.
Définit la structure de données qui circule entre les agents.
"""
from typing import TypedDict, Optional, Dict, Any
from schemas.agents import (
    ProjectPlan,
    TechnicalArchitecture,
    CodebaseStructure,
    SecurityReport,
    TestSuite,
    DeploymentPlan
)


class WorkflowState(TypedDict):
    """
    État global du workflow partagé entre tous les agents.

    Cet état est passé d'un agent à l'autre et s'enrichit progressivement.
    """

    # Input initial
    brief: str
    workflow_id: str
    project_id: str

    # Outputs des agents (remplis progressivement)
    director_output: Optional[ProjectPlan]
    architect_output: Optional[TechnicalArchitecture]
    developer_output: Optional[CodebaseStructure]
    security_output: Optional[SecurityReport]
    qa_output: Optional[TestSuite]
    devops_output: Optional[DeploymentPlan]

    # Métadonnées d'exécution
    current_agent: Optional[str]
    error_message: Optional[str]
    retry_count: int

    # Checkpoints humains
    human_review_required: bool
    human_review_approved: Optional[bool]
    human_review_comments: Optional[str]

    # Progression
    progress_percentage: int

    # Données additionnelles
    metadata: Dict[str, Any]
