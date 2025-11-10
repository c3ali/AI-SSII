# Deployment Guide

Complete guide for deploying SSII IA Platform to production.

## Prerequisites

- Vercel account
- Supabase account
- GitHub account
- OpenAI API key
- Domain name (optional)

## Environment Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note the following:
   - Project URL
   - Anon public key
   - Service role key
   - Database password

### 2. Setup Database

```bash
# Connect to Supabase
psql -h db.<project-ref>.supabase.co -U postgres

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

### 3. Configure Environment Variables

Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Redis (Upstash)
REDIS_URL="redis://default:[password]@[host].upstash.io:6379"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"

# Authentication
NEXTAUTH_SECRET="[generate-with: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-domain.com"

# Vercel
VERCEL_TOKEN="[your-vercel-token]"

# GitHub
GITHUB_TOKEN="[your-github-token]"

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="[your-analytics-id]"
```

## Deployment Steps

### Option 1: Deploy with Vercel (Recommended)

#### Via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add NEXTAUTH_SECRET production
# ... add all other env vars
```

#### Via GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure project:
   - Framework: Next.js
   - Root directory: `./`
   - Build command: `pnpm build`
   - Install command: `pnpm install`
5. Add environment variables
6. Click "Deploy"

### Option 2: Deploy with Docker

#### Build Image

```bash
# Build
docker build -t ssii-ia:latest .

# Tag for registry
docker tag ssii-ia:latest registry.example.com/ssii-ia:latest

# Push
docker push registry.example.com/ssii-ia:latest
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: ssii-ia:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ssii_ia
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

#### Run

```bash
docker-compose up -d
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-domain.com/api/health

# Response should be:
# { "status": "ok", "timestamp": "..." }
```

### 2. Run Database Seeds (Optional)

```bash
# Seed demo data
pnpm prisma db seed
```

### 3. Setup Monitoring

#### Sentry

1. Create project at [sentry.io](https://sentry.io)
2. Add DSN to environment variables
3. Deploy again

#### Vercel Analytics

1. Enable in Vercel dashboard
2. View analytics at vercel.com/[project]/analytics

### 4. Configure Custom Domain

#### Via Vercel Dashboard

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

#### Via CLI

```bash
vercel domains add your-domain.com
```

### 5. Setup SSL

SSL is automatically configured by Vercel. No action needed.

## Performance Optimization

### 1. Enable Edge Caching

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      }
    ]
  }
}
```

### 2. Configure CDN

Vercel automatically uses its global CDN. Configure caching rules:

```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // Cache static assets
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}
```

### 3. Database Connection Pooling

Use Prisma Accelerate or Supabase connection pooling:

```env
DATABASE_URL="postgresql://postgres:[password]@[project].pooler.supabase.com:5432/postgres?pgbouncer=true"
```

## Scaling

### Horizontal Scaling

Vercel automatically scales based on traffic. No configuration needed.

### Database Scaling

Upgrade Supabase plan:
- **Free**: Good for testing
- **Pro** ($25/mo): Better for production
- **Team** ($599/mo): High traffic

### Redis Scaling

Use Upstash Redis for serverless-friendly caching:

1. Create database at [upstash.com](https://upstash.com)
2. Add connection URL to env vars
3. Configure in code:

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
});
```

## Backup & Recovery

### Database Backups

Supabase automatically backs up daily. Manual backup:

```bash
# Export database
pg_dump -h db.[project].supabase.co -U postgres -d postgres > backup.sql

# Restore
psql -h db.[project].supabase.co -U postgres -d postgres < backup.sql
```

### Code Backups

Code is on GitHub. Tag releases:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Rollback

### Vercel Rollback

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

Or via dashboard: Deployments > Select deployment > Promote to Production

### Database Rollback

```bash
# Revert last migration
pnpm prisma migrate revert

# Apply specific migration
pnpm prisma migrate deploy --to [migration-name]
```

## Monitoring & Alerts

### Setup Uptime Monitoring

Use UptimeRobot or Vercel monitoring:

1. Monitor: `https://your-domain.com/api/health`
2. Check interval: 5 minutes
3. Alert: Email/Slack on downtime

### Setup Error Alerts

Configure Sentry alerts:

1. Go to Alerts > Create Alert Rule
2. Conditions: When error count > 10 in 5 minutes
3. Actions: Send to Slack/Email

### View Logs

```bash
# Vercel logs
vercel logs [deployment-url]

# Follow logs
vercel logs [deployment-url] --follow

# Filter logs
vercel logs [deployment-url] --output=raw | grep "ERROR"
```

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection (Content Security Policy)
- [ ] CSRF tokens implemented
- [ ] Authentication tokens expire
- [ ] Database credentials rotated
- [ ] Monitoring and alerts configured

## Troubleshooting

See [Troubleshooting Guide](guides/troubleshooting.md) for common issues and solutions.

---

**Last Updated**: 2025-01-10
**Version**: 1.0.0
