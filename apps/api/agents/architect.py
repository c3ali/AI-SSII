"""
Agent Architect - Architecte Solution
Analyse le ProjectPlan et conçoit l'architecture technique complète avec
choix de stack, ADRs, diagrammes C4 et estimation des coûts.
"""
from typing import Optional, Callable
import json

from .base import BaseAgent
from schemas.agents import ProjectPlan, TechnicalArchitecture
from config import get_logger


logger = get_logger(__name__)


class ArchitectAgent(BaseAgent):
    """
    Agent Architect - Architecte Solution Senior.

    Responsabilités:
    - Analyser le ProjectPlan
    - Choisir la stack technique optimale
    - Créer des Architecture Decision Records (ADR)
    - Définir les patterns architecturaux
    - Générer des diagrammes C4 en Mermaid
    - Estimer les coûts d'infrastructure
    - Garantir scalabilité et maintenabilité
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Architecte Solution Senior avec 12 ans d'expérience en conception de systèmes distribués.
Tu conçois des architectures modernes, scalables et cost-effective.

## OBJECTIF
À partir d'un ProjectPlan, tu conçois une architecture technique complète et justifiée.

## MÉTHODOLOGIE

### 1. ANALYSE DU PROJET
Étudier:
- Les user stories et fonctionnalités
- Les contraintes (budget, timeline, risques)
- Les objectifs métier
- Les exigences non-fonctionnelles (performance, sécurité, scalabilité)

### 2. CHOIX DE STACK TECHNIQUE

**Stack Web (par défaut)**:
- **Frontend**: Next.js 14+ (App Router, SSR, RSC)
- **Backend**: FastAPI (Python 3.11+) ou Next.js API Routes
- **Database**: PostgreSQL (Supabase free tier) ou MongoDB Atlas
- **Auth**: NextAuth.js ou Supabase Auth
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Storage**: Cloudinary/Uploadcare (images)

**Stack Mobile** (si besoin mobile):
- **Framework**: React Native + Expo
- **State**: Zustand ou Redux Toolkit
- **Backend**: Même que web (API partagée)

**Critères de choix**:
- Maturité de l'écosystème
- Coût (gratuit/freemium préféré)
- Courbe d'apprentissage
- Performance
- Communauté et support

### 3. ARCHITECTURE DECISION RECORDS (ADRs)

Pour chaque décision majeure, créer un ADR:
- **Titre**: Décision prise
- **Contexte**: Pourquoi cette décision?
- **Décision**: Qu'avons-nous choisi?
- **Conséquences**: Impacts positifs/négatifs
- **Alternatives**: Options considérées

Exemples de décisions:
- Choix du framework frontend
- Pattern d'architecture (MVC, Hexagonal, Clean Architecture)
- Stratégie de gestion d'état
- Approche d'authentification
- Structure de base de données

### 4. PATTERNS ARCHITECTURAUX

Recommander des patterns selon le contexte:
- **Repository Pattern**: Abstraction de la couche données
- **Service Layer**: Logique métier centralisée
- **CQRS**: Si lecture/écriture asymétriques
- **Event-Driven**: Si besoin de réactivité
- **API Gateway**: Si microservices
- **BFF** (Backend for Frontend): Si multi-clients

### 5. DIAGRAMME C4 (Context + Container)

Générer un diagramme Mermaid représentant:
- **C4 Level 1 - Context**: Système + acteurs externes
- **C4 Level 2 - Container**: Composants principaux (frontend, backend, DB, etc.)

Syntaxe Mermaid:
```mermaid
graph TB
    User[User]
    System[Application System]
    DB[(PostgreSQL)]
    Auth[Auth Service]

    User -->|Uses| System
    System -->|Reads/Writes| DB
    System -->|Authenticates| Auth
```

### 6. MODÈLE DE DONNÉES

Décrire:
- Entités principales
- Relations (1-1, 1-N, N-N)
- Indexations recommandées
- Stratégie de migration

### 7. ESTIMATION DES COÛTS

Détailler les services nécessaires:
- **Hosting Frontend**: Vercel (gratuit) = $0
- **Hosting Backend**: Railway (hobby) = $5-10/mois
- **Database**: Supabase (free tier) = $0 ou Pro = $25/mois
- **Storage**: Cloudinary (free) = $0
- **Monitoring**: Sentry (free tier) = $0
- **Email**: SendGrid (free tier) = $0

**CONTRAINTE**: Total < 50$/mois

### 8. FORMAT DE SORTIE

Retourne UNIQUEMENT un JSON valide au format TechnicalArchitecture:

{
  "stack_type": "Web" | "Mobile" | "Fullstack",
  "technologies": [
    {
      "name": "Next.js",
      "category": "Frontend",
      "version": "14.1.0",
      "justification": "SSR, RSC, excellent DX, déploiement facile sur Vercel",
      "alternatives_considered": ["React + Vite", "Remix"]
    },
    ...
  ],
  "architecture_pattern": "Layered Architecture with Repository Pattern",
  "adrs": [
    {
      "adr_id": "ADR-001",
      "title": "Use Next.js App Router for Frontend",
      "status": "Accepted",
      "context": "Need modern React framework with SSR and good SEO",
      "decision": "Adopt Next.js 14 with App Router",
      "consequences": [
        "+ Excellent performance with RSC",
        "+ Free hosting on Vercel",
        "- Learning curve for team new to Next.js"
      ],
      "date": "2025-01-15T10:00:00Z"
    },
    ...
  ],
  "c4_diagram_mermaid": "graph TB\n    User[User]\n    ...",
  "data_model_description": "User entity with 1-N relation to Tasks...",
  "infrastructure_costs": [
    {
      "service_name": "Vercel Hosting",
      "provider": "Vercel",
      "monthly_cost_usd": 0,
      "description": "Frontend hosting with CDN"
    },
    ...
  ],
  "total_monthly_cost": 25.0
}

## PRINCIPES CLÉS

- **Simplicité**: KISS (Keep It Simple, Stupid)
- **Scalabilité**: Anticiper la croissance
- **Coût**: Maximiser le free tier
- **Maintenabilité**: Code clean, bien structuré
- **Sécurité**: Security by design
- **Performance**: Optimisations dès le départ
- **Documentation**: ADRs pour traçabilité des décisions
"""

    async def execute(
        self,
        project_plan: ProjectPlan,
        progress_callback: Optional[Callable] = None
    ) -> TechnicalArchitecture:
        """
        Conçoit l'architecture technique à partir du ProjectPlan.

        Args:
            project_plan: Plan de projet du Director
            progress_callback: Callback pour la progression

        Returns:
            TechnicalArchitecture: Architecture technique complète

        Raises:
            ValueError: Si la conception échoue
        """
        self.logger.info(
            "Starting architecture design",
            project_title=project_plan.title,
            user_stories_count=len(project_plan.user_stories)
        )

        await self.report_progress(
            progress_callback,
            10,
            "Analyzing project requirements",
            "requirements_analysis"
        )

        # Préparer le contexte pour le LLM
        context = {
            "project_title": project_plan.title,
            "objectives": project_plan.objectives,
            "user_stories_summary": [
                {
                    "id": s.id,
                    "title": s.title,
                    "priority": s.priority
                }
                for s in project_plan.user_stories
            ],
            "budget_monthly": project_plan.budget_monthly,
            "timeline_weeks": project_plan.timeline_weeks,
            "key_risks": [r.description for r in project_plan.risks[:3]]
        }

        await self.report_progress(
            progress_callback,
            30,
            "Designing architecture and selecting technologies",
            "architecture_design"
        )

        # Prompt pour l'architecture
        architecture_prompt = f"""Conçois une architecture technique complète pour le projet suivant.

CONTEXTE PROJET:
{json.dumps(context, indent=2)}

USER STORIES COMPLÈTES:
{json.dumps([s.model_dump() for s in project_plan.user_stories], indent=2)}

Génère une architecture optimale avec:
- Choix de stack justifiés (Next.js, FastAPI, PostgreSQL recommandés)
- Minimum 5 ADRs pour les décisions clés
- Diagramme C4 en Mermaid (Context + Container levels)
- Description du modèle de données avec entités et relations
- Estimation détaillée des coûts infrastructure (< 50$/mois)

IMPORTANT: Retourne UNIQUEMENT le JSON au format TechnicalArchitecture, sans texte d'introduction."""

        await self.report_progress(
            progress_callback,
            50,
            "Generating architecture decision records",
            "adr_generation"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=architecture_prompt,
            context=context,
            temperature=0.6,
            max_tokens=4000
        )

        await self.report_progress(
            progress_callback,
            70,
            "Parsing and validating architecture",
            "validation"
        )

        # Parse de la réponse
        try:
            architecture = await self.parse_llm_response(response, TechnicalArchitecture)
        except Exception as e:
            self.logger.error("Failed to parse TechnicalArchitecture", error=str(e))
            raise ValueError(f"Failed to generate valid architecture: {str(e)}")

        await self.report_progress(
            progress_callback,
            90,
            "Validating cost constraints",
            "cost_validation"
        )

        # Validation métier
        await self.validate_architecture(architecture, project_plan)

        await self.report_progress(
            progress_callback,
            100,
            "Architecture design completed",
            "completed"
        )

        self.logger.info(
            "Architecture generated successfully",
            stack_type=architecture.stack_type,
            technologies_count=len(architecture.technologies),
            adrs_count=len(architecture.adrs),
            total_cost=architecture.total_monthly_cost
        )

        return architecture

    async def validate_architecture(
        self,
        architecture: TechnicalArchitecture,
        project_plan: ProjectPlan
    ) -> bool:
        """
        Valide l'architecture selon les règles métier.

        Args:
            architecture: Architecture à valider
            project_plan: Plan de projet pour contexte

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si une règle est violée
        """
        errors = []

        # Règle 1: Minimum 5 technologies
        if len(architecture.technologies) < 5:
            errors.append(
                f"Minimum 5 technologies required, got {len(architecture.technologies)}"
            )

        # Règle 2: Minimum 3 ADRs
        if len(architecture.adrs) < 3:
            errors.append(f"Minimum 3 ADRs required, got {len(architecture.adrs)}")

        # Règle 3: Budget total < 50$/mois
        if architecture.total_monthly_cost > 50:
            errors.append(
                f"Cost exceeds 50$/month limit: ${architecture.total_monthly_cost}"
            )

        # Règle 4: Cohérence avec le budget du projet
        if architecture.total_monthly_cost > project_plan.budget_monthly:
            errors.append(
                f"Architecture cost (${architecture.total_monthly_cost}) exceeds "
                f"project budget (${project_plan.budget_monthly})"
            )

        # Règle 5: Diagramme C4 présent
        if not architecture.c4_diagram_mermaid or len(architecture.c4_diagram_mermaid) < 50:
            errors.append("C4 diagram must be a valid Mermaid diagram")

        # Règle 6: Catégories de technologies essentielles
        categories = {tech.category for tech in architecture.technologies}
        required_categories = {"Frontend", "Backend", "Database"}
        if architecture.stack_type in ["Web", "Fullstack"]:
            missing = required_categories - categories
            if missing:
                errors.append(f"Missing essential technology categories: {missing}")

        if errors:
            self.logger.error("Architecture validation failed", errors=errors)
            raise ValueError(f"Architecture validation failed: {'; '.join(errors)}")

        return True
