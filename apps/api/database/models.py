"""
SQLAlchemy models for SSII IA Platform
Mirrors the Prisma schema for Python API compatibility
"""

from sqlalchemy import (
    Column, String, Text, JSON, DateTime, Float, Integer,
    ForeignKey, Enum as SQLEnum, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .connection import Base


# ============================================
# ENUMS
# ============================================

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    DEVELOPER = "DEVELOPER"


class ProjectStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class Agent(str, enum.Enum):
    DIRECTOR = "DIRECTOR"
    ARCHITECT = "ARCHITECT"
    DEVELOPER = "DEVELOPER"
    SECURITY = "SECURITY"
    QA = "QA"
    DEVOPS = "DEVOPS"


class ExecutionStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class Stack(str, enum.Enum):
    NEXTJS = "NEXTJS"
    REACT_NATIVE = "REACT_NATIVE"
    EXPO = "EXPO"
    NUXT = "NUXT"
    FLUTTER = "FLUTTER"


class TemplateCategory(str, enum.Enum):
    ECOMMERCE = "ECOMMERCE"
    SAAS = "SAAS"
    LANDING = "LANDING"
    DASHBOARD = "DASHBOARD"
    MOBILE = "MOBILE"
    API = "API"


# ============================================
# MODELS
# ============================================

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    name = Column(String)
    role = Column(SQLEnum(Role), default=Role.USER, nullable=False)
    avatar = Column(String)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime)

    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="user")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    brief = Column(Text, nullable=False)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT, nullable=False, index=True)

    # Owner
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Configuration
    config = Column(JSON, default={})
    stack = Column(SQLEnum(Stack), default=Stack.NEXTJS, nullable=False)
    budget = Column(Float, default=50)
    timeline = Column(Integer, default=7)  # days

    # Agent outputs
    plan = Column(JSON)
    architecture = Column(JSON)
    codebase = Column(JSON)
    security = Column(JSON)
    tests = Column(JSON)
    deployment = Column(JSON)

    # Generated URLs
    github_url = Column(String)
    deploy_url = Column(String)
    docs_url = Column(String)

    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    executions = relationship("Execution", back_populates="project", cascade="all, delete-orphan")
    metrics = relationship("Metrics", back_populates="project", uselist=False, cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="project")
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    files = relationship("File", back_populates="project", cascade="all, delete-orphan")


class Execution(Base):
    __tablename__ = "executions"

    id = Column(String, primary_key=True)

    # Links
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"))

    # Agent info
    agent = Column(SQLEnum(Agent), nullable=False, index=True)
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False, index=True)
    progress = Column(Integer, default=0)

    # Data
    input = Column(JSON, nullable=False)
    output = Column(JSON)
    error = Column(Text)
    logs = Column(JSON, default=[])

    # Performance
    duration = Column(Integer)  # milliseconds
    tokens_used = Column(Integer)
    cost = Column(Float)

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="executions")
    user = relationship("User", back_populates="executions")


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(String, primary_key=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Code quality
    coverage = Column(Float)  # 0-100
    complexity = Column(Float)  # Cyclomatic
    lines_of_code = Column(Integer)
    tests_passed = Column(Integer)
    tests_total = Column(Integer)

    # Performance
    lighthouse = Column(Float)  # 0-100
    bundle_size = Column(Float)  # KB
    load_time = Column(Float)  # ms

    # Security
    owasp_score = Column(Float)  # 0-10
    vulnerabilities = Column(Integer)

    # Costs
    estimated_cost = Column(Float)  # €/month
    api_tokens_used = Column(Integer)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="metrics")


class Template(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(TemplateCategory), nullable=False, index=True)

    # Source
    project_id = Column(String, ForeignKey("projects.id", ondelete="SET NULL"))

    # Content
    brief = Column(Text, nullable=False)
    config = Column(JSON, nullable=False)
    stack = Column(SQLEnum(Stack), nullable=False)

    # Stats
    usage_count = Column(Integer, default=0, index=True)
    rating = Column(Float)  # 0-5

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="templates")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True)
    content = Column(Text, nullable=False)

    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="comments")
    user = relationship("User", back_populates="comments")


class File(Base):
    __tablename__ = "files"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    mimetype = Column(String, nullable=False)
    size = Column(Integer, nullable=False)  # bytes
    url = Column(String, nullable=False)

    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)

    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="files")
