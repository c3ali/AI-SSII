"""
Schémas Pydantic pour les outputs de chaque agent.
Définit les structures de données produites par les 6 agents spécialisés.
"""
from typing import Dict, List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


# ============================================================================
# AGENT 1: DIRECTOR - Analyse de brief et planification
# ============================================================================

class UserStory(BaseModel):
    """User story au format Gherkin."""
    id: str = Field(..., description="ID unique de la story")
    title: str = Field(..., description="Titre de la story")
    as_a: str = Field(..., description="En tant que...")
    i_want: str = Field(..., description="Je veux...")
    so_that: str = Field(..., description="Afin de...")
    acceptance_criteria: List[str] = Field(..., description="Critères d'acceptation Given/When/Then")
    priority: Literal["Must", "Should", "Could", "Won't"] = Field(..., description="Priorité MoSCoW")
    estimation_optimistic: float = Field(..., gt=0, description="Estimation optimiste (heures)")
    estimation_realistic: float = Field(..., gt=0, description="Estimation réaliste (heures)")
    estimation_pessimistic: float = Field(..., gt=0, description="Estimation pessimiste (heures)")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "US-001",
                "title": "User Registration",
                "as_a": "New user",
                "i_want": "To create an account",
                "so_that": "I can access the platform",
                "acceptance_criteria": [
                    "Given I am on the registration page",
                    "When I fill the form with valid data",
                    "Then my account is created and I receive a confirmation email"
                ],
                "priority": "Must",
                "estimation_optimistic": 2.0,
                "estimation_realistic": 4.0,
                "estimation_pessimistic": 6.0
            }
        }


class Risk(BaseModel):
    """Analyse d'un risque projet."""
    id: str = Field(..., description="ID du risque")
    category: Literal["Technical", "Business", "Security", "Performance"] = Field(
        ...,
        description="Catégorie du risque"
    )
    description: str = Field(..., description="Description du risque")
    probability: Literal["Low", "Medium", "High"] = Field(..., description="Probabilité d'occurrence")
    impact: Literal["Low", "Medium", "High"] = Field(..., description="Impact si occurrence")
    mitigation: str = Field(..., description="Plan de mitigation")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "RISK-001",
                "category": "Security",
                "description": "Potential SQL injection vulnerabilities",
                "probability": "Medium",
                "impact": "High",
                "mitigation": "Use ORM with parameterized queries, implement input validation"
            }
        }


class ProjectPlan(BaseModel):
    """Plan de projet complet généré par le Director."""
    title: str = Field(..., description="Titre du projet")
    objectives: List[str] = Field(..., min_length=1, description="Objectifs SMART du projet")
    user_stories: List[UserStory] = Field(..., min_length=5, description="User stories (minimum 5)")
    risks: List[Risk] = Field(..., min_length=3, description="Risques identifiés (minimum 3)")
    swot_analysis: Dict[str, List[str]] = Field(
        ...,
        description="Analyse SWOT (Strengths, Weaknesses, Opportunities, Threats)"
    )
    budget_monthly: float = Field(..., gt=0, le=50, description="Budget mensuel estimé (€)")
    timeline_weeks: int = Field(..., gt=0, description="Durée estimée (semaines)")
    timeline_buffer_percentage: int = Field(default=20, ge=0, le=50, description="Buffer de timeline (%)")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "TaskMaster Pro - Task Management Platform",
                "objectives": [
                    "Enable users to manage tasks efficiently",
                    "Provide real-time collaboration features",
                    "Ensure 99.9% uptime"
                ],
                "user_stories": [],
                "risks": [],
                "swot_analysis": {
                    "strengths": ["Modern tech stack", "Scalable architecture"],
                    "weaknesses": ["New team on FastAPI"],
                    "opportunities": ["Growing market for productivity tools"],
                    "threats": ["Competition from established players"]
                },
                "budget_monthly": 45.0,
                "timeline_weeks": 8
            }
        }


# ============================================================================
# AGENT 2: ARCHITECT - Architecture et design technique
# ============================================================================

class TechnologyChoice(BaseModel):
    """Choix technologique justifié."""
    name: str = Field(..., description="Nom de la technologie")
    category: Literal["Frontend", "Backend", "Database", "Infrastructure", "Testing", "Other"] = Field(
        ...,
        description="Catégorie"
    )
    version: Optional[str] = Field(default=None, description="Version recommandée")
    justification: str = Field(..., description="Justification du choix")
    alternatives_considered: List[str] = Field(default_factory=list, description="Alternatives considérées")


class ArchitectureDecisionRecord(BaseModel):
    """Architecture Decision Record (ADR)."""
    adr_id: str = Field(..., description="ID de l'ADR")
    title: str = Field(..., description="Titre de la décision")
    status: Literal["Proposed", "Accepted", "Deprecated", "Superseded"] = Field(
        default="Accepted",
        description="Statut"
    )
    context: str = Field(..., description="Contexte de la décision")
    decision: str = Field(..., description="Décision prise")
    consequences: List[str] = Field(..., description="Conséquences")
    date: datetime = Field(default_factory=datetime.utcnow, description="Date de la décision")


class InfrastructureCost(BaseModel):
    """Estimation des coûts d'infrastructure."""
    service_name: str = Field(..., description="Nom du service")
    provider: str = Field(..., description="Fournisseur (AWS, Vercel, etc.)")
    monthly_cost_usd: float = Field(..., ge=0, description="Coût mensuel estimé ($)")
    description: str = Field(..., description="Description du service")


class TechnicalArchitecture(BaseModel):
    """Architecture technique complète."""
    stack_type: Literal["Web", "Mobile", "Fullstack"] = Field(..., description="Type de stack")
    technologies: List[TechnologyChoice] = Field(..., description="Technologies choisies")
    architecture_pattern: str = Field(..., description="Pattern architectural (MVC, Microservices, etc.)")
    adrs: List[ArchitectureDecisionRecord] = Field(..., description="ADRs")
    c4_diagram_mermaid: str = Field(..., description="Diagramme C4 en syntaxe Mermaid")
    data_model_description: str = Field(..., description="Description du modèle de données")
    infrastructure_costs: List[InfrastructureCost] = Field(..., description="Coûts d'infrastructure")
    total_monthly_cost: float = Field(..., ge=0, le=50, description="Coût total mensuel ($)")


# ============================================================================
# AGENT 3: DEVELOPER - Génération de code
# ============================================================================

class CodeFile(BaseModel):
    """Fichier de code généré."""
    path: str = Field(..., description="Chemin relatif du fichier")
    content: str = Field(..., description="Contenu du fichier")
    language: str = Field(..., description="Langage de programmation")
    description: str = Field(..., description="Description du fichier")
    test_file_path: Optional[str] = Field(default=None, description="Chemin du fichier de test associé")


class CodebaseStructure(BaseModel):
    """Structure complète du codebase généré."""
    files: List[CodeFile] = Field(..., description="Fichiers générés")
    directory_structure: str = Field(..., description="Arborescence du projet")
    setup_instructions: List[str] = Field(..., description="Instructions de setup")
    dependencies: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Dépendances par package manager (npm, pip, etc.)"
    )
    environment_variables: Dict[str, str] = Field(
        default_factory=dict,
        description="Variables d'environnement requises"
    )


# ============================================================================
# AGENT 4: SECURITY - Analyse de sécurité
# ============================================================================

class SecurityVulnerability(BaseModel):
    """Vulnérabilité de sécurité identifiée."""
    vulnerability_id: str = Field(..., description="ID de la vulnérabilité")
    severity: Literal["Critical", "High", "Medium", "Low", "Info"] = Field(..., description="Sévérité")
    category: str = Field(..., description="Catégorie OWASP")
    title: str = Field(..., description="Titre")
    description: str = Field(..., description="Description")
    affected_files: List[str] = Field(..., description="Fichiers affectés")
    remediation: str = Field(..., description="Recommandation de correction")
    cwe_id: Optional[str] = Field(default=None, description="CWE ID si applicable")


class SecurityReport(BaseModel):
    """Rapport de sécurité complet."""
    vulnerabilities: List[SecurityVulnerability] = Field(..., description="Vulnérabilités trouvées")
    security_score: int = Field(..., ge=0, le=100, description="Score de sécurité (/100)")
    owasp_top10_coverage: Dict[str, bool] = Field(
        ...,
        description="Couverture des contrôles OWASP Top 10"
    )
    recommendations: List[str] = Field(..., description="Recommandations générales")
    compliance_checks: Dict[str, bool] = Field(
        default_factory=dict,
        description="Vérifications de conformité (GDPR, etc.)"
    )


# ============================================================================
# AGENT 5: QA - Tests et qualité
# ============================================================================

class TestCase(BaseModel):
    """Cas de test."""
    test_id: str = Field(..., description="ID du test")
    test_name: str = Field(..., description="Nom du test")
    test_type: Literal["Unit", "Integration", "E2E", "Performance"] = Field(..., description="Type de test")
    file_path: str = Field(..., description="Chemin du fichier de test")
    description: str = Field(..., description="Description")
    user_story_id: Optional[str] = Field(default=None, description="ID de la user story couverte")


class QualityMetrics(BaseModel):
    """Métriques de qualité du code."""
    code_coverage_percentage: int = Field(..., ge=0, le=100, description="Couverture de code (%)")
    cyclomatic_complexity_avg: float = Field(..., ge=0, description="Complexité cyclomatique moyenne")
    maintainability_index: int = Field(..., ge=0, le=100, description="Index de maintenabilité")
    duplicated_code_percentage: float = Field(..., ge=0, le=100, description="Code dupliqué (%)")


class TestSuite(BaseModel):
    """Suite de tests complète."""
    test_cases: List[TestCase] = Field(..., description="Cas de tests")
    quality_metrics: QualityMetrics = Field(..., description="Métriques de qualité")
    test_commands: Dict[str, str] = Field(..., description="Commandes pour lancer les tests")
    ci_configuration: str = Field(..., description="Configuration CI/CD (GitHub Actions, etc.)")


# ============================================================================
# AGENT 6: DEVOPS - Déploiement et infrastructure
# ============================================================================

class DeploymentEnvironment(BaseModel):
    """Configuration d'un environnement de déploiement."""
    name: Literal["development", "staging", "production"] = Field(..., description="Nom de l'environnement")
    url: str = Field(..., description="URL de l'environnement")
    provider: str = Field(..., description="Fournisseur (Vercel, Railway, AWS, etc.)")
    configuration: Dict[str, Any] = Field(..., description="Configuration spécifique")


class MonitoringSetup(BaseModel):
    """Configuration du monitoring."""
    service: str = Field(..., description="Service de monitoring")
    metrics_tracked: List[str] = Field(..., description="Métriques suivies")
    alert_rules: List[str] = Field(..., description="Règles d'alerte")


class DeploymentPlan(BaseModel):
    """Plan de déploiement complet."""
    environments: List[DeploymentEnvironment] = Field(..., description="Environnements")
    deployment_strategy: str = Field(..., description="Stratégie de déploiement (Blue/Green, Rolling, etc.)")
    docker_configuration: Optional[str] = Field(default=None, description="Dockerfile / docker-compose.yml")
    ci_cd_pipeline: str = Field(..., description="Pipeline CI/CD")
    monitoring: MonitoringSetup = Field(..., description="Setup de monitoring")
    backup_strategy: str = Field(..., description="Stratégie de backup")
    rollback_plan: str = Field(..., description="Plan de rollback")
    estimated_deployment_time_minutes: int = Field(..., gt=0, description="Temps de déploiement estimé (min)")
