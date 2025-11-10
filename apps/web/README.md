# SSII IA Platform - Frontend

Interface web moderne pour piloter 6 agents IA qui génèrent automatiquement des applications.

## Stack Technique

- **Framework**: Next.js 14 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Workflow Visualization**: React Flow
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js
- **WebSocket**: Native WebSocket client

## Structure du Projet

```
apps/web/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Routes d'authentification
│   ├── projects/          # Pages projets
│   ├── api/               # Routes API
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── ui/               # Composants UI (shadcn)
│   ├── layout/           # Composants layout
│   ├── dashboard/        # Composants dashboard
│   ├── project/          # Composants projet
│   ├── workflow/         # Workflow canvas
│   └── metrics/          # Métriques et charts
├── lib/                   # Utilitaires
│   ├── api-client.ts     # Client API
│   ├── websocket.ts      # Client WebSocket
│   └── auth.ts           # Configuration NextAuth
├── hooks/                 # Hooks personnalisés
├── stores/                # Stores Zustand
├── types/                 # Types TypeScript
└── public/                # Fichiers statiques
```

## Fonctionnalités

### Dashboard
- Vue d'ensemble des projets actifs
- Statut en temps réel des agents IA
- Statistiques et métriques
- Actions rapides

### Gestion des Projets
- Création de projet avec wizard multi-étapes
- Liste et filtrage des projets
- Détail de projet avec tabs
- Visualisation du workflow
- Métriques détaillées

### Workflow
- Canvas interactif avec React Flow
- Visualisation des 6 agents IA :
  - 🏗️ Architect Agent
  - ⚙️ Backend Agent
  - 🎨 Frontend Agent
  - 🗄️ Database Agent
  - 🧪 Testing Agent
  - 🚀 Deployment Agent
- Statut en temps réel via WebSocket
- Progress tracking

### Authentification
- Login/Register
- Session management avec NextAuth
- Protected routes

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos configurations

# Démarrer le serveur de développement
npm run dev
```

## Scripts Disponibles

```bash
npm run dev          # Démarrer en mode développement
npm run build        # Créer le build de production
npm run start        # Démarrer le serveur de production
npm run lint         # Linter le code
```

## Configuration

### Variables d'Environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Composants Principaux

### Dashboard
- `StatsCards` : Cartes de statistiques
- `AgentStatusGrid` : Grille des statuts agents
- `RecentProjects` : Liste des projets récents
- `QuickActions` : Actions rapides

### Layout
- `Header` : En-tête avec navigation
- `Sidebar` : Sidebar avec menu
- `Footer` : Pied de page
- `MainLayout` : Layout principal

### Workflow
- `WorkflowCanvas` : Canvas React Flow
- Visualisation des agents
- Connexions et dépendances

## WebSocket

Le client WebSocket se connecte automatiquement au backend pour recevoir :
- Mises à jour du statut des agents
- Progression en temps réel
- Logs d'exécution
- Checkpoints pour validation

## API Routes

Les routes API Next.js servent de proxy/mock :

- `GET /api/projects` : Liste des projets
- `POST /api/projects` : Créer un projet
- `GET /api/projects/[id]` : Détail d'un projet
- `PATCH /api/projects/[id]` : Mettre à jour un projet
- `DELETE /api/projects/[id]` : Supprimer un projet

## Thèmes

Support du mode clair/sombre via next-themes :
- Switcher automatique système
- Persistance de la préférence
- Variables CSS personnalisables

## Développement

### Ajouter un Composant UI

```bash
# Les composants shadcn/ui sont déjà configurés
# Pour ajouter de nouveaux composants, créez-les dans components/ui/
```

### Créer une Nouvelle Page

```bash
# Créer un fichier dans app/
# Exemple : app/analytics/page.tsx
```

### Ajouter un Store Zustand

```typescript
// stores/mon-store.ts
import { create } from "zustand"

interface MonStore {
  data: any
  setData: (data: any) => void
}

export const useMonStore = create<MonStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}))
```

## Déploiement

Le projet peut être déployé sur :
- Vercel (recommandé)
- Netlify
- Docker
- Serveur Node.js

```bash
npm run build
npm run start
```

## Support

Pour toute question ou problème, consultez la documentation ou créez une issue.

## Licence

MIT
