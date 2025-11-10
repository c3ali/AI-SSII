"""
Schémas Pydantic pour l'application SSII IA Platform.
Centralise tous les modèles de données.
"""
from .workflow import (
    WorkflowStatus,
    AgentStatus,
    AgentProgress,
    WorkflowState,
    CheckpointData,
    WorkflowEvent,
    WorkflowInput,
    WorkflowResponse,
)

from .agents import (
    # Director
    UserStory,
    Risk,
    ProjectPlan,
    # Architect
    TechnologyChoice,
    ArchitectureDecisionRecord,
    InfrastructureCost,
    TechnicalArchitecture,
    # Developer
    CodeFile,
    CodebaseStructure,
    # Security
    SecurityVulnerability,
    SecurityReport,
    # QA
    TestCase,
    QualityMetrics,
    TestSuite,
    # DevOps
    DeploymentEnvironment,
    MonitoringSetup,
    DeploymentPlan,
)

from .project import (
    ProjectStatus,
    ProjectCreate,
    ProjectUpdate,
    ProjectOutputs,
    Project,
    ProjectList,
    ProjectStats,
)

__all__ = [
    # Workflow
    "WorkflowStatus",
    "AgentStatus",
    "AgentProgress",
    "WorkflowState",
    "CheckpointData",
    "WorkflowEvent",
    "WorkflowInput",
    "WorkflowResponse",
    # Agents - Director
    "UserStory",
    "Risk",
    "ProjectPlan",
    # Agents - Architect
    "TechnologyChoice",
    "ArchitectureDecisionRecord",
    "InfrastructureCost",
    "TechnicalArchitecture",
    # Agents - Developer
    "CodeFile",
    "CodebaseStructure",
    # Agents - Security
    "SecurityVulnerability",
    "SecurityReport",
    # Agents - QA
    "TestCase",
    "QualityMetrics",
    "TestSuite",
    # Agents - DevOps
    "DeploymentEnvironment",
    "MonitoringSetup",
    "DeploymentPlan",
    # Projects
    "ProjectStatus",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectOutputs",
    "Project",
    "ProjectList",
    "ProjectStats",
]
