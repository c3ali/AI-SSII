"""
Routes API pour les informations sur les agents.
Métadonnées et statuts des agents IA.
"""
from fastapi import APIRouter
from typing import List, Dict, Any

from config import get_logger
from agents import (
    DirectorAgent,
    ArchitectAgent,
    DeveloperAgent,
    SecurityAgent,
    QAAgent,
    DevOpsAgent
)


logger = get_logger(__name__)
router = APIRouter()


@router.get("/")
async def list_agents() -> List[Dict[str, Any]]:
    """
    Liste tous les agents disponibles avec leurs métadonnées.

    Returns:
        List: Liste des agents avec nom, description, capabilities
    """
    agents_info = [
        {
            "name": "director",
            "class": "DirectorAgent",
            "description": "Directeur de Projet - Analyse le brief et génère le plan projet",
            "input": "Brief textuel",
            "output": "ProjectPlan (user stories, estimations, risques, budget)",
            "capabilities": [
                "Analyse de brief",
                "Génération de user stories Gherkin",
                "Estimation 3 points",
                "Prioritisation MoSCoW",
                "Analyse SWOT",
                "Gestion de budget"
            ],
            "average_duration_seconds": 30,
            "order": 1
        },
        {
            "name": "architect",
            "class": "ArchitectAgent",
            "description": "Architecte Solution - Conçoit l'architecture technique",
            "input": "ProjectPlan",
            "output": "TechnicalArchitecture (stack, ADRs, diagrammes, coûts)",
            "capabilities": [
                "Choix de stack technique",
                "Architecture Decision Records (ADR)",
                "Diagrammes C4 en Mermaid",
                "Modélisation de données",
                "Estimation coûts infrastructure"
            ],
            "average_duration_seconds": 40,
            "order": 2
        },
        {
            "name": "developer",
            "class": "DeveloperAgent",
            "description": "Développeur Full-Stack - Génère le code complet",
            "input": "TechnicalArchitecture + ProjectPlan",
            "output": "CodebaseStructure (fichiers, tests, config)",
            "capabilities": [
                "Génération de code TypeScript/Python",
                "Principes SOLID, DRY, KISS",
                "Tests unitaires",
                "Documentation JSDoc/docstrings",
                "Gestion d'erreurs",
                "Logging structuré"
            ],
            "average_duration_seconds": 60,
            "order": 3
        },
        {
            "name": "security",
            "class": "SecurityAgent",
            "description": "Expert Sécurité - Analyse les vulnérabilités",
            "input": "CodebaseStructure",
            "output": "SecurityReport (vulnérabilités, score, recommandations)",
            "capabilities": [
                "Analyse OWASP Top 10",
                "Détection de vulnérabilités",
                "Score de sécurité",
                "Recommandations de correction",
                "Vérifications de conformité"
            ],
            "average_duration_seconds": 35,
            "order": 4
        },
        {
            "name": "qa",
            "class": "QAAgent",
            "description": "Expert QA - Génère la suite de tests",
            "input": "CodebaseStructure + ProjectPlan",
            "output": "TestSuite (tests unitaires/intégration/E2E, métriques)",
            "capabilities": [
                "Tests unitaires (Jest/pytest)",
                "Tests d'intégration",
                "Tests E2E",
                "Métriques de qualité (coverage, complexité)",
                "Configuration CI/CD"
            ],
            "average_duration_seconds": 45,
            "order": 5
        },
        {
            "name": "devops",
            "class": "DevOpsAgent",
            "description": "Expert DevOps - Plan de déploiement complet",
            "input": "TechnicalArchitecture",
            "output": "DeploymentPlan (environnements, CI/CD, monitoring, backup)",
            "capabilities": [
                "Configuration d'environnements",
                "Pipeline CI/CD (GitHub Actions)",
                "Dockerisation",
                "Monitoring et alerting",
                "Stratégie de backup",
                "Plan de rollback"
            ],
            "average_duration_seconds": 40,
            "order": 6
        }
    ]

    return agents_info


@router.get("/{agent_name}")
async def get_agent_info(agent_name: str) -> Dict[str, Any]:
    """
    Récupère les informations détaillées d'un agent spécifique.

    Args:
        agent_name: Nom de l'agent (director, architect, etc.)

    Returns:
        Dict: Informations de l'agent

    Raises:
        HTTPException 404: Si l'agent n'existe pas
    """
    from fastapi import HTTPException

    agents = await list_agents()
    agent = next((a for a in agents if a["name"] == agent_name), None)

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return agent


@router.get("/workflow/sequence")
async def get_workflow_sequence() -> Dict[str, Any]:
    """
    Retourne la séquence d'exécution des agents dans le workflow.

    Returns:
        Dict: Séquence du workflow avec dépendances
    """
    return {
        "sequence": [
            {
                "step": 1,
                "agent": "director",
                "depends_on": [],
                "produces": "ProjectPlan",
                "checkpoint_after": False
            },
            {
                "step": 2,
                "agent": "architect",
                "depends_on": ["director"],
                "produces": "TechnicalArchitecture",
                "checkpoint_after": True,
                "checkpoint_name": "Architecture Review"
            },
            {
                "step": 3,
                "agent": "developer",
                "depends_on": ["architect", "director"],
                "produces": "CodebaseStructure",
                "checkpoint_after": False
            },
            {
                "step": 4,
                "agent": "security",
                "depends_on": ["developer"],
                "produces": "SecurityReport",
                "checkpoint_after": False
            },
            {
                "step": 5,
                "agent": "qa",
                "depends_on": ["developer", "director"],
                "produces": "TestSuite",
                "checkpoint_after": False
            },
            {
                "step": 6,
                "agent": "devops",
                "depends_on": ["architect"],
                "produces": "DeploymentPlan",
                "checkpoint_after": True,
                "checkpoint_name": "Final Review"
            }
        ],
        "total_steps": 6,
        "estimated_duration_seconds": 250,
        "parallel_execution": False,
        "checkpoints_enabled": True
    }
