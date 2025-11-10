# Quick Start Guide

Get up and running with SSII IA Platform in under 10 minutes.

## Prerequisites

- **Node.js** 20+ installed
- **pnpm** 8+ installed
- **Git** installed
- **OpenAI API key** ([get one here](https://platform.openai.com/api-keys))

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/c3ali/AI-SSII.git
cd AI-SSII

# Install dependencies
pnpm install
```

## Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
nano .env.local
```

Minimum required variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ssii_ia"
OPENAI_API_KEY="sk-..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 3: Database Setup

```bash
# Start PostgreSQL (via Docker)
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ssii_ia \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed demo data
pnpm prisma db seed
```

## Step 4: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Step 5: Create Your First Project

1. **Sign Up**
   - Navigate to http://localhost:3000
   - Click "Sign Up"
   - Enter your email and password

2. **Create Project**
   - Click "Nouveau Projet"
   - Enter a brief:
     ```
     Create a blog platform with markdown support,
     user authentication, and comment system
     ```
   - Select stack: Next.js
   - Click "Lancer le projet"

3. **Watch the Magic**
   - 6 agents will work sequentially
   - Real-time progress updates
   - ~5-10 minutes for completion

4. **View Results**
   - Code generated
   - Tests written (>90% coverage)
   - Security audit passed (OWASP >9/10)
   - Deployed to Vercel
   - Click deployment URL to see live app!

## What's Next?

- 📖 Read the [Architecture Documentation](../ARCHITECTURE.md)
- 🔧 Explore the [API Reference](../API.md)
- 🚀 Learn about [Deployment](../DEPLOYMENT.md)
- 🐛 Check [Troubleshooting](troubleshooting.md) if you face issues

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report

# Database
pnpm prisma studio    # Open Prisma Studio
pnpm prisma migrate dev # Create migration
pnpm prisma generate  # Generate Prisma Client

# Linting
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
```

## Need Help?

- 💬 [Discord Community](https://discord.gg/ssii-ia)
- 📧 Email: support@ssii-ia.com
- 🐛 [Report an Issue](https://github.com/c3ali/AI-SSII/issues)

---

Happy coding! 🚀
