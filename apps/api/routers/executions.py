from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, Execution as ExecutionModel, Project as ProjectModel
from core.security import get_current_user_id

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/project/{project_id}")
async def list_project_executions(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """List executions for a project"""
    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.userId == user_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    executions = db.query(ExecutionModel).filter(
        ExecutionModel.projectId == project_id
    ).order_by(ExecutionModel.createdAt.desc()).all()

    return {"items": executions}


@router.get("/{execution_id}")
async def get_execution(
    execution_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get execution by ID"""
    execution = db.query(ExecutionModel).filter(
        ExecutionModel.id == execution_id
    ).first()

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )

    # Verify project ownership
    project = db.query(ProjectModel).filter(
        ProjectModel.id == execution.projectId,
        ProjectModel.userId == user_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return execution
