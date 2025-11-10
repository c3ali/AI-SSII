"""
Routes API pour la gestion des projets.
CRUD complet et démarrage de workflows.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import asyncio

from config import get_logger
from schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    ProjectList,
    ProjectStats,
    WorkflowInput,
    WorkflowResponse,
    WorkflowStatus
)
from services import (
    get_db_session,
    Project as ProjectModel,
    Execution,
    get_openai_service,
    get_redis_service
)
from workflow import WorkflowOrchestrator


logger = get_logger(__name__)
router = APIRouter()


# ============================================================================
# ENDPOINTS CRUD PROJECTS
# ============================================================================

@router.post("/", response_model=ProjectSchema, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Crée un nouveau projet.

    Args:
        project_data: Données du projet
        db: Session de base de données

    Returns:
        Project: Projet créé
    """
    logger.info("Creating new project", name=project_data.name)

    # Créer le projet
    project = ProjectModel(
        name=project_data.name,
        brief=project_data.brief,
        description=project_data.description,
        tags=project_data.tags,
        metadata=project_data.metadata,
        status="draft"
    )

    db.add(project)
    await db.commit()
    await db.refresh(project)

    logger.info("Project created", project_id=project.id)

    # Convertir en schéma Pydantic
    return _convert_project_to_schema(project)


@router.get("/", response_model=ProjectList)
async def list_projects(
    page: int = 1,
    page_size: int = 20,
    status: str = None,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Liste les projets avec pagination.

    Args:
        page: Numéro de page (commence à 1)
        page_size: Taille de la page (max 100)
        status: Filtre par statut (optionnel)
        db: Session de base de données

    Returns:
        ProjectList: Liste paginée de projets
    """
    page_size = min(page_size, 100)  # Max 100 items par page
    offset = (page - 1) * page_size

    # Construire la requête
    query = select(ProjectModel)

    if status:
        query = query.where(ProjectModel.status == status)

    # Compter le total
    count_query = select(func.count()).select_from(ProjectModel)
    if status:
        count_query = count_query.where(ProjectModel.status == status)

    total = await db.scalar(count_query)

    # Récupérer les projets
    query = query.order_by(ProjectModel.created_at.desc()).offset(offset).limit(page_size)
    result = await db.execute(query)
    projects = result.scalars().all()

    return ProjectList(
        projects=[_convert_project_to_schema(p) for p in projects],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(offset + len(projects)) < total
    )


@router.get("/stats", response_model=ProjectStats)
async def get_project_stats(db: AsyncSession = Depends(get_db_session)):
    """
    Récupère les statistiques globales des projets.

    Args:
        db: Session de base de données

    Returns:
        ProjectStats: Statistiques
    """
    # Total
    total = await db.scalar(select(func.count()).select_from(ProjectModel))

    # Par statut
    by_status = {}
    result = await db.execute(
        select(ProjectModel.status, func.count(ProjectModel.id))
        .group_by(ProjectModel.status)
    )
    for status, count in result:
        by_status[status] = count

    # Projets complétés ce mois (simplified)
    completed_this_month = by_status.get("completed", 0)

    # Temps moyen de complétion (simplified - à améliorer)
    average_completion_time_hours = 24.5

    # Taux de succès
    completed = by_status.get("completed", 0)
    failed = by_status.get("failed", 0)
    success_rate = (completed / (completed + failed) * 100) if (completed + failed) > 0 else 100.0

    return ProjectStats(
        total_projects=total,
        by_status=by_status,
        completed_this_month=completed_this_month,
        average_completion_time_hours=average_completion_time_hours,
        success_rate_percentage=success_rate
    )


@router.get("/{project_id}", response_model=ProjectSchema)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Récupère un projet par ID.

    Args:
        project_id: ID du projet
        db: Session de base de données

    Returns:
        Project: Projet trouvé

    Raises:
        HTTPException 404: Si le projet n'existe pas
    """
    project = await db.get(ProjectModel, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return _convert_project_to_schema(project)


@router.patch("/{project_id}", response_model=ProjectSchema)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Met à jour un projet.

    Args:
        project_id: ID du projet
        project_data: Données à mettre à jour
        db: Session de base de données

    Returns:
        Project: Projet mis à jour

    Raises:
        HTTPException 404: Si le projet n'existe pas
    """
    project = await db.get(ProjectModel, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Mettre à jour les champs fournis
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)

    logger.info("Project updated", project_id=project_id)

    return _convert_project_to_schema(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Supprime un projet.

    Args:
        project_id: ID du projet
        db: Session de base de données

    Raises:
        HTTPException 404: Si le projet n'existe pas
    """
    project = await db.get(ProjectModel, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()

    logger.info("Project deleted", project_id=project_id)


# ============================================================================
# WORKFLOW EXECUTION
# ============================================================================

@router.post("/{project_id}/start-workflow", response_model=WorkflowResponse)
async def start_workflow(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Démarre le workflow de génération pour un projet.

    Args:
        project_id: ID du projet
        background_tasks: Background tasks FastAPI
        db: Session de base de données

    Returns:
        WorkflowResponse: Informations sur le workflow démarré

    Raises:
        HTTPException 404: Si le projet n'existe pas
        HTTPException 400: Si un workflow est déjà en cours
    """
    # Vérifier que le projet existe
    project = await db.get(ProjectModel, project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Vérifier qu'aucun workflow n'est en cours
    if project.workflow_status == "running":
        raise HTTPException(
            status_code=400,
            detail="A workflow is already running for this project"
        )

    # Générer un workflow ID
    import uuid
    workflow_id = f"wf_{uuid.uuid4().hex[:12]}"

    # Mettre à jour le projet
    project.current_workflow_id = workflow_id
    project.workflow_status = "running"
    project.status = "in_progress"
    await db.commit()

    logger.info(
        "Starting workflow",
        project_id=project_id,
        workflow_id=workflow_id
    )

    # Lancer le workflow en background
    background_tasks.add_task(
        _execute_workflow_background,
        workflow_id,
        project_id,
        project.brief
    )

    return WorkflowResponse(
        workflow_id=workflow_id,
        project_id=project_id,
        status=WorkflowStatus.RUNNING,
        message="Workflow started successfully",
        websocket_url=f"ws://localhost:{settings.api_port}/ws/{workflow_id}"
    )


async def _execute_workflow_background(
    workflow_id: str,
    project_id: str,
    brief: str
):
    """
    Exécute le workflow en arrière-plan.

    Args:
        workflow_id: ID du workflow
        project_id: ID du projet
        brief: Brief du projet
    """
    from main import websocket_manager

    logger.info("Workflow background task started", workflow_id=workflow_id)

    # Callback pour envoyer les updates via WebSocket
    async def progress_callback(data: dict):
        await websocket_manager.broadcast_to_workflow(workflow_id, {
            "type": "progress",
            **data
        })

    try:
        # Créer l'orchestrateur
        openai_service = get_openai_service()
        orchestrator = WorkflowOrchestrator(
            openai_service=openai_service,
            progress_callback=progress_callback,
            enable_human_review=False  # Désactivé pour démo
        )

        # Exécuter le workflow
        final_state = await orchestrator.execute(
            brief=brief,
            project_id=project_id,
            workflow_id=workflow_id
        )

        # Mettre à jour le projet avec les résultats
        from services import get_database_service
        db_service = get_database_service()

        async with db_service.session() as db:
            project = await db.get(ProjectModel, project_id)
            if project:
                project.workflow_status = "completed"
                project.status = "completed"
                project.outputs = {
                    "director": final_state.get("director_output").model_dump() if final_state.get("director_output") else None,
                    "architect": final_state.get("architect_output").model_dump() if final_state.get("architect_output") else None,
                    "developer": final_state.get("developer_output").model_dump() if final_state.get("developer_output") else None,
                    "security": final_state.get("security_output").model_dump() if final_state.get("security_output") else None,
                    "qa": final_state.get("qa_output").model_dump() if final_state.get("qa_output") else None,
                    "devops": final_state.get("devops_output").model_dump() if final_state.get("devops_output") else None,
                }
                await db.commit()

        # Notifier via WebSocket
        await websocket_manager.broadcast_to_workflow(workflow_id, {
            "type": "workflow_completed",
            "workflow_id": workflow_id,
            "project_id": project_id,
            "message": "Workflow completed successfully"
        })

        logger.info("Workflow completed successfully", workflow_id=workflow_id)

    except Exception as e:
        logger.error(
            "Workflow failed",
            workflow_id=workflow_id,
            error=str(e),
            exc_info=True
        )

        # Mettre à jour le statut
        from services import get_database_service
        db_service = get_database_service()

        async with db_service.session() as db:
            project = await db.get(ProjectModel, project_id)
            if project:
                project.workflow_status = "failed"
                project.status = "failed"
                await db.commit()

        # Notifier l'erreur via WebSocket
        await websocket_manager.broadcast_to_workflow(workflow_id, {
            "type": "workflow_failed",
            "workflow_id": workflow_id,
            "error": str(e)
        })


# ============================================================================
# HELPERS
# ============================================================================

def _convert_project_to_schema(project: ProjectModel) -> ProjectSchema:
    """
    Convertit un modèle ProjectModel en schéma ProjectSchema.

    Args:
        project: Modèle de base de données

    Returns:
        ProjectSchema: Schéma Pydantic
    """
    from schemas.project import ProjectOutputs

    return ProjectSchema(
        id=project.id,
        name=project.name,
        brief=project.brief,
        description=project.description,
        status=project.status,
        current_workflow_id=project.current_workflow_id,
        workflow_status=project.workflow_status,
        outputs=ProjectOutputs(**project.outputs) if project.outputs else ProjectOutputs(),
        tags=project.tags or [],
        metadata=project.metadata or {},
        created_at=project.created_at,
        updated_at=project.updated_at,
        completed_at=project.completed_at,
        created_by=project.created_by
    )
