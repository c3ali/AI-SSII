"""
Orchestrateur LangGraph pour coordonner l'exécution des 6 agents.
Gère le workflow complet de génération d'application.
"""
from typing import Dict, Any, Optional, Callable
from datetime import datetime
import uuid

from langgraph.graph import StateGraph, END
from config import get_logger
from .states import WorkflowState
from agents import (
    DirectorAgent,
    ArchitectAgent,
    DeveloperAgent,
    SecurityAgent,
    QAAgent,
    DevOpsAgent
)


logger = get_logger(__name__)


class WorkflowOrchestrator:
    """
    Orchestrateur principal du workflow utilisant LangGraph.

    Le workflow suit ce schéma:
    1. Director → Analyse brief → ProjectPlan
    2. Architect → Conception architecture → TechnicalArchitecture
    3. [Checkpoint humain 1 optionnel]
    4. Developer → Génération code → CodebaseStructure
    5. Security → Analyse sécurité → SecurityReport
    6. QA → Génération tests → TestSuite
    7. DevOps → Plan déploiement → DeploymentPlan
    8. [Checkpoint humain 2 optionnel]
    9. END
    """

    def __init__(
        self,
        openai_service: Any,
        progress_callback: Optional[Callable] = None,
        enable_human_review: bool = True
    ):
        """
        Initialise l'orchestrateur.

        Args:
            openai_service: Service OpenAI pour les agents
            progress_callback: Callback pour reporter la progression
            enable_human_review: Active les checkpoints humains
        """
        self.openai_service = openai_service
        self.progress_callback = progress_callback
        self.enable_human_review = enable_human_review
        self.logger = get_logger(__name__)

        # Initialiser les agents
        self.director = DirectorAgent(openai_service)
        self.architect = ArchitectAgent(openai_service)
        self.developer = DeveloperAgent(openai_service)
        self.security = SecurityAgent(openai_service)
        self.qa = QAAgent(openai_service)
        self.devops = DevOpsAgent(openai_service)

        # Construire le graph
        self.graph = self._build_graph()
        self.app = self.graph.compile()

    def _build_graph(self) -> StateGraph:
        """
        Construit le graph LangGraph avec tous les nœuds et edges.

        Returns:
            StateGraph: Graph configuré
        """
        # Créer le graph avec l'état
        workflow = StateGraph(WorkflowState)

        # Ajouter les nœuds (agents)
        workflow.add_node("director", self._run_director)
        workflow.add_node("architect", self._run_architect)
        workflow.add_node("developer", self._run_developer)
        workflow.add_node("security", self._run_security)
        workflow.add_node("qa", self._run_qa)
        workflow.add_node("devops", self._run_devops)

        # Ajouter les checkpoints humains si activés
        if self.enable_human_review:
            workflow.add_node("human_review_1", self._human_checkpoint)
            workflow.add_node("human_review_2", self._human_checkpoint)

        # Définir le point d'entrée
        workflow.set_entry_point("director")

        # Définir les transitions (edges)
        workflow.add_edge("director", "architect")

        if self.enable_human_review:
            workflow.add_edge("architect", "human_review_1")
            workflow.add_conditional_edges(
                "human_review_1",
                self._should_continue_after_review,
                {
                    "continue": "developer",
                    "retry": "architect",
                    "stop": END
                }
            )
        else:
            workflow.add_edge("architect", "developer")

        # Chaîne Developer → Security → QA → DevOps
        workflow.add_edge("developer", "security")
        workflow.add_edge("security", "qa")
        workflow.add_edge("qa", "devops")

        if self.enable_human_review:
            workflow.add_edge("devops", "human_review_2")
            workflow.add_conditional_edges(
                "human_review_2",
                self._should_continue_after_review,
                {
                    "continue": END,
                    "retry": "devops",
                    "stop": END
                }
            )
        else:
            workflow.add_edge("devops", END)

        return workflow

    async def _run_director(self, state: WorkflowState) -> WorkflowState:
        """
        Exécute l'agent Director.

        Args:
            state: État actuel du workflow

        Returns:
            WorkflowState: État mis à jour
        """
        self.logger.info("Running Director agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "director"
            state["progress_percentage"] = 10

            await self._report_progress(
                state["workflow_id"],
                "director",
                "started",
                10
            )

            # Exécuter l'agent
            output = await self.director.run_with_retry(
                state["brief"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "director"
                )
            )

            state["director_output"] = output
            state["progress_percentage"] = 20

            await self._report_progress(
                state["workflow_id"],
                "director",
                "completed",
                20
            )

            self.logger.info(
                "Director agent completed",
                workflow_id=state["workflow_id"],
                user_stories=len(output.user_stories)
            )

        except Exception as e:
            state["error_message"] = f"Director failed: {str(e)}"
            self.logger.error(
                "Director agent failed",
                workflow_id=state["workflow_id"],
                error=str(e)
            )
            raise

        return state

    async def _run_architect(self, state: WorkflowState) -> WorkflowState:
        """Exécute l'agent Architect."""
        self.logger.info("Running Architect agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "architect"
            state["progress_percentage"] = 30

            await self._report_progress(
                state["workflow_id"],
                "architect",
                "started",
                30
            )

            output = await self.architect.run_with_retry(
                state["director_output"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "architect"
                )
            )

            state["architect_output"] = output
            state["progress_percentage"] = 40

            await self._report_progress(
                state["workflow_id"],
                "architect",
                "completed",
                40
            )

            self.logger.info("Architect agent completed", workflow_id=state["workflow_id"])

        except Exception as e:
            state["error_message"] = f"Architect failed: {str(e)}"
            self.logger.error("Architect agent failed", error=str(e))
            raise

        return state

    async def _run_developer(self, state: WorkflowState) -> WorkflowState:
        """Exécute l'agent Developer."""
        self.logger.info("Running Developer agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "developer"
            state["progress_percentage"] = 50

            await self._report_progress(
                state["workflow_id"],
                "developer",
                "started",
                50
            )

            output = await self.developer.run_with_retry(
                state["architect_output"],
                state["director_output"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "developer"
                )
            )

            state["developer_output"] = output
            state["progress_percentage"] = 60

            await self._report_progress(
                state["workflow_id"],
                "developer",
                "completed",
                60
            )

            self.logger.info("Developer agent completed", workflow_id=state["workflow_id"])

        except Exception as e:
            state["error_message"] = f"Developer failed: {str(e)}"
            self.logger.error("Developer agent failed", error=str(e))
            raise

        return state

    async def _run_security(self, state: WorkflowState) -> WorkflowState:
        """Exécute l'agent Security."""
        self.logger.info("Running Security agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "security"
            state["progress_percentage"] = 70

            await self._report_progress(
                state["workflow_id"],
                "security",
                "started",
                70
            )

            output = await self.security.run_with_retry(
                state["developer_output"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "security"
                )
            )

            state["security_output"] = output
            state["progress_percentage"] = 75

            await self._report_progress(
                state["workflow_id"],
                "security",
                "completed",
                75
            )

            self.logger.info("Security agent completed", workflow_id=state["workflow_id"])

        except Exception as e:
            state["error_message"] = f"Security failed: {str(e)}"
            self.logger.error("Security agent failed", error=str(e))
            raise

        return state

    async def _run_qa(self, state: WorkflowState) -> WorkflowState:
        """Exécute l'agent QA."""
        self.logger.info("Running QA agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "qa"
            state["progress_percentage"] = 80

            await self._report_progress(
                state["workflow_id"],
                "qa",
                "started",
                80
            )

            output = await self.qa.run_with_retry(
                state["developer_output"],
                state["director_output"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "qa"
                )
            )

            state["qa_output"] = output
            state["progress_percentage"] = 85

            await self._report_progress(
                state["workflow_id"],
                "qa",
                "completed",
                85
            )

            self.logger.info("QA agent completed", workflow_id=state["workflow_id"])

        except Exception as e:
            state["error_message"] = f"QA failed: {str(e)}"
            self.logger.error("QA agent failed", error=str(e))
            raise

        return state

    async def _run_devops(self, state: WorkflowState) -> WorkflowState:
        """Exécute l'agent DevOps."""
        self.logger.info("Running DevOps agent", workflow_id=state["workflow_id"])

        try:
            state["current_agent"] = "devops"
            state["progress_percentage"] = 90

            await self._report_progress(
                state["workflow_id"],
                "devops",
                "started",
                90
            )

            output = await self.devops.run_with_retry(
                state["architect_output"],
                progress_callback=self._create_agent_progress_callback(
                    state["workflow_id"],
                    "devops"
                )
            )

            state["devops_output"] = output
            state["progress_percentage"] = 95

            await self._report_progress(
                state["workflow_id"],
                "devops",
                "completed",
                95
            )

            self.logger.info("DevOps agent completed", workflow_id=state["workflow_id"])

        except Exception as e:
            state["error_message"] = f"DevOps failed: {str(e)}"
            self.logger.error("DevOps agent failed", error=str(e))
            raise

        return state

    async def _human_checkpoint(self, state: WorkflowState) -> WorkflowState:
        """
        Point de validation humaine.
        En production, ceci pauserait le workflow pour attendre une validation.
        """
        self.logger.info(
            "Human review checkpoint",
            workflow_id=state["workflow_id"],
            current_agent=state["current_agent"]
        )

        # Pour le moment, on approuve automatiquement
        # En production, cela attendrait une action utilisateur via API/WebSocket
        state["human_review_approved"] = True
        state["human_review_comments"] = "Auto-approved for demo"

        return state

    def _should_continue_after_review(self, state: WorkflowState) -> str:
        """
        Détermine la prochaine étape après un checkpoint humain.

        Args:
            state: État actuel

        Returns:
            str: "continue", "retry", ou "stop"
        """
        if state.get("human_review_approved"):
            return "continue"
        elif state.get("human_review_comments") and "retry" in state["human_review_comments"].lower():
            return "retry"
        else:
            return "stop"

    async def _report_progress(
        self,
        workflow_id: str,
        agent_name: str,
        status: str,
        percentage: int
    ):
        """
        Reporte la progression via le callback.

        Args:
            workflow_id: ID du workflow
            agent_name: Nom de l'agent
            status: Statut (started, progress, completed, failed)
            percentage: Pourcentage de complétion (0-100)
        """
        if self.progress_callback:
            try:
                await self.progress_callback({
                    "workflow_id": workflow_id,
                    "agent_name": agent_name,
                    "status": status,
                    "percentage": percentage,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                self.logger.warning("Failed to report progress", error=str(e))

    def _create_agent_progress_callback(
        self,
        workflow_id: str,
        agent_name: str
    ) -> Callable:
        """
        Crée un callback de progression spécifique à un agent.

        Args:
            workflow_id: ID du workflow
            agent_name: Nom de l'agent

        Returns:
            Callable: Fonction callback
        """
        async def callback(data: Dict[str, Any]):
            await self._report_progress(
                workflow_id,
                agent_name,
                "progress",
                data.get("percentage", 0)
            )

        return callback

    async def execute(
        self,
        brief: str,
        project_id: Optional[str] = None,
        workflow_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Exécute le workflow complet.

        Args:
            brief: Brief du projet
            project_id: ID du projet (optionnel, généré si absent)
            workflow_id: ID du workflow (optionnel, généré si absent)

        Returns:
            Dict: État final avec tous les outputs des agents

        Raises:
            Exception: Si le workflow échoue
        """
        # Générer les IDs si nécessaire
        workflow_id = workflow_id or f"wf_{uuid.uuid4().hex[:12]}"
        project_id = project_id or f"proj_{uuid.uuid4().hex[:12]}"

        self.logger.info(
            "Starting workflow execution",
            workflow_id=workflow_id,
            project_id=project_id
        )

        # Initialiser l'état
        initial_state: WorkflowState = {
            "brief": brief,
            "workflow_id": workflow_id,
            "project_id": project_id,
            "director_output": None,
            "architect_output": None,
            "developer_output": None,
            "security_output": None,
            "qa_output": None,
            "devops_output": None,
            "current_agent": None,
            "error_message": None,
            "retry_count": 0,
            "human_review_required": self.enable_human_review,
            "human_review_approved": None,
            "human_review_comments": None,
            "progress_percentage": 0,
            "metadata": {}
        }

        # Exécuter le graph
        try:
            final_state = await self.app.ainvoke(initial_state)

            self.logger.info(
                "Workflow execution completed",
                workflow_id=workflow_id
            )

            return final_state

        except Exception as e:
            self.logger.error(
                "Workflow execution failed",
                workflow_id=workflow_id,
                error=str(e)
            )
            raise
