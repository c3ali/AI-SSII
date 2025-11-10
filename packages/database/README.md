# SSII IA Platform - Database Layer

Complete database infrastructure with PostgreSQL, Prisma ORM, and Redis for the SSII IA Platform.

## Table of Contents

- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Database Schema](#database-schema)
- [Scripts](#scripts)
- [Usage Examples](#usage-examples)
- [Migrations](#migrations)
- [Backup & Restore](#backup--restore)
- [Monitoring](#monitoring)

---

## Architecture

### Tech Stack

- **PostgreSQL 15** - Primary relational database
- **Prisma 5** - Type-safe ORM for Node.js/TypeScript
- **Redis 7** - In-memory cache and session store
- **pgAdmin 4** - Database management UI
- **SQLAlchemy** - Python ORM for API backend

### Database Structure

```
├── Users           # User accounts and authentication
├── Projects        # Main project entities
├── Executions      # Agent execution tracking
├── Metrics         # Project performance metrics
├── Templates       # Reusable project templates
├── Comments        # User comments on projects
└── Files           # Uploaded files and attachments
```

---

## Quick Start

### 1. Prerequisites

- Docker & Docker Compose
- Node.js 18+
- npm or pnpm

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start Database Services

```bash
# Start PostgreSQL, Redis, and pgAdmin
docker-compose up -d

# Check services are running
docker-compose ps
```

### 4. Initialize Database

```bash
# Navigate to database package
cd packages/database

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 5. Access Services

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **pgAdmin**: `http://localhost:5050` (admin@ssii.com / admin)

---

## Database Schema

### Core Models

#### User

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          Role      @default(USER)
  avatar        String?

  projects      Project[]
  executions    Execution[]
  comments      Comment[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
}
```

**Roles**: `USER`, `ADMIN`, `DEVELOPER`

#### Project

```prisma
model Project {
  id            String        @id @default(cuid())
  name          String
  brief         String        @db.Text
  status        ProjectStatus @default(DRAFT)

  userId        String
  user          User          @relation(fields: [userId], references: [id])

  config        Json          @default("{}")
  stack         Stack         @default(NEXTJS)
  budget        Float         @default(50)
  timeline      Int           @default(7)

  // Agent outputs
  plan          Json?
  architecture  Json?
  codebase      Json?
  security      Json?
  tests         Json?
  deployment    Json?

  githubUrl     String?
  deployUrl     String?
  docsUrl       String?

  executions    Execution[]
  metrics       Metrics?
  templates     Template[]
  comments      Comment[]
  files         File[]

  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

**Statuses**: `DRAFT`, `QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`, `CANCELLED`

**Stacks**: `NEXTJS`, `REACT_NATIVE`, `EXPO`, `NUXT`, `FLUTTER`

#### Execution

```prisma
model Execution {
  id            String          @id @default(cuid())

  projectId     String
  project       Project         @relation(fields: [projectId], references: [id])
  userId        String?
  user          User?           @relation(fields: [userId], references: [id])

  agent         Agent
  status        ExecutionStatus @default(PENDING)
  progress      Int             @default(0)

  input         Json
  output        Json?
  error         String?         @db.Text
  logs          Json            @default("[]")

  duration      Int?            // milliseconds
  tokensUsed    Int?
  cost          Float?

  startedAt     DateTime        @default(now())
  completedAt   DateTime?
}
```

**Agents**: `DIRECTOR`, `ARCHITECT`, `DEVELOPER`, `SECURITY`, `QA`, `DEVOPS`

**Execution Statuses**: `PENDING`, `RUNNING`, `SUCCESS`, `FAILED`, `SKIPPED`

---

## Scripts

### Development Scripts

```bash
# Generate Prisma client
npm run db:generate

# Push schema without migration
npm run db:push

# Create and apply migration
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:prod

# Open Prisma Studio (GUI)
npm run db:studio

# Seed database
npm run db:seed
```

### Utility Scripts

```bash
# Reset database (delete all data and re-seed)
npm run db:reset

# Create backup
npm run db:backup

# Health check
npm run db:health
```

---

## Usage Examples

### TypeScript/Node.js (Prisma)

```typescript
import { prisma } from '@ssii/database';

// Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: 'John Doe',
    role: 'USER',
  },
});

// Create a project
const project = await prisma.project.create({
  data: {
    name: 'My E-commerce App',
    brief: 'Build an online store with Next.js',
    userId: user.id,
    stack: 'NEXTJS',
    budget: 100,
    timeline: 14,
  },
});

// Create an execution
const execution = await prisma.execution.create({
  data: {
    projectId: project.id,
    userId: user.id,
    agent: 'DIRECTOR',
    status: 'RUNNING',
    input: { brief: project.brief },
  },
});

// Get project with relations
const projectWithDetails = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    user: true,
    metrics: true,
    executions: {
      orderBy: { startedAt: 'desc' },
    },
    comments: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    },
  },
});
```

### Helper Functions

```typescript
import {
  paginate,
  getProjectWithMetrics,
  updateProjectStatus,
  createExecution,
  completeExecution,
} from '@ssii/database';

// Paginated projects
const result = await paginate(
  prisma.project,
  { page: 1, limit: 10 },
  { userId: 'user_123' },
  { createdAt: 'desc' }
);

// Get project with metrics
const project = await getProjectWithMetrics('project_123');

// Update project status
await updateProjectStatus('project_123', 'SUCCESS');

// Create execution
const execution = await createExecution({
  projectId: 'project_123',
  userId: 'user_123',
  agent: 'DEVELOPER',
  input: { architecture: {...} },
});

// Complete execution
await completeExecution(execution.id, {
  status: 'SUCCESS',
  output: { filesGenerated: 87 },
  duration: 245000,
  tokensUsed: 95000,
  cost: 1.9,
});
```

### Python (SQLAlchemy)

```python
from apps.api.database import SessionLocal, User, Project, Execution
from apps.api.database import ProjectStatus, Agent, ExecutionStatus

# Create session
db = SessionLocal()

# Query users
users = db.query(User).filter(User.role == 'ADMIN').all()

# Create project
project = Project(
    id='proj_123',
    name='My App',
    brief='Build an app',
    status=ProjectStatus.DRAFT,
    user_id='user_123',
    stack='NEXTJS',
    budget=100,
    timeline=14
)
db.add(project)
db.commit()

# Query with joins
projects = db.query(Project)\
    .join(User)\
    .filter(User.email == 'user@example.com')\
    .all()

# Context manager
from apps.api.database import db_session

with db_session() as db:
    executions = db.query(Execution)\
        .filter(Execution.status == ExecutionStatus.RUNNING)\
        .all()
```

---

## Migrations

### Create Migration

```bash
# Create a new migration
npx prisma migrate dev --name add_new_field

# Apply migrations
npx prisma migrate deploy
```

### Migration Best Practices

1. Always test migrations in development first
2. Backup production data before migrating
3. Use descriptive migration names
4. Review generated SQL before applying
5. Never edit migration files manually

---

## Backup & Restore

### Create Backup

```bash
# Full compressed backup (default)
npm run db:backup

# Uncompressed backup
npm run db:backup -- --no-compress

# Schema only (no data)
npm run db:backup -- --schema-only
```

Backups are stored in `./backups/` directory.

### Restore from Backup

```bash
# Restore from compressed backup
gunzip -c backups/backup_ssii_ia_platform_2024-01-15.sql.gz | \
  psql -h localhost -p 5432 -U ssii_user -d ssii_ia_platform

# Restore from uncompressed backup
psql -h localhost -p 5432 -U ssii_user -d ssii_ia_platform < \
  backups/backup_ssii_ia_platform_2024-01-15.sql
```

### Automated Backups

Add to crontab for daily backups:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/project && npm run db:backup
```

---

## Monitoring

### Health Check

```bash
# Run health check
npm run db:health
```

Output includes:

- PostgreSQL connection status
- Database size
- Table row counts
- Query performance metrics
- Redis connection status
- Index information

### Prisma Studio

Visual database browser:

```bash
npm run db:studio
```

Access at `http://localhost:5555`

### pgAdmin

Web-based management:

1. Open `http://localhost:5050`
2. Login with `admin@ssii.com` / `admin`
3. Add server:
   - Host: `postgres` (in Docker network) or `localhost`
   - Port: `5432`
   - Database: `ssii_ia_platform`
   - Username: `ssii_user`
   - Password: `ssii_pass_2024`

### Performance Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## Troubleshooting

### Connection Issues

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis

# Restart services
docker-compose restart postgres redis
```

### Reset Database

```bash
# Complete reset (deletes all data)
npm run db:reset
```

### Clear Prisma Cache

```bash
# Remove generated client
rm -rf node_modules/.prisma

# Regenerate
npm run db:generate
```

---

## Test Credentials

After seeding, use these credentials:

- **Admin**: `admin@ssii.com` / `admin123`
- **Test User**: `test@ssii.com` / `test123`
- **Developer**: `dev@ssii.com` / `dev123`

---

## Support

For issues or questions:

1. Check logs: `docker-compose logs`
2. Run health check: `npm run db:health`
3. Review Prisma docs: https://www.prisma.io/docs
4. Check PostgreSQL logs in pgAdmin

---

## License

MIT
