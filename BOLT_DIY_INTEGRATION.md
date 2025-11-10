# Intégration des Éléments Pertinents de Bolt.diy

## Analyse et Plan d'Intégration

### 📊 Vue d'ensemble

Bolt.diy est une plateforme IDE dans le navigateur pour créer des applications full-stack avec support multi-LLM. Après analyse approfondie, voici les éléments pertinents pour la plateforme SSII IA.

---

## ✅ Éléments Pertinents à Intégrer

### 1. **Système Multi-Provider LLM** ⭐⭐⭐⭐⭐
**Priorité: CRITIQUE**

**Pourquoi c'est pertinent:**
- L'application SSII utilise déjà des agents IA (DIRECTOR, ARCHITECT, DEVELOPER, SECURITY, QA, DEVOPS)
- Support actuel limité à OpenAI et Anthropic
- Bolt.diy offre 19+ providers avec abstraction propre

**Ce qui sera intégré:**
- Architecture modulaire avec BaseProvider abstrait
- LLMManager singleton pour orchestrer tous les providers
- Support pour: OpenAI, Anthropic, Google Gemini, Groq, Mistral, DeepSeek, Cohere, etc.
- Chargement dynamique des modèles disponibles
- Cache intelligent des modèles

**Fichiers à créer:**
```
packages/llm/
├── src/
│   ├── base-provider.ts
│   ├── manager.ts
│   ├── types.ts
│   └── providers/
│       ├── openai.ts
│       ├── anthropic.ts
│       ├── google.ts
│       ├── groq.ts
│       ├── mistral.ts
│       └── deepseek.ts
```

---

### 2. **Gestion Sécurisée des Clés API** ⭐⭐⭐⭐⭐
**Priorité: CRITIQUE**

**Pourquoi c'est pertinent:**
- Actuellement, les clés API sont en variables d'environnement uniquement
- Besoin de permettre aux utilisateurs de configurer leurs propres clés
- Sécurité renforcée avec encryption AES-256-GCM

**Ce qui sera intégré:**
- Stockage chiffré des clés API dans PostgreSQL
- Service d'encryption/decryption sécurisé
- API keys par utilisateur et par provider
- Prévisualisations sécurisées (derniers 4 caractères)
- Tracking d'utilisation (lastUsedAt)

**Schéma Prisma à ajouter:**
```prisma
model ApiKey {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider    String   // 'OpenAI', 'Anthropic', etc.
  keyHash     String   // Encrypted API key
  keyPreview  String   // Last 4 characters
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, provider])
  @@index([userId])
}

model ProviderSetting {
  id         String   @id @default(cuid())
  userId     String
  provider   String
  enabled    Boolean  @default(false)
  baseUrl    String?
  settings   Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, provider])
  @@index([userId])
}

model ModelCache {
  id          String   @id @default(cuid())
  provider    String
  cacheKey    String
  models      Json
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@unique([provider, cacheKey])
  @@index([provider])
  @@index([expiresAt])
}
```

---

### 3. **Configuration Provider par Utilisateur** ⭐⭐⭐⭐
**Priorité: HAUTE**

**Pourquoi c'est pertinent:**
- Permet aux utilisateurs de choisir leurs providers préférés
- Configuration flexible (base URLs personnalisées pour Ollama, LMStudio)
- Activation/désactivation par provider

**Ce qui sera intégré:**
- Interface de settings par provider
- Toggle enable/disable
- Configuration d'endpoints personnalisés
- Validation des clés API
- Sauvegarde des préférences par utilisateur

---

### 4. **Cache Intelligent des Modèles** ⭐⭐⭐⭐
**Priorité: HAUTE**

**Pourquoi c'est pertinent:**
- Réduit les appels API inutiles
- Améliore les performances
- Économise les coûts

**Ce qui sera intégré:**
- Cache PostgreSQL avec TTL (60 minutes)
- Invalidation automatique sur expiration
- Cache par provider + clé API
- Nettoyage automatique des entrées expirées

---

### 5. **Sélection de Modèles Dynamique** ⭐⭐⭐⭐
**Priorité: HAUTE**

**Pourquoi c'est pertinent:**
- Actuellement, les modèles sont probablement codés en dur
- Besoin de s'adapter aux nouveaux modèles automatiquement
- Meilleure UX pour les utilisateurs

**Ce qui sera intégré:**
- Modèles statiques (pré-définis)
- Modèles dynamiques (récupérés via API)
- Affichage des limites de tokens
- Informations sur les coûts (si disponibles)

---

### 6. **Extension du Schéma Projet** ⭐⭐⭐
**Priorité: MOYENNE**

**Ce qui sera ajouté au modèle Project:**
```prisma
model Project {
  // ... existing fields ...

  // LLM Configuration
  selectedProvider String?   @default("OpenAI")
  selectedModel    String?   @default("gpt-4")
  modelSettings    Json?     // Temperature, max tokens, etc.

  // Agent-specific models
  directorModel    String?
  architectModel   String?
  developerModel   String?
  securityModel    String?
  qaModel          String?
  devopsModel      String?
}
```

---

### 7. **Extension du Modèle Execution** ⭐⭐⭐
**Priorité: MOYENNE**

**Ce qui sera ajouté:**
```prisma
model Execution {
  // ... existing fields ...

  // LLM Usage Details
  model         String?
  provider      String?
  promptTokens  Int?
  completionTokens Int?
  totalTokens   Int?
  modelVersion  String?
}
```

---

## 🚫 Éléments NON Pertinents (Exclus)

### ❌ WebContainer API
- **Raison:** Nécessite licence commerciale, trop complexe pour les besoins actuels
- **Alternative:** Utiliser des environnements sandbox simples si nécessaire

### ❌ Code Editor (CodeMirror)
- **Raison:** L'application génère du code via agents, pas d'édition manuelle directe
- **Note:** Peut être ajouté plus tard si besoin d'édition manuelle

### ❌ Terminal Intégré (xterm)
- **Raison:** Les exécutions sont gérées côté serveur via agents
- **Note:** Logs disponibles dans les Executions

### ❌ Déploiement One-Click (Vercel/Netlify)
- **Raison:** Déjà prévu dans l'agent DEVOPS avec VERCEL_TOKEN
- **Note:** Le système actuel suffit

### ❌ Git Integration Directe
- **Raison:** Géré par l'agent DEVOPS (githubUrl dans Project)
- **Note:** Le système actuel suffit

### ❌ Electron Desktop App
- **Raison:** Application web, pas besoin d'app desktop
- **Note:** Peut être ajouté plus tard si demandé

### ❌ MCP Integration
- **Raison:** Trop avancé pour le MVP, pas de besoin immédiat
- **Note:** Peut être ajouté plus tard

---

## 📋 Plan d'Implémentation

### Phase 1: Foundation (Jour 1-2)
1. ✅ Créer le package `packages/llm`
2. ✅ Implémenter `BaseProvider` et `LLMManager`
3. ✅ Ajouter les types TypeScript
4. ✅ Créer les services d'encryption

### Phase 2: Database Layer (Jour 2-3)
1. ✅ Étendre le schéma Prisma (ApiKey, ProviderSetting, ModelCache)
2. ✅ Créer les migrations
3. ✅ Implémenter ApiKeyService
4. ✅ Implémenter ProviderSettingsService
5. ✅ Implémenter ModelCacheService

### Phase 3: Providers (Jour 3-4)
1. ✅ Implémenter OpenAI provider
2. ✅ Implémenter Anthropic provider
3. ✅ Implémenter Google Gemini provider
4. ✅ Implémenter Groq provider
5. ✅ Implémenter Mistral provider
6. ✅ Implémenter DeepSeek provider

### Phase 4: API Routes (Jour 4-5)
1. ✅ Route `/api/providers/configure` (POST/GET)
2. ✅ Route `/api/models` (GET)
3. ✅ Route `/api/providers/validate` (POST)
4. ✅ Route `/api/providers/list` (GET)

### Phase 5: Integration avec Agents (Jour 5-6)
1. ✅ Modifier le système d'exécution des agents
2. ✅ Utiliser LLMManager dans les agents
3. ✅ Tracker les tokens et coûts
4. ✅ Permettre la sélection de modèle par agent

### Phase 6: Testing & Documentation (Jour 6-7)
1. ✅ Tests unitaires
2. ✅ Tests d'intégration
3. ✅ Documentation API
4. ✅ Mise à jour du README

---

## 🔧 Configuration Requise

### Nouvelles Variables d'Environnement

```bash
# Encryption key for API keys (generate with: openssl rand -hex 32)
API_KEY_ENCRYPTION_KEY=your-64-character-hex-key

# Additional LLM Providers (optionnel, les users peuvent configurer via UI)
GOOGLE_API_KEY=your-google-api-key
GROQ_API_KEY=your-groq-api-key
MISTRAL_API_KEY=your-mistral-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
COHERE_API_KEY=your-cohere-api-key

# Local LLM endpoints (optionnel)
OLLAMA_BASE_URL=http://localhost:11434
LMSTUDIO_BASE_URL=http://localhost:1234
```

---

## 📦 Nouvelles Dépendances

```json
{
  "dependencies": {
    "@ai-sdk/openai": "^0.0.66",
    "@ai-sdk/anthropic": "^0.0.50",
    "@ai-sdk/google": "^0.0.52",
    "@ai-sdk/mistral": "^0.0.43",
    "ai": "^3.4.29",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.17.6"
  }
}
```

---

## 🎯 Bénéfices Attendus

### Pour les Développeurs
- ✅ Code plus maintenable et extensible
- ✅ Ajout de nouveaux providers en quelques lignes
- ✅ Tests plus faciles avec mocking
- ✅ Meilleure séparation des préoccupations

### Pour les Utilisateurs
- ✅ Choix libre du provider LLM
- ✅ Configuration personnalisée par projet
- ✅ Transparence sur les coûts et tokens
- ✅ Support des LLMs locaux (Ollama)
- ✅ Meilleures performances grâce au cache

### Pour le Business
- ✅ Réduction des coûts (choix du provider le moins cher)
- ✅ Évite le vendor lock-in
- ✅ Meilleure expérience utilisateur
- ✅ Différenciation concurrentielle
- ✅ Scalabilité améliorée

---

## 📚 Documentation Bolt.diy

- Repository: https://github.com/stackblitz-labs/bolt.diy
- Documentation: https://stackblitz-labs.github.io/bolt.diy/
- Architecture: Remix (React), Cloudflare Workers, Vercel AI SDK

---

## ⚠️ Points d'Attention

1. **Sécurité**: L'encryption des clés API est CRITIQUE
2. **Performance**: Le cache doit être bien géré pour éviter les données obsolètes
3. **Coûts**: Tracker précisément l'utilisation de tokens par provider
4. **UX**: L'interface de configuration doit être simple et intuitive
5. **Compatibilité**: Assurer la rétrocompatibilité avec le système existant

---

## 🚀 Prochaines Étapes

1. Valider le plan avec l'équipe
2. Commencer la Phase 1: Foundation
3. Itérer progressivement sur les phases suivantes
4. Tester chaque phase avant de passer à la suivante

---

**Date de création:** 2025-11-10
**Auteur:** Claude Code
**Statut:** Ready for Implementation
