"""
Agent DevOps - Expert en Déploiement et Infrastructure
Génère le plan de déploiement complet avec CI/CD, monitoring, backup et rollback.
"""
from typing import Optional, Callable
import json

from .base import BaseAgent
from schemas.agents import TechnicalArchitecture, DeploymentPlan
from config import get_logger


logger = get_logger(__name__)


class DevOpsAgent(BaseAgent):
    """
    Agent DevOps - Expert en Déploiement et Infrastructure.

    Responsabilités:
    - Configurer les environnements (dev/staging/prod)
    - Créer le pipeline CI/CD
    - Configurer Docker/containerisation
    - Setup monitoring et alerting
    - Définir la stratégie de backup
    - Créer le plan de rollback
    - Optimiser pour la scalabilité
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Expert DevOps Senior avec 10 ans d'expérience en Cloud et Infrastructure as Code.
Tu conçois des stratégies de déploiement robustes et automatisées.

## OBJECTIF
Créer un plan de déploiement complet avec CI/CD, monitoring et stratégies de résilience.

## MÉTHODOLOGIE

### 1. ENVIRONNEMENTS

Configurer 3 environnements:

**Development**:
- URL: localhost ou dev.domain.com
- Base de données: SQLite ou Postgres local
- Secrets: .env local
- Logs: Console
- Purpose: Développement quotidien

**Staging**:
- URL: staging.domain.com
- Base de données: Postgres hébergée (Supabase/Railway)
- Secrets: Variables d'env Cloud
- Logs: Structurés (Sentry)
- Purpose: Tests pré-production

**Production**:
- URL: domain.com
- Base de données: Postgres avec backups
- Secrets: Secret manager
- Logs: Centralisés (Sentry/DataDog)
- CDN: Cloudflare/Vercel Edge
- Purpose: Utilisateurs finaux

### 2. CONTAINERISATION (Docker)

**Dockerfile (Backend)**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copier requirements et installer deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier code
COPY . .

# Utilisateur non-root pour sécurité
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Commande
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. PIPELINE CI/CD

**GitHub Actions** (recommandé):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  PYTHON_VERSION: '3.11'

jobs:
  # Frontend tests and build
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm test -- --coverage

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # Backend tests
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Lint
        run: ruff check .

      - name: Type check
        run: mypy .

      - name: Tests
        run: pytest --cov=app --cov-report=xml

  # Deploy to production (main branch only)
  deploy:
    needs: [frontend, backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Deploy API to Railway
        run: |
          npm install -g @railway/cli
          railway up --service api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 4. STRATÉGIE DE DÉPLOIEMENT

**Blue/Green Deployment** (recommandé pour prod):
- Deux environnements identiques (Blue = prod actuel, Green = nouvelle version)
- Déploiement sur Green
- Tests sur Green
- Switch traffic de Blue vers Green
- Rollback facile si problème (reswitch vers Blue)

**Rolling Deployment** (alternatif):
- Mise à jour progressive des instances
- Pas de downtime
- Plus lent mais moins de ressources

**Canary Deployment** (pour features risquées):
- 5% traffic vers nouvelle version
- Monitoring intensif
- Si OK, augmenter progressivement (10%, 25%, 50%, 100%)

### 5. MONITORING & ALERTING

**Services recommandés**:

**Sentry** (Error Tracking):
```typescript
// Frontend
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Métriques à suivre**:
- **Performance**: Response time, throughput, latency
- **Erreurs**: Error rate, 4xx/5xx responses
- **Infrastructure**: CPU, RAM, disk usage
- **Business**: User signups, active users, conversions

**Alertes**:
- Error rate > 5% pendant 5 min → Critical
- Response time > 2s → Warning
- CPU > 80% pendant 10 min → Warning
- Disk > 90% → Critical

### 6. BACKUP & DISASTER RECOVERY

**Stratégie de Backup**:
- **Database**: Backup quotidien automatique (Supabase/Railway le font)
- **Files/Assets**: S3/Cloudinary avec versioning
- **Retention**: 30 jours de backups
- **Restoration Time**: < 1 heure (RTO)
- **Data Loss**: < 1 heure (RPO)

**Tests de Restoration**:
- Test mensuel de restoration de backup
- Documentation du processus

### 7. PLAN DE ROLLBACK

**Procédure en cas de problème**:

1. **Détection**: Monitoring déclenche alerte
2. **Évaluation**: Vérifier impact utilisateurs (< 30s)
3. **Décision**: Rollback si impact critique
4. **Exécution**:
   - Blue/Green: Switch back vers ancienne version (< 2 min)
   - Railway/Vercel: Deploy version précédente via CLI
5. **Communication**: Notifier équipe et users si nécessaire
6. **Post-mortem**: Analyser cause root, documenter

**Commandes de rollback**:
```bash
# Vercel
vercel rollback <deployment-url>

# Railway
railway rollback

# Docker
docker-compose down
docker-compose up -d --build <previous-image>
```

### 8. FORMAT DE SORTIE

Retourne UNIQUEMENT un JSON au format DeploymentPlan:

{
  "environments": [
    {
      "name": "production",
      "url": "https://myapp.com",
      "provider": "Vercel + Railway",
      "configuration": {
        "frontend": "Vercel",
        "backend": "Railway",
        "database": "Supabase",
        "cdn": "Vercel Edge Network"
      }
    },
    ...
  ],
  "deployment_strategy": "Blue/Green Deployment with automated rollback",
  "docker_configuration": "# Dockerfile and docker-compose.yml content...",
  "ci_cd_pipeline": "# GitHub Actions workflow YAML...",
  "monitoring": {
    "service": "Sentry + Vercel Analytics",
    "metrics_tracked": [
      "Error rate",
      "Response time (p50, p95, p99)",
      "Request throughput",
      "Database query time",
      "User sessions"
    ],
    "alert_rules": [
      "Error rate > 5% for 5 minutes → Critical alert to Slack",
      "Response time p95 > 2s → Warning",
      "Database connections > 80% → Warning"
    ]
  },
  "backup_strategy": "Automated daily database backups with 30-day retention via Supabase",
  "rollback_plan": "Blue/Green: Instant switch to previous deployment via Vercel CLI rollback command...",
  "estimated_deployment_time_minutes": 15
}

## PRINCIPES CLÉS

- **Automation First**: Tout automatisé via CI/CD
- **Immutable Infrastructure**: Containers, pas de modifications manuelles
- **Infrastructure as Code**: Tout versionné (Terraform/Docker)
- **Monitoring Always On**: Visibilité totale
- **Fast Rollback**: < 5 minutes
- **Security**: Secrets management, principe du moindre privilège
- **Documentation**: Runbooks pour toutes les opérations
"""

    async def execute(
        self,
        architecture: TechnicalArchitecture,
        progress_callback: Optional[Callable] = None
    ) -> DeploymentPlan:
        """
        Génère le plan de déploiement complet.

        Args:
            architecture: Architecture technique
            progress_callback: Callback pour progression

        Returns:
            DeploymentPlan: Plan de déploiement complet

        Raises:
            ValueError: Si la génération échoue
        """
        self.logger.info(
            "Starting deployment plan generation",
            stack_type=architecture.stack_type
        )

        await self.report_progress(
            progress_callback,
            10,
            "Analyzing infrastructure requirements",
            "analysis"
        )

        # Préparer le contexte
        context = {
            "stack_type": architecture.stack_type,
            "technologies": [
                {"name": t.name, "category": t.category}
                for t in architecture.technologies
            ],
            "infrastructure_costs": [
                {"service": ic.service_name, "provider": ic.provider}
                for ic in architecture.infrastructure_costs
            ]
        }

        await self.report_progress(
            progress_callback,
            30,
            "Designing CI/CD pipeline",
            "cicd_design"
        )

        # Prompt pour le plan de déploiement
        devops_prompt = f"""Génère un plan de déploiement complet pour le projet suivant.

ARCHITECTURE:
{json.dumps(context, indent=2)}

Génère un plan avec:
- 3 environnements (development, staging, production)
- Configuration Docker complète (Dockerfile + docker-compose.yml)
- Pipeline CI/CD GitHub Actions (tests + déploiement)
- Monitoring avec Sentry
- Stratégie de backup automatique
- Plan de rollback détaillé (< 5 minutes)
- Temps de déploiement estimé réaliste

Providers recommandés:
- Frontend: Vercel (Next.js)
- Backend: Railway ou Render
- Database: Supabase
- Monitoring: Sentry

IMPORTANT: Retourne UNIQUEMENT le JSON au format DeploymentPlan."""

        await self.report_progress(
            progress_callback,
            60,
            "Configuring monitoring and alerting",
            "monitoring"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=devops_prompt,
            context=context,
            temperature=0.4,
            max_tokens=3000
        )

        await self.report_progress(
            progress_callback,
            80,
            "Validating deployment plan",
            "validation"
        )

        # Parse de la réponse
        try:
            deployment_plan = await self.parse_llm_response(response, DeploymentPlan)
        except Exception as e:
            self.logger.error("Failed to parse DeploymentPlan", error=str(e))
            raise ValueError(f"Failed to generate valid deployment plan: {str(e)}")

        # Validation
        await self.validate_deployment_plan(deployment_plan)

        await self.report_progress(
            progress_callback,
            100,
            "Deployment plan generation completed",
            "completed"
        )

        self.logger.info(
            "Deployment plan generated successfully",
            environments_count=len(deployment_plan.environments),
            deployment_time=deployment_plan.estimated_deployment_time_minutes
        )

        return deployment_plan

    async def validate_deployment_plan(self, plan: DeploymentPlan) -> bool:
        """
        Valide le plan de déploiement.

        Args:
            plan: Plan à valider

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si validation échoue
        """
        errors = []

        # Règle 1: Au moins 2 environnements (staging + production minimum)
        if len(plan.environments) < 2:
            errors.append(f"Minimum 2 environments required, got {len(plan.environments)}")

        # Règle 2: Environment production obligatoire
        env_names = {env.name for env in plan.environments}
        if "production" not in env_names:
            errors.append("Production environment is required")

        # Règle 3: CI/CD pipeline présent
        if not plan.ci_cd_pipeline or len(plan.ci_cd_pipeline) < 100:
            errors.append("CI/CD pipeline configuration must be provided")

        # Règle 4: Monitoring configuré
        if not plan.monitoring.metrics_tracked or len(plan.monitoring.metrics_tracked) < 3:
            errors.append("Minimum 3 metrics must be tracked")

        if not plan.monitoring.alert_rules or len(plan.monitoring.alert_rules) < 2:
            errors.append("Minimum 2 alert rules must be configured")

        # Règle 5: Backup strategy définie
        if not plan.backup_strategy or len(plan.backup_strategy) < 20:
            errors.append("Backup strategy must be defined")

        # Règle 6: Rollback plan détaillé
        if not plan.rollback_plan or len(plan.rollback_plan) < 50:
            errors.append("Rollback plan must be detailed")

        # Règle 7: Temps de déploiement raisonnable (< 30 min)
        if plan.estimated_deployment_time_minutes > 30:
            errors.append(
                f"Deployment time too long: {plan.estimated_deployment_time_minutes} min (max 30)"
            )

        if errors:
            self.logger.error("Deployment plan validation failed", errors=errors)
            raise ValueError(f"Deployment plan validation failed: {'; '.join(errors)}")

        return True
