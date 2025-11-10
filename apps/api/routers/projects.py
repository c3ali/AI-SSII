from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import math

from database import SessionLocal, Project as ProjectModel
from schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectList
from core.security import get_current_user_id

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new project"""
    db_project = ProjectModel(
        name=project_data.name,
        brief=project_data.brief,
        stack=project_data.stack,
        budget=project_data.budget,
        timeline=project_data.timeline,
        config=project_data.config or {},
        userId=user_id,
        status="DRAFT"
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return ProjectResponse.model_validate(db_project)


@router.get("", response_model=ProjectList)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """List user's projects"""
    query = db.query(ProjectModel).filter(ProjectModel.userId == user_id)

    if status:
        query = query.filter(ProjectModel.status == status)

    # Count total
    total = query.count()

    # Paginate
    projects = query.order_by(ProjectModel.createdAt.desc()) \
        .offset((page - 1) * page_size) \
        .limit(page_size) \
        .all()

    return ProjectList(
        items=[ProjectResponse.model_validate(p) for p in projects],
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=math.ceil(total / page_size)
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get project by ID"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.userId == user_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update project"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.userId == user_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update fields
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.brief is not None:
        project.brief = project_data.brief
    if project_data.status is not None:
        project.status = project_data.status
    if project_data.config is not None:
        project.config = project_data.config
    if project_data.stack is not None:
        project.stack = project_data.stack
    if project_data.budget is not None:
        project.budget = project_data.budget
    if project_data.timeline is not None:
        project.timeline = project_data.timeline

    db.commit()
    db.refresh(project)

    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete project"""
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.userId == user_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return None
