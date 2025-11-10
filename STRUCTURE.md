# Project Structure

Complete file structure for SSII IA Platform Database Layer.

```
AI-SSII/
│
├── README.md                         # Main documentation
├── STRUCTURE.md                      # This file
├── Makefile                          # Common commands
├── docker-compose.yml                # Docker infrastructure
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Automated setup
│   └── init.sql                      # PostgreSQL initialization
│
├── packages/                         # Monorepo packages
│   └── database/                     # Database package
│       ├── README.md                 # Database documentation
│       ├── package.json              # Dependencies
│       ├── tsconfig.json             # TypeScript config
│       │
│       ├── prisma/                   # Prisma ORM
│       │   ├── schema.prisma         # Database schema
│       │   ├── seed.ts               # Sample data
│       │   └── migrations/           # Schema migrations (auto-generated)
│       │
│       ├── src/                      # Source code
│       │   ├── index.ts              # Main export
│       │   ├── client.ts             # Prisma client singleton
│       │   └── utils.ts              # Helper functions
│       │
│       └── scripts/                  # Database scripts
│           ├── reset.ts              # Reset database
│           ├── backup.ts             # Backup utility
│           └── health.ts             # Health check
│
└── apps/                             # Application code
    ├── web/                          # Web application
    │   └── prisma/
    │       └── schema.prisma         # Web app schema (same as packages/database)
    │
    └── api/                          # Python API
        ├── requirements.txt          # Python dependencies
        └── database/                 # SQLAlchemy setup
            ├── __init__.py           # Package init
            ├── connection.py         # Database connection
            └── models.py             # Python models
```

## File Descriptions

### Root Level

| File | Description |
|------|-------------|
| `README.md` | Main project documentation with quick start guide |
| `STRUCTURE.md` | This file - complete project structure |
| `Makefile` | Common commands (make setup, make start, etc.) |
| `docker-compose.yml` | Docker services (PostgreSQL, Redis, pgAdmin) |
| `.env.example` | Environment variables template |
| `.gitignore` | Files to ignore in git |

### Scripts

| File | Description |
|------|-------------|
| `scripts/setup.sh` | Automated setup script for initial installation |
| `scripts/init.sql` | PostgreSQL initialization with extensions and optimizations |

### Packages/Database

| File | Description |
|------|-------------|
| `README.md` | Detailed database documentation |
| `package.json` | NPM package configuration and scripts |
| `tsconfig.json` | TypeScript compiler configuration |
| `prisma/schema.prisma` | Main database schema definition |
| `prisma/seed.ts` | Database seeding script with test data |
| `src/index.ts` | Main package export |
| `src/client.ts` | Prisma client singleton with connection pooling |
| `src/utils.ts` | Helper functions (pagination, queries, etc.) |
| `scripts/reset.ts` | Database reset utility |
| `scripts/backup.ts` | Database backup utility |
| `scripts/health.ts` | Health check utility |

### Apps/Web

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Prisma schema for web app (mirrors main schema) |

### Apps/API

| File | Description |
|------|-------------|
| `requirements.txt` | Python dependencies |
| `database/__init__.py` | Python package initialization |
| `database/connection.py` | SQLAlchemy connection setup |
| `database/models.py` | SQLAlchemy models (mirrors Prisma schema) |

## Database Models

### User
- User accounts with role-based access
- Fields: id, email, password, name, role, avatar
- Relations: projects, executions, comments

### Project
- Main project entities
- Fields: name, brief, status, stack, budget, timeline
- Agent outputs: plan, architecture, codebase, security, tests, deployment
- Relations: user, executions, metrics, templates, comments, files

### Execution
- Agent execution tracking
- Fields: agent, status, progress, input, output, error, logs
- Performance: duration, tokensUsed, cost
- Relations: project, user

### Metrics
- Project performance metrics
- Code quality: coverage, complexity, linesOfCode, tests
- Performance: lighthouse, bundleSize, loadTime
- Security: owaspScore, vulnerabilities
- Costs: estimatedCost, apiTokensUsed
- Relations: project (one-to-one)

### Template
- Reusable project templates
- Fields: name, description, category, brief, config, stack
- Stats: usageCount, rating
- Relations: project (optional source)

### Comment
- User comments on projects
- Fields: content
- Relations: project, user

### File
- Uploaded files and attachments
- Fields: filename, mimetype, size, url
- Relations: project

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache and sessions |
| pgAdmin | 5050 | Database management UI |

## Environment Variables

See `.env.example` for complete list:

- Database connection
- Redis configuration
- API keys
- Security settings
- Feature flags
- Monitoring configuration

## Scripts & Commands

### Makefile Commands

```bash
make setup          # Complete setup
make start          # Start services
make stop           # Stop services
make restart        # Restart services
make logs           # View logs
make migrate        # Run migrations
make seed           # Seed database
make reset          # Reset database
make backup         # Create backup
make studio         # Open Prisma Studio
make health         # Health check
```

### NPM Scripts (in packages/database)

```bash
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create migration
npm run db:push          # Push schema
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
npm run db:reset         # Reset database
npm run db:backup        # Create backup
npm run db:health        # Health check
```

## Generated Files (not in git)

These files are auto-generated and should not be committed:

- `node_modules/` - NPM dependencies
- `dist/` - Compiled TypeScript
- `.prisma/` - Generated Prisma client
- `prisma/migrations/` - Migration files (tracked, but not edited manually)
- `backups/` - Database backups
- `.env` - Environment variables (contains secrets)
- `__pycache__/` - Python compiled files

## Data Flow

```
┌─────────────┐
│   Web App   │──┐
└─────────────┘  │
                 │    ┌──────────────┐
┌─────────────┐  ├───>│ PostgreSQL   │
│  Python API │──┘    │  (Prisma)    │
└─────────────┘       └──────────────┘
                              │
                              │
                      ┌───────┴────────┐
                      │                │
                 ┌────▼─────┐   ┌─────▼────┐
                 │   Redis  │   │ pgAdmin  │
                 │  Cache   │   │    UI    │
                 └──────────┘   └──────────┘
```

## Key Features

1. **Type Safety**: Prisma generates TypeScript types from schema
2. **Dual ORM**: Prisma for Node.js, SQLAlchemy for Python
3. **Migration System**: Automated schema migrations
4. **Seeding**: Pre-populated test data
5. **Backup System**: Automated backups with compression
6. **Health Monitoring**: Database and service health checks
7. **Connection Pooling**: Optimized database connections
8. **Indexes**: Optimized queries with strategic indexes
9. **Docker Integration**: Complete containerized setup
10. **Documentation**: Comprehensive docs and examples

## Next Steps

After setup:

1. Explore data in Prisma Studio: `make studio`
2. View database in pgAdmin: http://localhost:5050
3. Check health: `make health`
4. Start building your application!
