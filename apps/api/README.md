# SSII IA Platform - Backend API

Backend FastAPI avec orchestration LangGraph et 6 agents IA spécialisés pour la génération automatique d'applications complètes.

## 🎯 Vue d'ensemble

Cette plateforme génère automatiquement des applications web/mobile complètes à partir d'un simple brief textuel, en orchestrant 6 agents IA spécialisés :

1. **DirectorAgent** - Analyse le brief et génère le plan projet (user stories, estimations, budget)
2. **ArchitectAgent** - Conçoit l'architecture technique (stack, ADRs, diagrammes C4)
3. **DeveloperAgent** - Génère le code complet (TypeScript/Python, tests inclus)
4. **SecurityAgent** - Analyse les vulnérabilités (OWASP Top 10, score de sécurité)
5. **QAAgent** - Crée la suite de tests (unitaires, intégration, E2E)
6. **DevOpsAgent** - Plan de déploiement (CI/CD, monitoring, backup)

## 🏗️ Architecture

```
Backend FastAPI (Port 8000)
├── Agents IA (6 agents spécialisés)
├── LangGraph Workflow (orchestration)
├── Services (OpenAI, PostgreSQL, Redis)
└── API REST + WebSocket (real-time updates)
```

## 🚀 Installation rapide

### Prérequis

- Python 3.11+
- PostgreSQL 15+ (ou Docker)
- Redis 7+ (ou Docker)
- Clé API OpenAI

### Option 1: Installation locale

```bash
# 1. Naviguer vers le dossier API
cd /home/user/ssii-ia-platform/apps/api

# 2. Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et ajouter votre clé OpenAI

# 5. Lancer l'application
uvicorn main:app --reload --port 8000
```

### Option 2: Docker Compose (recommandé)

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et ajouter votre clé OpenAI

# 2. Lancer tous les services
docker-compose up -d

# 3. Voir les logs
docker-compose logs -f api
```

## 📋 Configuration

### Variables d'environnement essentielles

```env
# OpenAI (REQUIS)
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Base de données
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ssii_ia_platform

# Redis
REDIS_URL=redis://localhost:6379/0

# Sécurité
SECRET_KEY=your-secret-key-min-32-characters
```

## 🔌 Endpoints API

### Projets

- `POST /api/projects` - Créer un projet
- `GET /api/projects` - Liste des projets (pagination)
- `GET /api/projects/{id}` - Détails d'un projet
- `PATCH /api/projects/{id}` - Mettre à jour un projet
- `DELETE /api/projects/{id}` - Supprimer un projet
- `POST /api/projects/{id}/start-workflow` - Démarrer la génération

### Agents

- `GET /api/agents` - Liste des agents disponibles
- `GET /api/agents/{name}` - Détails d'un agent
- `GET /api/agents/workflow/sequence` - Séquence du workflow

### Monitoring

- `GET /` - Info générale de l'API
- `GET /health` - Health check (DB, Redis, etc.)
- `WS /ws/{workflow_id}` - WebSocket pour updates real-time

## 📡 WebSocket (Real-time Updates)

Connectez-vous au WebSocket pour recevoir les updates en temps réel pendant l'exécution d'un workflow :

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/wf_123456');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type);
  console.log('Progress:', data.percentage);
};

// Heartbeat
setInterval(() => ws.send('ping'), 30000);
```

### Types d'événements WebSocket

- `connected` - Connexion établie
- `workflow_started` - Workflow démarré
- `agent_started` - Agent a démarré
- `agent_progress` - Progression de l'agent
- `agent_completed` - Agent terminé
- `workflow_completed` - Workflow terminé
- `workflow_failed` - Workflow échoué

## 🔄 Workflow de génération

1. **Créer un projet**
   ```bash
   curl -X POST http://localhost:8000/api/projects \
     -H "Content-Type: application/json" \
     -d '{"name": "TaskMaster", "brief": "Build a task management app"}'
   ```

2. **Démarrer le workflow**
   ```bash
   curl -X POST http://localhost:8000/api/projects/{project_id}/start-workflow
   ```

3. **Suivre la progression**
   - Via WebSocket: `ws://localhost:8000/ws/{workflow_id}`
   - Via polling: `GET /api/projects/{project_id}`

4. **Récupérer les résultats**
   ```bash
   curl http://localhost:8000/api/projects/{project_id}
   ```

   Réponse contient les outputs de tous les agents dans `outputs`.

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Avec coverage
pytest --cov=. --cov-report=html

# Tests spécifiques
pytest tests/test_agents.py
pytest tests/test_workflow.py
```

## 📚 Documentation interactive

Une fois l'application lancée, accédez à :

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔐 Sécurité

- ✅ Validation des inputs avec Pydantic
- ✅ Pas de secrets hardcodés (variables d'env)
- ✅ Utilisateur non-root dans Docker
- ✅ Health checks configurés
- ✅ Rate limiting (à implémenter en production)
- ✅ CORS configuré pour Next.js

## 📊 Base de données

### Modèles principaux

**Project**
- `id` - ID unique
- `name` - Nom du projet
- `brief` - Brief initial
- `status` - draft | in_progress | completed | failed
- `outputs` - JSON avec tous les outputs des agents
- `created_at`, `updated_at`

**Execution**
- `id` - ID unique
- `workflow_id` - ID du workflow
- `agent_name` - Nom de l'agent
- `status` - pending | running | completed | failed
- `output` - Output de l'agent
- `logs` - Logs d'exécution

### Migrations (Alembic)

```bash
# Créer une migration
alembic revision --autogenerate -m "Description"

# Appliquer les migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🐳 Docker

### Build custom

```bash
# Build l'image
docker build -t ssii-ia-api .

# Run
docker run -p 8000:8000 --env-file .env ssii-ia-api
```

### Production

Pour la production, modifiez `docker-compose.yml` :

- Utilisez des secrets managers pour les clés
- Activez HTTPS
- Configurez le rate limiting
- Activez le logging vers un service externe
- Configurez les backups automatiques de la DB

## 🛠️ Développement

### Structure du code

```
api/
├── agents/          # 6 agents IA
│   ├── base.py      # Classe de base abstraite
│   ├── director.py
│   ├── architect.py
│   ├── developer.py
│   ├── security.py
│   ├── qa.py
│   └── devops.py
├── workflow/        # Orchestration LangGraph
│   ├── states.py
│   └── orchestrator.py
├── schemas/         # Modèles Pydantic
├── services/        # Services (DB, Redis, OpenAI)
├── api/            # Routes FastAPI
└── main.py         # Point d'entrée
```

### Ajouter un nouvel agent

1. Créer `agents/myagent.py` héritant de `BaseAgent`
2. Implémenter `system_prompt` et `execute()`
3. Créer le schéma Pydantic dans `schemas/agents.py`
4. Ajouter le nœud dans `workflow/orchestrator.py`
5. Ajouter l'import dans `agents/__init__.py`

## 🐛 Debugging

### Logs structurés

Les logs sont en JSON structuré (configurable via `LOG_FORMAT`):

```json
{
  "event": "HTTP request",
  "method": "POST",
  "url": "/api/projects",
  "level": "info",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Activer le mode debug

```env
DEBUG=True
LOG_LEVEL=DEBUG
```

## 📈 Monitoring en production

Recommandations :

- **APM**: New Relic, Datadog, ou Sentry
- **Logs**: Centraliser avec ELK stack ou Loki
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Uptime**: UptimeRobot ou Pingdom

## 🤝 Contribution

1. Créer une branche: `git checkout -b feature/ma-fonctionnalite`
2. Coder + tests
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/ma-fonctionnalite`
5. Pull Request

## 📄 Licence

MIT - Voir LICENSE

## 🆘 Support

- Documentation: `/docs` endpoint
- Issues: GitHub Issues
- Contact: [votre-email]

## 🎉 Prochaines étapes

- [ ] Implémenter le rate limiting
- [ ] Ajouter l'authentification JWT
- [ ] Créer un dashboard admin
- [ ] Ajouter le support multi-langues
- [ ] Optimiser les prompts LLM
- [ ] Implémenter le cache des réponses
- [ ] Ajouter des webhooks pour notifications

---

**Version**: 1.0.0
**Dernière mise à jour**: 2025-01-15
