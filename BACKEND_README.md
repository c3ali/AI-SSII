# Backend Architecture - SSII AI Studio

## Vue d'ensemble

Le backend est construit avec **Next.js API Routes** et **Prisma ORM** pour gérer toute la logique métier de génération de projets IA.

## Architecture

```
apps/web/
├── lib/
│   ├── prisma.ts              # Client Prisma singleton
│   └── api.ts                 # Client API frontend
├── services/
│   ├── project.service.ts     # Gestion des projets
│   ├── agent-orchestrator.ts  # Orchestration des 6 agents IA
│   ├── queue.service.ts       # Système de queue async
│   ├── decision.service.ts    # Gestion des décisions humaines
│   └── realtime.service.ts    # WebSocket/Supabase Realtime
└── src/app/api/v1/
    ├── projects/
    │   ├── init/route.ts                      # POST - Créer projet
    │   └── [projectId]/status/route.ts        # GET - Statut projet
    ├── agents/status/route.ts                 # GET - Statut agents
    └── human-decisions/
        └── [decisionId]/respond/route.ts      # POST - Répondre décision
```

## Services Backend

### 1. Project Service (`project.service.ts`)

Gère le cycle de vie complet des projets :

**Fonctions principales** :
- `createProject()` - Créer un projet et lancer la génération
- `getProjectStatus()` - Récupérer le statut et la progression
- `updateProjectStatus()` - Mettre à jour le statut
- `updateProjectUrls()` - Enregistrer les URLs de déploiement

**Flow** :
```
1. User submits brief
2. Create project in DB (status: QUEUED)
3. Add job to queue
4. Return project_id to user
```

### 2. Agent Orchestrator (`agent-orchestrator.ts`)

Coordonne les 6 agents IA dans l'ordre :

**Agents** (dans l'ordre d'exécution) :
1. **Director** - Planification et coordination
2. **Architect** - Design système et choix de stack
3. **Developer** - Génération du code
4. **Security** - Audit de sécurité OWASP
5. **QA** - Tests automatisés
6. **DevOps** - Déploiement

**Fonctions principales** :
- `runProjectGeneration()` - Lancer le workflow complet
- `executeAgent()` - Exécuter un agent spécifique
- `getAgentsStatus()` - Récupérer le statut de tous les agents

**Flow** :
```
For each agent in order:
  1. Create execution record (status: RUNNING)
  2. Prepare input with previous agents' outputs
  3. Execute agent (call Claude API)
  4. Record output, tokens, cost
  5. Update project with agent's results
  6. Notify via Realtime
```

### 3. Queue Service (`queue.service.ts`)

Système de queue asynchrone pour traiter les projets en arrière-plan.

**Fonctionnalités** :
- Queue in-memory (simple implementation)
- Traitement séquentiel des jobs
- Retry logic (à implémenter)
- Job cleanup après 24h

**À améliorer** :
- Utiliser **BullMQ** ou **AWS SQS** en production
- Ajouter priorités
- Ajouter retry avec backoff exponentiel
- Scaling horizontal avec workers

### 4. Decision Service (`decision.service.ts`)

Gère les décisions humaines pendant la génération.

**Fonctions principales** :
- `createDecision()` - Créer une décision avec deadline
- `respondToDecision()` - Enregistrer la réponse utilisateur
- `expireDecision()` - Marquer comme expirée après timeout
- `getPendingDecisions()` - Liste des décisions en attente
- `getDecisionHistory()` - Historique complet

**Types de décisions** :
- `STACK_CHOICE` - Choix de la stack technique
- `ARCHITECTURE_VALIDATION` - Validation de l'architecture
- `SECURITY_TRADE_OFF` - Compromis sécurité vs coût
- `COST_OPTIMIZATION` - Optimisation des coûts
- `FEATURE_PRIORITIZATION` - Priorisation des features

### 5. Realtime Service (`realtime.service.ts`)

Notifications temps réel via Supabase Realtime.

**Événements** :
- `agent_update` - Agent a démarré/terminé
- `human_decision_needed` - Décision requise
- `project_completed` - Projet terminé
- `project_error` - Erreur survenue

**Méthodes** :
- `notifyAgentUpdate()`
- `notifyHumanDecisionNeeded()`
- `notifyProjectCompleted()`
- `notifyProjectError()`

## Base de Données (Prisma)

### Modèles principaux

#### Project
```prisma
- id, name, brief, status
- userId (relation User)
- config (JSON) - budgetTokens, target, etc.
- plan, architecture, codebase, security, tests, deployment (JSON)
- githubUrl, deployUrl, docsUrl
- executions[], decisions[], metrics
```

#### Execution
```prisma
- id, projectId, userId
- agent (DIRECTOR | ARCHITECT | DEVELOPER | SECURITY | QA | DEVOPS)
- status (PENDING | RUNNING | SUCCESS | FAILED)
- input, output (JSON)
- duration, tokensUsed, cost
- logs (JSON array)
```

#### HumanDecision
```prisma
- id, projectId, userId
- type (STACK_CHOICE | ARCHITECTURE_VALIDATION | etc.)
- status (PENDING | APPROVED | REJECTED | EXPIRED | MODIFIED)
- proposal, alternative (JSON)
- approved, chosenOption, modifications
- deadline, respondedAt
```

#### Metrics
```prisma
- projectId (unique)
- coverage, complexity, linesOfCode, testsPassed
- lighthouse, bundleSize, loadTime
- owaspScore, vulnerabilities
- estimatedCost, apiTokensUsed
```

## API Routes

### POST /api/v1/projects/init

Créer un nouveau projet.

**Request** :
```json
{
  "brief": "Je veux une app de...",
  "budget_tokens": 50000,
  "target": "web" | "mobile" | "both",
  "stack": "nextjs" (optional)
}
```

**Response** :
```json
{
  "project_id": "clx...",
  "token_estimate": 50000,
  "status": "queued"
}
```

### GET /api/v1/projects/[projectId]/status

Récupérer le statut d'un projet.

**Response** :
```json
{
  "status": "analyzing" | "designing" | "coding" | "deployed",
  "tokens_spent": 12450,
  "progress": 33,
  "current_step": "designing",
  "human_decisions": [...],
  "urls": {
    "github": "https://...",
    "preview": "https://...",
    "dashboard": "https://..."
  }
}
```

### GET /api/v1/agents/status

Statut de tous les agents.

**Response** :
```json
{
  "director": {
    "status": "idle" | "running" | "error",
    "current_task": "...",
    "tokens_per_hour": 1200
  },
  ...
}
```

### POST /api/v1/human-decisions/[decisionId]/respond

Répondre à une décision.

**Request** :
```json
{
  "approved": true,
  "chosenOption": "proposal" | "alternative",
  "modifications": "..." (optional)
}
```

**Response** :
```json
{
  "success": true,
  "decision_id": "...",
  "approved": true
}
```

## Workflow Complet

```
1. User: POST /projects/init
   ↓
2. projectService.createProject()
   - Create DB record (QUEUED)
   - Add to queue
   ↓
3. queueManager processes job
   ↓
4. agentOrchestrator.runProjectGeneration()
   ↓
5. For each agent (Director → Architect → Dev → Sec → QA → DevOps):
   - executeAgent()
   - Create execution record
   - Call Claude API (simulated for now)
   - Save output to project
   - Notify via Realtime
   ↓
6. If human decision needed:
   - decisionService.createDecision()
   - Notify user via Realtime
   - Wait for response (5 min timeout)
   ↓
7. Continue with remaining agents
   ↓
8. Mark project as SUCCESS
   ↓
9. Notify project completed
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..." # Pour le backend

# Anthropic Claude (à ajouter)
ANTHROPIC_API_KEY="..."

# Optional
NODE_ENV="development" | "production"
```

## Prochaines Étapes

### À implémenter :

1. **Intégration Claude API réelle**
   - Remplacer `simulateAgentExecution()` par de vrais appels
   - Prompts spécialisés pour chaque agent
   - Gestion des tokens et coûts réels

2. **Queue robuste**
   - Migrer vers BullMQ avec Redis
   - Retry logic avec backoff
   - Dead letter queue
   - Workers scalables

3. **Realtime amélioré**
   - Créer table `realtime_events` dans Supabase
   - Broadcast channels pour WebSocket
   - Reconnection automatique

4. **Authentification**
   - Intégrer Supabase Auth
   - Protéger les routes API
   - RBAC (User, Admin, Developer)

5. **Monitoring & Logging**
   - Structured logging
   - Error tracking (Sentry)
   - Metrics (Grafana)
   - Alerting

6. **Tests**
   - Unit tests pour services
   - Integration tests pour API
   - E2E tests pour workflow

## Performance

### Optimisations actuelles :
- Singleton Prisma Client
- Async job processing
- Réutilisation des connexions DB

### À optimiser :
- Caching (Redis)
- Database indexes
- Query optimization
- Rate limiting
- CDN pour assets

## Sécurité

### Implémenté :
- Input validation
- Error handling
- Timeout sur décisions

### À ajouter :
- Rate limiting par IP
- CORS configuration
- SQL injection prevention (Prisma le fait)
- XSS prevention
- CSRF tokens
- API key authentication
