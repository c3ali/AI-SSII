"""
Database package for SSII IA Platform API
"""

from .connection import (
    engine,
    SessionLocal,
    Base,
    get_db,
    db_session,
    init_db,
    check_connection
)

from .models import (
    # Enums
    Role,
    ProjectStatus,
    Agent,
    ExecutionStatus,
    Stack,
    TemplateCategory,
    # Models
    User,
    Project,
    Execution,
    Metrics,
    Template,
    Comment,
    File
)

__all__ = [
    # Connection
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "db_session",
    "init_db",
    "check_connection",
    # Enums
    "Role",
    "ProjectStatus",
    "Agent",
    "ExecutionStatus",
    "Stack",
    "TemplateCategory",
    # Models
    "User",
    "Project",
    "Execution",
    "Metrics",
    "Template",
    "Comment",
    "File",
]
