# SSII IA Platform - Database Layer

Complete database infrastructure for the SSII IA Platform, featuring PostgreSQL, Prisma ORM, Redis, and comprehensive tooling.

## Overview

This repository contains the complete database layer implementation for the SSII IA Platform, designed to support AI-powered project generation with multi-agent architecture.

### Features

- **PostgreSQL 15** database with optimized configuration
- **Prisma ORM** for type-safe database access
- **Redis 7** for caching and session management
- **pgAdmin 4** for database management
- **SQLAlchemy** models for Python API compatibility
- Comprehensive seed data and migrations
- Backup and restore utilities
- Health monitoring scripts

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+ (for API backend)

### 1. Clone and Setup

```bash
# Navigate to project
cd AI-SSII

# Copy environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

### 2. Start Services

```bash
# Start PostgreSQL, Redis, and pgAdmin
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Initialize Database

```bash
cd packages/database

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 4. Access Services

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **pgAdmin**: http://localhost:5050
  - Email: `admin@ssii.com`
  - Password: `admin`

## Project Structure

```
AI-SSII/
├── docker-compose.yml              # Infrastructure services
├── .env.example                    # Environment variables template
├── packages/
│   └── database/
│       ├── package.json            # Dependencies
│       ├── tsconfig.json           # TypeScript config
│       ├── README.md               # Detailed documentation
│       ├── prisma/
│       │   ├── schema.prisma       # Database schema
│       │   ├── seed.ts             # Sample data
│       │   └── migrations/         # Schema migrations
│       ├── src/
│       │   ├── index.ts            # Main export
│       │   ├── client.ts           # Prisma client singleton
│       │   └── utils.ts            # Helper functions
│       └── scripts/
│           ├── reset.ts            # Database reset
│           ├── backup.ts           # Backup utility
│           └── health.ts           # Health check
├── apps/
│   ├── web/
│   │   └── prisma/
│   │       └── schema.prisma       # Web app schema
│   └── api/
│       ├── database/
│       │   ├── __init__.py
│       │   ├── connection.py       # SQLAlchemy connection
│       │   └── models.py           # Python models
│       └── requirements.txt        # Python dependencies
└── scripts/
    └── init.sql                    # Database initialization
```

## Database Schema

### Main Entities

- **Users** - User accounts with role-based access
- **Projects** - Main project entities with AI agent outputs
- **Executions** - Agent execution tracking and logs
- **Metrics** - Performance and quality metrics
- **Templates** - Reusable project templates
- **Comments** - User collaboration
- **Files** - File attachments

### Key Relations

```
User 1 ──── * Project
Project 1 ──── * Execution
Project 1 ──── 1 Metrics
Project 1 ──── * Comment
Project 1 ──── * File
```

## Available Scripts

### Database Operations

```bash
cd packages/database

# Development
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migration
npm run db:push          # Push schema without migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database

# Production
npm run db:migrate:prod  # Apply migrations

# Utilities
npm run db:reset         # Reset database
npm run db:backup        # Create backup
npm run db:health        # Health check
```

### Docker Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart postgres redis

# Remove all data (dangerous!)
docker-compose down -v
```

## Usage Examples

### Node.js/TypeScript

```typescript
import { prisma } from '@ssii/database';

// Create project
const project = await prisma.project.create({
  data: {
    name: 'My E-commerce App',
    brief: 'Build an online store',
    userId: 'user_123',
    stack: 'NEXTJS',
    budget: 100,
    timeline: 14,
  },
});

// Get project with metrics
const projectWithMetrics = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    user: true,
    metrics: true,
    executions: true,
  },
});
```

### Python

```python
from apps.api.database import SessionLocal, Project, User

db = SessionLocal()

# Query projects
projects = db.query(Project)\
    .join(User)\
    .filter(User.email == 'user@example.com')\
    .all()
```

## Test Credentials

After seeding, use these credentials to test:

- **Admin**: `admin@ssii.com` / `admin123`
- **Test User**: `test@ssii.com` / `test123`
- **Developer**: `dev@ssii.com` / `dev123`

## Monitoring

### Health Check

```bash
cd packages/database
npm run db:health
```

### Prisma Studio

Visual database browser at http://localhost:5555:

```bash
npm run db:studio
```

### pgAdmin

Web interface at http://localhost:5050:

1. Login with credentials
2. Add server with Docker network name `postgres`
3. Browse and manage database

## Backup & Restore

### Create Backup

```bash
# Full backup
npm run db:backup

# Schema only
npm run db:backup -- --schema-only
```

### Restore Backup

```bash
gunzip -c backups/backup_*.sql.gz | \
  psql -h localhost -p 5432 -U ssii_user -d ssii_ia_platform
```

## Troubleshooting

### Connection Issues

```bash
# Check services
docker-compose ps

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Reset Everything

```bash
# Reset database
cd packages/database
npm run db:reset

# Or reset Docker volumes
docker-compose down -v
docker-compose up -d
```

## Documentation

- **Detailed Database Docs**: [packages/database/README.md](packages/database/README.md)
- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org

## Environment Variables

See [.env.example](.env.example) for all available configuration options:

- Database connection strings
- Redis configuration
- API keys for integrations
- Security settings
- Feature flags

## Contributing

1. Create a new branch
2. Make changes to schema in `packages/database/prisma/schema.prisma`
3. Generate migration: `npm run db:migrate`
4. Test changes locally
5. Commit and push

## License

MIT

---

**Built with** PostgreSQL, Prisma, Redis, and Docker.
