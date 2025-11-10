# 🚀 SSII IA Platform

> Plateforme de génération automatique d'applications web/mobile via 6 agents IA spécialisés

[![CI](https://github.com/c3ali/AI-SSII/actions/workflows/ci.yml/badge.svg)](https://github.com/c3ali/AI-SSII/actions)
[![Coverage](https://codecov.io/gh/c3ali/AI-SSII/branch/main/graph/badge.svg)](https://codecov.io/gh/c3ali/AI-SSII)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## ✨ Features

- 🤖 **6 Agents Spécialisés** : Director, Architect, Developer, Security, QA, DevOps
- 🔄 **Orchestration LangGraph** : Workflow intelligent avec points de validation
- 📊 **Dashboard Real-time** : Suivi en temps réel via WebSocket
- 🎯 **Qualité Garantie** : Coverage > 90%, OWASP > 9/10, Lighthouse > 95
- 💰 **Optimisé Coûts** : < 50€/mois d'infrastructure
- 🚀 **Déploiement Automatique** : Vercel + Supabase en < 5 min

## 🏗 Architecture

```mermaid
graph TB
    Client[Dashboard Next.js] --> API[FastAPI Backend]
    API --> Director[Director Agent]
    Director --> Architect[Architect Agent]
    Architect --> Developer[Developer Agent]
    Developer --> Security[Security Agent]
    Security --> QA[QA Agent]
    QA --> DevOps[DevOps Agent]
    DevOps --> Deploy[Vercel/Supabase]

    API --> DB[(PostgreSQL)]
    API --> Redis[(Redis Queue)]
    API --> OpenAI[OpenAI GPT-4]
```

### Les 6 Agents

1. **Director Agent** 🎯
   - Analyse le brief client
   - Génère le plan projet avec user stories
   - Estimation temps et budget

2. **Architect Agent** 🏗️
   - Conception architecture technique
   - Choix de la stack technologique
   - Schéma de base de données

3. **Developer Agent** 👨‍💻
   - Génération du code source complet
   - Respect des best practices
   - Code TypeScript type-safe

4. **Security Agent** 🔒
   - Audit sécurité OWASP Top 10
   - Score > 9/10 garanti
   - Recommandations automatiques

5. **QA Agent** ✅
   - Tests unitaires, intégration, E2E
   - Coverage > 90%
   - Lighthouse scores > 95

6. **DevOps Agent** 🚀
   - Déploiement automatique
   - Configuration CI/CD
   - Monitoring et health checks

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **Docker & Docker Compose**
- **pnpm** 8+

### Installation

```bash
# Clone repository
git clone https://github.com/c3ali/AI-SSII.git
cd AI-SSII

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start services
docker-compose up -d

# Run database migrations
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ssii_ia"
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Deployment
VERCEL_TOKEN="your-vercel-token"
GITHUB_TOKEN="your-github-token"
```

### First Project

1. Open http://localhost:3000
2. Create account or login
3. Click **"Nouveau Projet"**
4. Enter your brief:
   ```
   Créer une application e-commerce avec paiement Stripe
   et gestion de stock en temps réel
   ```
5. Select stack (Next.js, React Native, etc.)
6. Click **"Lancer"** and watch the magic happen! ✨

## 📚 Documentation

- [Architecture Details](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Agent Development Guide](docs/guides/agent-development.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/guides/troubleshooting.md)

## 🧪 Testing

### Run All Tests

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Load tests
pnpm test:load

# Coverage report
pnpm test:coverage
```

### Test Coverage

| Type | Coverage | Target |
|------|----------|--------|
| Unit | 94.2% | > 90% |
| Integration | 91.5% | > 90% |
| E2E | 88.3% | > 85% |

### Quality Metrics

- **OWASP Score**: 9.5/10 ✅
- **Lighthouse Performance**: 97/100 ✅
- **Lighthouse Accessibility**: 100/100 ✅
- **Lighthouse Best Practices**: 96/100 ✅
- **Code Duplication**: < 3% ✅

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes / FastAPI
- **ORM**: Prisma
- **Queue**: Redis + Bull
- **Real-time**: Socket.io / WebSocket

### Database
- **Primary**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Storage**: Supabase Storage

### AI & ML
- **LLM**: OpenAI GPT-4 Turbo
- **Orchestration**: LangGraph
- **Prompting**: Structured outputs with Zod

### DevOps
- **Hosting**: Vercel (Frontend), Railway (Backend)
- **Database**: Supabase
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Vercel Analytics

### Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Load**: k6
- **Coverage**: Vitest Coverage (v8)

## 🎯 Roadmap

### Q1 2025
- [x] MVP avec 6 agents
- [x] Dashboard temps réel
- [x] Tests > 90% coverage
- [ ] Support multi-langues
- [ ] Templates de projets

### Q2 2025
- [ ] Agent customization
- [ ] Marketplace de templates
- [ ] API publique
- [ ] CLI tool
- [ ] VS Code extension

### Q3 2025
- [ ] Support React Native
- [ ] Support Flutter
- [ ] Agents spécialisés par domaine
- [ ] Collaboration multi-utilisateurs

## 🤝 Contributing

Les contributions sont bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

### Development Workflow

1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Code Style

- **ESLint** : `pnpm lint`
- **Prettier** : `pnpm format`
- **TypeScript** : Strict mode activé
- **Tests** : Coverage > 90% requis

## 📄 License

Ce projet est sous licence MIT - voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) pour GPT-4
- [Vercel](https://vercel.com/) pour l'hébergement
- [Supabase](https://supabase.com/) pour la base de données
- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI

## 📞 Support

- 📧 Email: support@ssii-ia.com
- 💬 Discord: [Join our server](https://discord.gg/ssii-ia)
- 📖 Documentation: [docs.ssii-ia.com](https://docs.ssii-ia.com)
- 🐛 Issues: [GitHub Issues](https://github.com/c3ali/AI-SSII/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=c3ali/AI-SSII&type=Date)](https://star-history.com/#c3ali/AI-SSII&Date)

---

Made with ❤️ by the SSII IA Team
