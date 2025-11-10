"""
Agent Director - Directeur de Projet
Analyse le brief client et génère un plan de projet détaillé avec user stories,
estimations, analyse de risques et budget.
"""
from typing import Optional, Callable, List, Dict, Any
import json

from .base import BaseAgent
from schemas.agents import ProjectPlan, UserStory, Risk
from config import get_logger


logger = get_logger(__name__)


class DirectorAgent(BaseAgent):
    """
    Agent Director - Directeur de Projet certifié PMP.

    Responsabilités:
    - Analyser le brief client
    - Créer des user stories au format Gherkin
    - Estimer avec méthode 3 points (optimiste/réaliste/pessimiste)
    - Prioriser selon MoSCoW (Must/Should/Could/Won't)
    - Analyser les risques avec mitigation
    - Proposer un budget < 50€/mois
    - Établir une timeline avec buffer 20%
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Directeur de Projet senior certifié PMP avec 15 ans d'expérience en SSII.
Tu analyses les briefs clients et génères des plans de projet détaillés et réalistes.

## OBJECTIF
Pour chaque brief client, tu génères un plan de projet complet et structuré.

## MÉTHODOLOGIE

### 1. ANALYSE DU BRIEF
- Identifier les objectifs métier (SMART: Spécifique, Mesurable, Atteignable, Réaliste, Temporel)
- Extraire les fonctionnalités clés
- Comprendre les contraintes (budget, délais, technique)
- Identifier les stakeholders

### 2. USER STORIES (Format Gherkin)
Créer MINIMUM 5 user stories détaillées avec:
- **Titre**: Descriptif et concis
- **En tant que** (As a): Rôle utilisateur
- **Je veux** (I want): Action souhaitée
- **Afin de** (So that): Bénéfice métier
- **Critères d'acceptation** (Given/When/Then): Scénarios de test
- **Priorité MoSCoW**:
  * Must: Fonctionnalité critique
  * Should: Important mais pas bloquant
  * Could: Nice to have
  * Won't: Hors scope actuel
- **Estimation 3 points** (en heures):
  * Optimiste: Meilleur scénario
  * Réaliste: Scénario probable
  * Pessimiste: Pire scénario

**RÈGLES STRICTES**:
- Chaque tâche doit être < 4 heures (réaliste)
- Si > 4h, découper en sous-stories
- Minimum 5 user stories
- Au moins 3 Must-have

### 3. ANALYSE DE RISQUES
Identifier MINIMUM 3 risques avec:
- **Catégorie**: Technical/Business/Security/Performance
- **Description**: Nature du risque
- **Probabilité**: Low/Medium/High
- **Impact**: Low/Medium/High
- **Mitigation**: Plan concret d'atténuation

### 4. ANALYSE SWOT
- **Strengths** (Forces): Atouts du projet
- **Weaknesses** (Faiblesses): Points faibles
- **Opportunities** (Opportunités): Occasions à saisir
- **Threats** (Menaces): Risques externes

### 5. BUDGET
- Estimer le coût mensuel total (hébergement + services)
- **CONTRAINTE**: Maximum 50€/mois
- Détailler les postes de coût

### 6. TIMELINE
- Estimer la durée en semaines
- Ajouter un buffer de 20% minimum
- Découper en phases/sprints

## FORMAT DE SORTIE
Retourne UNIQUEMENT un JSON valide au format ProjectPlan (pas de texte avant/après):

{
  "title": "Nom du Projet",
  "objectives": ["Objectif 1 SMART", "Objectif 2 SMART", ...],
  "user_stories": [
    {
      "id": "US-001",
      "title": "User Registration",
      "as_a": "new user",
      "i_want": "to create an account",
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
    },
    ...
  ],
  "risks": [
    {
      "id": "RISK-001",
      "category": "Security",
      "description": "Potential SQL injection vulnerabilities",
      "probability": "Medium",
      "impact": "High",
      "mitigation": "Use ORM with parameterized queries"
    },
    ...
  ],
  "swot_analysis": {
    "strengths": ["Modern tech stack", ...],
    "weaknesses": ["Learning curve for team", ...],
    "opportunities": ["Growing market demand", ...],
    "threats": ["Established competitors", ...]
  },
  "budget_monthly": 45.0,
  "timeline_weeks": 8,
  "timeline_buffer_percentage": 20
}

## PRINCIPES CLÉS
- **Réalisme**: Estimations basées sur l'expérience
- **Détail**: Critères d'acceptation précis
- **Risques**: Identification proactive avec mitigation
- **Budget**: Optimisation des coûts (services gratuits/peu chers)
- **Qualité**: Stories testables et mesurables
"""

    async def execute(
        self,
        brief: str,
        progress_callback: Optional[Callable] = None
    ) -> ProjectPlan:
        """
        Analyse le brief et génère un ProjectPlan complet.

        Args:
            brief: Brief client (string)
            progress_callback: Callback pour la progression

        Returns:
            ProjectPlan: Plan de projet structuré

        Raises:
            ValueError: Si le brief est invalide ou la génération échoue
        """
        self.logger.info("Starting project analysis", brief_length=len(brief))

        # Validation du brief
        if not brief or len(brief) < 10:
            raise ValueError("Brief must be at least 10 characters long")

        await self.report_progress(
            progress_callback,
            10,
            "Analyzing brief and extracting requirements",
            "brief_analysis"
        )

        # 1. Analyse initiale du brief
        analysis_prompt = f"""Analyse le brief suivant et génère un plan de projet complet selon les règles définies.

BRIEF CLIENT:
{brief}

Génère un JSON strictement conforme au schéma ProjectPlan avec:
- Minimum 5 user stories détaillées avec estimations 3 points
- Minimum 3 risques avec mitigation
- Analyse SWOT complète (minimum 2 items par catégorie)
- Budget mensuel < 50€
- Timeline réaliste avec buffer 20%

IMPORTANT: Retourne UNIQUEMENT le JSON, sans texte d'introduction ni de conclusion."""

        await self.report_progress(
            progress_callback,
            30,
            "Generating user stories and requirements",
            "user_stories_generation"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=analysis_prompt,
            temperature=0.7,
            max_tokens=4000
        )

        await self.report_progress(
            progress_callback,
            60,
            "Parsing and validating project plan",
            "validation"
        )

        # Parse de la réponse en ProjectPlan
        try:
            project_plan = await self.parse_llm_response(response, ProjectPlan)
        except Exception as e:
            self.logger.error("Failed to parse ProjectPlan", error=str(e))
            raise ValueError(f"Failed to generate valid project plan: {str(e)}")

        await self.report_progress(
            progress_callback,
            80,
            "Validating business rules",
            "business_validation"
        )

        # Validation métier
        await self.validate_project_plan(project_plan)

        await self.report_progress(
            progress_callback,
            100,
            "Project plan generation completed",
            "completed"
        )

        self.logger.info(
            "Project plan generated successfully",
            user_stories_count=len(project_plan.user_stories),
            risks_count=len(project_plan.risks),
            budget=project_plan.budget_monthly,
            timeline_weeks=project_plan.timeline_weeks
        )

        return project_plan

    async def validate_project_plan(self, plan: ProjectPlan) -> bool:
        """
        Valide le ProjectPlan selon les règles métier.

        Args:
            plan: ProjectPlan à valider

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si une règle métier est violée
        """
        errors = []

        # Règle 1: Minimum 5 user stories
        if len(plan.user_stories) < 5:
            errors.append(f"Minimum 5 user stories required, got {len(plan.user_stories)}")

        # Règle 2: Chaque tâche < 4h (estimation réaliste)
        for story in plan.user_stories:
            if story.estimation_realistic > 4.0:
                errors.append(
                    f"Story {story.id} exceeds 4h limit: {story.estimation_realistic}h"
                )

        # Règle 3: Au moins 3 Must-have
        must_have_count = sum(1 for s in plan.user_stories if s.priority == "Must")
        if must_have_count < 3:
            errors.append(f"Minimum 3 Must-have stories required, got {must_have_count}")

        # Règle 4: Minimum 3 risques
        if len(plan.risks) < 3:
            errors.append(f"Minimum 3 risks required, got {len(plan.risks)}")

        # Règle 5: Budget < 50€/mois
        if plan.budget_monthly > 50:
            errors.append(f"Budget exceeds 50€/month limit: {plan.budget_monthly}€")

        # Règle 6: Buffer >= 20%
        if plan.timeline_buffer_percentage < 20:
            errors.append(
                f"Timeline buffer must be >= 20%, got {plan.timeline_buffer_percentage}%"
            )

        # Règle 7: SWOT analysis complète
        swot = plan.swot_analysis
        for category in ["strengths", "weaknesses", "opportunities", "threats"]:
            if category not in swot or len(swot[category]) < 2:
                errors.append(f"SWOT {category} must have at least 2 items")

        if errors:
            self.logger.error("Project plan validation failed", errors=errors)
            raise ValueError(f"Project plan validation failed: {'; '.join(errors)}")

        return True

    async def estimate_total_hours(self, plan: ProjectPlan) -> Dict[str, float]:
        """
        Calcule les estimations totales du projet.

        Args:
            plan: ProjectPlan

        Returns:
            Dict avec estimations optimiste/réaliste/pessimiste
        """
        total_optimistic = sum(s.estimation_optimistic for s in plan.user_stories)
        total_realistic = sum(s.estimation_realistic for s in plan.user_stories)
        total_pessimistic = sum(s.estimation_pessimistic for s in plan.user_stories)

        return {
            "optimistic_hours": total_optimistic,
            "realistic_hours": total_realistic,
            "pessimistic_hours": total_pessimistic,
            "stories_count": len(plan.user_stories)
        }
