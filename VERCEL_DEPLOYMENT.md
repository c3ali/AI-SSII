# Guide de Déploiement Vercel - SSII IA Platform

## 🚀 Configuration Vercel

### Problèmes Résolus

1. ✅ **Schéma Prisma synchronisé** - `apps/web/prisma/schema.prisma` mis à jour avec les nouveaux modèles LLM
2. ✅ **Configuration Vercel** - `vercel.json` créé pour monorepo
3. ✅ **Fichier .vercelignore** - Optimisation du build

---

## 📝 Variables d'Environnement Vercel

### Étape 1: Accéder aux Settings

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet `AI-SSII`
3. Aller dans **Settings** → **Environment Variables**

### Étape 2: Ajouter les Variables Requises

#### 🗄️ Base de Données (OBLIGATOIRE)

```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"

# Redis (optionnel, pour cache)
REDIS_URL="redis://default:PASSWORD@HOST:6379"
```

> **Important:** Utilisez une base de données PostgreSQL en production (Vercel Postgres, Supabase, Neon, etc.)

#### 🔐 Sécurité (OBLIGATOIRE)

```bash
# JWT pour authentification
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_EXPIRATION="7d"

# Session
SESSION_SECRET="your-super-secret-session-key-at-least-32-chars"

# Encryption pour API Keys (CRITIQUE)
API_KEY_ENCRYPTION_KEY="your-64-character-hex-encryption-key"
```

> **Générer API_KEY_ENCRYPTION_KEY:**
> ```bash
> openssl rand -hex 32
> ```

#### 🤖 LLM Providers (Optionnel)

Les utilisateurs peuvent configurer leurs propres clés via l'interface, mais vous pouvez aussi fournir des clés par défaut :

```bash
# OpenAI (optionnel)
OPENAI_API_KEY="sk-..."

# Anthropic (optionnel)
ANTHROPIC_API_KEY="sk-ant-..."

# Google Gemini (optionnel)
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Groq (optionnel)
GROQ_API_KEY="gsk_..."

# Mistral (optionnel)
MISTRAL_API_KEY="..."

# DeepSeek (optionnel)
DEEPSEEK_API_KEY="sk-..."
```

#### 🔧 Application Settings

```bash
NODE_ENV="production"
PORT="3000"

# CORS (adapter selon votre domaine)
CORS_ORIGINS="https://your-app.vercel.app"

# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="60000"
```

#### 📧 Email (Optionnel)

```bash
EMAIL_FROM="noreply@your-domain.com"
RESEND_API_KEY="re_..."
```

#### 📦 Storage (Optionnel)

```bash
S3_BUCKET="your-bucket"
S3_REGION="eu-west-1"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

#### 🔗 Intégrations Externes (Optionnel)

```bash
# GitHub (pour agent DEVOPS)
GITHUB_TOKEN="ghp_..."
GITHUB_ORG="your-org"

# Vercel (pour déploiement automatique)
VERCEL_TOKEN="..."

# Stripe (pour billing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 🏗️ Build Settings

### Dans Vercel Dashboard → Settings → Build & Development Settings

**Framework Preset:** Next.js (ou Other si monorepo custom)

**Build Command:**
```bash
cd apps/web && npm run build
```

**Output Directory:**
```bash
apps/web/.next
```

**Install Command:**
```bash
npm install
```

**Root Directory:** (laisser vide ou `.`)

---

## 🗃️ Configuration PostgreSQL

### Option 1: Vercel Postgres (Recommandé)

1. Dans votre projet Vercel → **Storage** → **Create Database**
2. Choisir **Postgres**
3. Les variables `DATABASE_URL` et `POSTGRES_*` sont auto-configurées

### Option 2: Supabase

1. Créer un projet sur [Supabase](https://supabase.com)
2. Aller dans **Settings** → **Database**
3. Copier la **Connection String** (mode Transaction)
4. Ajouter `?sslmode=require` à la fin

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require"
```

### Option 3: Neon

1. Créer un projet sur [Neon](https://neon.tech)
2. Copier la **Connection String**

```bash
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DB]?sslmode=require"
```

### Option 4: Railway

1. Créer un service PostgreSQL sur [Railway](https://railway.app)
2. Copier la **Connection URL**

---

## 🔄 Migration de Base de Données

### Après avoir configuré DATABASE_URL

Vercel ne peut pas exécuter `prisma migrate deploy` automatiquement. Vous avez 2 options :

#### Option 1: Build Hook (Recommandé)

Ajouter dans `package.json` de `apps/web` :

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

#### Option 2: GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd packages/database
          npx prisma migrate deploy

      - name: Deploy to Vercel
        run: npx vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 Vérification Post-Déploiement

### 1. Tester la Base de Données

```bash
# En local, pointer vers la DB de production
DATABASE_URL="..." npx prisma db pull
```

### 2. Vérifier les Logs

Dans Vercel Dashboard → **Deployments** → Cliquer sur le dernier déploiement → **View Function Logs**

### 3. Tester les Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test database
curl https://your-app.vercel.app/api/db-status
```

---

## ⚠️ Problèmes Courants

### 1. Erreur "Prisma Client not generated"

**Solution:** Ajouter `prisma generate` dans le build command

```json
"build": "prisma generate && next build"
```

### 2. Erreur "Migration failed"

**Solution:** Appliquer les migrations manuellement avant le build

```bash
# En local
DATABASE_URL="<production-url>" npx prisma migrate deploy
```

### 3. Erreur "API_KEY_ENCRYPTION_KEY not set"

**Solution:** Générer et ajouter la clé dans Vercel Environment Variables

```bash
openssl rand -hex 32
```

### 4. Timeout lors du Build

**Solution:** Optimiser les dépendances ou utiliser Vercel Pro

- Vérifier que `node_modules` est dans `.vercelignore`
- Utiliser `npm ci` au lieu de `npm install`

### 5. Erreur "Cannot find module '@ssii/llm'"

**Solution:** S'assurer que le monorepo est bien configuré

Ajouter dans `apps/web/package.json` :

```json
{
  "dependencies": {
    "@ssii/llm": "workspace:*",
    "@ssii/database": "workspace:*"
  }
}
```

---

## 🎯 Checklist de Déploiement

- [ ] ✅ Schéma Prisma synchronisé (`apps/web/prisma/schema.prisma`)
- [ ] Variables d'environnement configurées dans Vercel
- [ ] `DATABASE_URL` pointant vers PostgreSQL en production
- [ ] `API_KEY_ENCRYPTION_KEY` généré et configuré
- [ ] Build command inclut `prisma generate`
- [ ] Migrations appliquées à la base de données
- [ ] Tests locaux passent
- [ ] Premier déploiement réussi
- [ ] Logs Vercel vérifiés
- [ ] Application accessible et fonctionnelle

---

## 📚 Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

**Date:** 2025-11-10
**Version:** 2.0.0
