from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ProjectStatus(str, Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class Stack(str, Enum):
    NEXTJS = "NEXTJS"
    REACT_NATIVE = "REACT_NATIVE"
    EXPO = "EXPO"
    NUXT = "NUXT"
    FLUTTER = "FLUTTER"


class ProjectBase(BaseModel):
    name: str
    brief: str
    stack: Stack = Stack.NEXTJS
    budget: float = 50.0
    timeline: int = 7


class ProjectCreate(ProjectBase):
    config: Optional[Dict[str, Any]] = {}


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    brief: Optional[str] = None
    status: Optional[ProjectStatus] = None
    config: Optional[Dict[str, Any]] = None
    stack: Optional[Stack] = None
    budget: Optional[float] = None
    timeline: Optional[int] = None


class ProjectResponse(ProjectBase):
    id: str
    status: ProjectStatus
    userId: str
    config: Dict[str, Any]
    plan: Optional[Dict[str, Any]] = None
    architecture: Optional[Dict[str, Any]] = None
    codebase: Optional[Dict[str, Any]] = None
    security: Optional[Dict[str, Any]] = None
    tests: Optional[Dict[str, Any]] = None
    deployment: Optional[Dict[str, Any]] = None
    githubUrl: Optional[str] = None
    deployUrl: Optional[str] = None
    docsUrl: Optional[str] = None
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class ProjectList(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int
