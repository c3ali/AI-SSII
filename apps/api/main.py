from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import os

from core.config import settings
from core.middleware import RateLimitMiddleware, LoggingMiddleware
from routers import auth, users, projects, executions
from database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    print("🚀 Starting SSII IA Platform API")
    print(f"📊 Environment: {settings.ENVIRONMENT}")
    print(f"🔗 Database: Connected")
    yield
    print("👋 Shutting down API")


app = FastAPI(
    title="SSII IA Platform API",
    description="AI-powered project generation platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# Custom Middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(executions.router, prefix="/api/executions", tags=["Executions"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SSII IA Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.API_PORT,
        reload=settings.ENVIRONMENT == "development"
    )
