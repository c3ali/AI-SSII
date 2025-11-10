# Changelog - SSII IA Platform

## [2.0.0] - 2025-11-10

### 🚀 Major Features Added - Multi-Provider LLM System

#### New Package: @ssii/llm

Système multi-provider LLM inspiré de bolt.diy, offrant une abstraction unifiée pour utiliser plusieurs fournisseurs d'IA.

**Providers supportés:**
- ✅ OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5, O1)
- ✅ Anthropic (Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku)
- ✅ Google (Gemini 2.0 Flash, Gemini 1.5 Pro/Flash)
- ✅ Groq (Llama 3.3/3.1, Mixtral, Gemma)
- ✅ Mistral (Large, Medium, Small, Codestral)
- ✅ DeepSeek (Chat, Coder)

**Fonctionnalités:**
- 🔌 Interface unifiée pour tous les providers
- 🔄 Découverte dynamique des modèles disponibles
- 💾 Cache intelligent avec TTL
- 📊 Suivi détaillé des tokens et coûts
- ⚡ Full TypeScript avec types complets

**Fichiers créés:**
```
packages/llm/
├── src/
│   ├── base-provider.ts         # Classe abstraite de base
│   ├── manager.ts                # Gestionnaire singleton
│   ├── types.ts                  # Types TypeScript
│   ├── index.ts                  # Export principal
│   └── providers/                # Implémentations des providers
│       ├── openai.ts
│       ├── anthropic.ts
│       ├── google.ts
│       ├── groq.ts
│       ├── mistral.ts
│       └── deepseek.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### Gestion Sécurisée des Clés API

Système complet de gestion des clés API avec encryption AES-256-GCM.

**Fonctionnalités de sécurité:**
- 🔐 Encryption AES-256-GCM des clés API
- 🗄️ Stockage sécurisé dans PostgreSQL
- 👤 Clés API par utilisateur et par provider
- 🔍 Prévisualisations sécurisées (derniers 4 caractères)
- 📈 Tracking d'utilisation (lastUsedAt)

**Services créés:**
```
packages/database/src/services/
├── encryption.service.ts          # Encryption/Decryption AES-256-GCM
├── api-key.service.ts             # Gestion des clés API
├── provider-settings.service.ts   # Configuration des providers
├── model-cache.service.ts         # Cache des modèles
└── index.ts                       # Exports
```

#### Extension du Schéma Prisma

Nouveaux modèles pour gérer les providers LLM:

**ApiKey** - Clés API chiffrées
```prisma
model ApiKey {
  id          String
  userId      String
  provider    String    // 'OpenAI', 'Anthropic', etc.
  keyHash     String    // Clé chiffrée avec IV et auth tag
  keyPreview  String    // 4 derniers caractères
  isActive    Boolean
  lastUsedAt  DateTime?
}
```

**ProviderSetting** - Configuration par provider
```prisma
model ProviderSetting {
  id         String
  userId     String
  provider   String
  enabled    Boolean
  baseUrl    String?   // URL personnalisée (Ollama, etc.)
  settings   Json?
}
```

**UserSettings** - Préférences utilisateur
```prisma
model UserSettings {
  id                        String
  userId                    String
  defaultProvider           String?
  defaultModel              String?
  enableContextOptimization Boolean
  maxTokensPerRequest       Int?
}
```

**ModelCache** - Cache des modèles
```prisma
model ModelCache {
  id          String
  provider    String
  cacheKey    String
  models      Json
  expiresAt   DateTime
}
```

#### Extension des Modèles Existants

**Project** - Configuration LLM par projet
```prisma
// Ajouts au modèle Project
selectedProvider  String?
selectedModel     String?
modelSettings     Json?

// Modèles spécifiques par agent
directorModel     String?
architectModel    String?
developerModel    String?
securityModel     String?
qaModel           String?
devopsModel       String?
```

**Execution** - Suivi détaillé de l'utilisation
```prisma
// Ajouts au modèle Execution
model         String?
provider      String?
promptTokens  Int?
completionTokens Int?
totalTokens   Int?
modelVersion  String?
```

### 📚 Documentation

**Fichiers de documentation créés:**
- `BOLT_DIY_INTEGRATION.md` - Analyse détaillée et plan d'intégration
- `packages/llm/README.md` - Documentation du système LLM
- `CHANGELOG.md` - Ce fichier

### 🔧 Configuration

**Nouvelles variables d'environnement (.env.example):**
```bash
# Encryption pour les clés API (générer avec: openssl rand -hex 32)
API_KEY_ENCRYPTION_KEY=your-64-character-hex-encryption-key

# Providers LLM additionnels
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
GROQ_API_KEY=gsk-your-groq-api-key
MISTRAL_API_KEY=your-mistral-api-key
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```

### 🎯 Bénéfices

**Pour les développeurs:**
- ✅ Code plus maintenable et extensible
- ✅ Ajout de nouveaux providers en quelques lignes
- ✅ Tests plus faciles avec mocking
- ✅ Meilleure séparation des préoccupations

**Pour les utilisateurs:**
- ✅ Choix libre du provider LLM
- ✅ Configuration personnalisée par projet
- ✅ Transparence sur les coûts et tokens
- ✅ Support des LLMs locaux (Ollama)
- ✅ Meilleures performances grâce au cache

**Pour le business:**
- ✅ Réduction des coûts (choix du provider optimal)
- ✅ Évite le vendor lock-in
- ✅ Meilleure expérience utilisateur
- ✅ Différenciation concurrentielle
- ✅ Scalabilité améliorée

### 📝 Migration

Pour appliquer les changements:

```bash
# 1. Générer une clé d'encryption
openssl rand -hex 32

# 2. Ajouter à .env
echo "API_KEY_ENCRYPTION_KEY=your-generated-key" >> .env

# 3. Installer les dépendances du package LLM
cd packages/llm
npm install

# 4. Générer le client Prisma et appliquer les migrations
cd ../database
npm run db:generate
npm run db:migrate

# 5. (Optionnel) Seed avec données de test
npm run db:seed
```

### 🔄 Prochaines Étapes

- [ ] Créer les routes API pour la configuration des providers
- [ ] Créer l'interface utilisateur pour gérer les clés API
- [ ] Intégrer le système LLM dans les agents existants
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Créer un dashboard de suivi des coûts LLM
- [ ] Ajouter support pour Ollama et LM Studio (LLMs locaux)

### 📖 Références

- **Inspiration:** [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)
- **Documentation Vercel AI SDK:** https://sdk.vercel.ai/docs
- **Prisma Documentation:** https://www.prisma.io/docs

---

**Contributeurs:** Claude Code
**Date:** 2025-11-10
**Version:** 2.0.0
