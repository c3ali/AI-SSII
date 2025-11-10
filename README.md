# SSII IA Platform - Infrastructure & DevOps

## 🎯 Overview

Complete CI/CD, monitoring, and infrastructure setup for the SSII IA Platform.

## 📁 Project Structure

```
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # Continuous Integration
│   │   ├── cd.yml          # Continuous Deployment
│   │   ├── preview.yml     # Preview Deployments
│   │   └── security.yml    # Security Scanning
│   └── dependabot.yml      # Dependency Updates
├── infra/
│   ├── kubernetes/         # K8s manifests
│   │   ├── deployment.yml
│   │   └── ingress.yml
│   └── monitoring/
│       ├── prometheus/     # Metrics collection
│       ├── grafana/        # Visualization
│       └── docker-compose.monitoring.yml
├── scripts/
│   ├── deploy.sh           # Deployment script
│   ├── rollback.sh         # Rollback script
│   ├── health-check.sh     # Health checks
│   └── backup.sh           # Backup script
├── Dockerfile.web          # Next.js container
├── Dockerfile.api          # FastAPI container
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── nginx.conf              # Nginx configuration
└── turbo.json              # Turborepo config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd AI-SSII
   pnpm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start Development Services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Run Application**
   ```bash
   pnpm dev
   ```

## 📦 CI/CD Pipeline

### Continuous Integration (.github/workflows/ci.yml)

Runs on every push and PR:
- ✅ Static analysis (TypeScript, ESLint, Prettier)
- ✅ Unit tests with coverage (80% threshold)
- ✅ E2E tests with Playwright
- ✅ Security scanning (Trivy, TruffleHog)
- ✅ Docker image builds
- ✅ Performance tests (Lighthouse, k6)

### Continuous Deployment (.github/workflows/cd.yml)

Deploys to production on main branch:
- 🚀 Frontend to Vercel
- 🚀 API to Railway
- 🗄️ Database migrations
- 🏥 Post-deployment health checks
- 📢 Slack notifications

### Preview Deployments (.github/workflows/preview.yml)

Creates preview environment for PRs:
- 👀 Preview URLs in PR comments
- 📊 Lighthouse performance reports
- 🎨 Visual regression tests

### Security Scanning (.github/workflows/security.yml)

Comprehensive security checks:
- 🔒 Dependency vulnerability scanning
- 🔍 CodeQL analysis
- 🕵️ Secret scanning
- 🐳 Docker image security
- 📜 License compliance

## 🛠️ Deployment

### Manual Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging

# Deploy preview
./scripts/deploy.sh preview
```

### Rollback

```bash
# Rollback production
./scripts/rollback.sh production

# Rollback staging
./scripts/rollback.sh staging
```

### Health Checks

```bash
# Check production health
./scripts/health-check.sh production

# Check staging health
./scripts/health-check.sh staging
```

## 📊 Monitoring

### Prometheus + Grafana Stack

```bash
# Start monitoring stack
cd infra/monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
# Default credentials: admin/admin
```

### Available Dashboards

- **Overview Dashboard**: Request rate, error rate, latency, CPU/memory
- **API Dashboard**: Endpoint metrics, database connections
- **Database Dashboard**: Query performance, connection pool

### Alerts

Configured alerts for:
- High error rates (>5%)
- High latency (P95 >2s)
- Service downtime
- High CPU/memory usage (>80%)
- Database connection pool exhaustion

## 🐳 Docker

### Build Images

```bash
# Build web image
docker build -f Dockerfile.web -t ssii-web .

# Build API image
docker build -f Dockerfile.api -t ssii-api .
```

### Run with Docker Compose

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up -d

# Monitoring
docker-compose -f infra/monitoring/docker-compose.monitoring.yml up -d
```

## ☸️ Kubernetes

### Deploy to K8s

```bash
# Create namespace
kubectl apply -f infra/kubernetes/deployment.yml

# Configure ingress
kubectl apply -f infra/kubernetes/ingress.yml

# Check status
kubectl get pods -n ssii-ia-platform
```

### Scale Deployment

```bash
# Manual scaling
kubectl scale deployment web-deployment --replicas=5 -n ssii-ia-platform

# Auto-scaling is configured via HPA
# Min: 3, Max: 10 (web)
# Min: 3, Max: 15 (api)
```

## 💾 Backup & Restore

### Create Backup

```bash
./scripts/backup.sh
```

Backs up:
- PostgreSQL database
- Application code
- Configuration files
- Environment variables (encrypted)

### Restore from Backup

See `backups/RESTORE_INSTRUCTIONS.md` for detailed restore procedures.

## 🔐 Security

### Environment Secrets

Required secrets in GitHub:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `RAILWAY_TOKEN`, `RAILWAY_PROJECT_ID`
- `DATABASE_URL`, `REDIS_URL`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- `SLACK_WEBHOOK`
- `SNYK_TOKEN`

### Security Best Practices

- ✅ All Docker images run as non-root users
- ✅ Dependencies scanned daily with Dependabot
- ✅ Secret scanning with TruffleHog
- ✅ SAST with Semgrep and CodeQL
- ✅ Container scanning with Trivy
- ✅ SSL/TLS enforced in production

## 📈 Performance

### Optimization Features

- Multi-stage Docker builds
- Layer caching with BuildKit
- Next.js standalone output
- Static asset caching with Nginx
- Database connection pooling
- Redis caching

### Load Testing

```bash
# Run k6 load tests
docker run --rm -i grafana/k6 run --vus 10 --duration 30s \
  -e API_URL=http://localhost:8000 - < tests/load/api.js
```

## 📝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `pnpm test`
4. Create PR (preview deployment automatic)
5. Merge after approval

## 🆘 Troubleshooting

### Common Issues

**Build fails in CI**
- Check Node.js version (should be 20)
- Verify all dependencies in package.json
- Check TypeScript errors: `pnpm type-check`

**Deployment fails**
- Verify environment secrets in GitHub
- Check Vercel/Railway service status
- Review deployment logs

**Health checks fail**
- Wait 30-60s after deployment
- Check application logs
- Verify database connectivity

## 📚 Documentation

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel](https://vercel.com/docs)
- [Railway](https://docs.railway.app)
- [Prometheus](https://prometheus.io/docs)
- [Grafana](https://grafana.com/docs)

## 📧 Support

For issues or questions, contact the DevOps team or create an issue in the repository.

## 📄 License

[Your License Here]
