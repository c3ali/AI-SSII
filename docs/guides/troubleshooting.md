# Troubleshooting Guide

Common issues and their solutions.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Development Issues](#development-issues)
- [Testing Issues](#testing-issues)
- [Deployment Issues](#deployment-issues)
- [Runtime Issues](#runtime-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### `pnpm install` fails

**Problem**: Dependencies installation fails

**Solutions**:

1. Clear pnpm cache:
```bash
pnpm store prune
pnpm install
```

2. Use correct Node version:
```bash
node --version  # Should be 20+
nvm use 20
```

3. Delete lock file and reinstall:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Prisma generate fails

**Problem**: `prisma generate` command fails

**Solutions**:

1. Check DATABASE_URL in .env:
```bash
cat .env | grep DATABASE_URL
```

2. Ensure schema is valid:
```bash
pnpm prisma validate
```

3. Force regenerate:
```bash
pnpm prisma generate --force
```

## Development Issues

### Port 3000 already in use

**Problem**: `Error: Port 3000 is already in use`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 [PID]

# Or use different port
PORT=3001 pnpm dev
```

### Hot reload not working

**Problem**: Changes not reflected automatically

**Solutions**:

1. Check `.next` directory:
```bash
rm -rf .next
pnpm dev
```

2. Increase file watcher limit (Linux):
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. Disable turbopack (if using):
```bash
pnpm dev --no-turbopack
```

### TypeScript errors

**Problem**: Type errors in IDE but build succeeds

**Solution**:

```bash
# Restart TypeScript server in VSCode
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"

# Or rebuild types
pnpm prisma generate
```

## Testing Issues

### Playwright tests fail

**Problem**: E2E tests fail to run

**Solutions**:

1. Install browsers:
```bash
pnpm exec playwright install
pnpm exec playwright install-deps
```

2. Start dev server before running tests:
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm test:e2e
```

3. Check baseURL in playwright.config.ts:
```typescript
use: {
  baseURL: 'http://localhost:3000',
}
```

### Vitest tests fail

**Problem**: Unit tests fail

**Solutions**:

1. Clear test cache:
```bash
pnpm vitest --clearCache
```

2. Check test database connection:
```bash
# In .env.test
DATABASE_URL="postgresql://test:test@localhost:5433/test_db"
```

3. Run single test file:
```bash
pnpm vitest tests/unit/agents/director.test.ts
```

### Coverage threshold not met

**Problem**: `Coverage threshold not met`

**Solution**:

```bash
# Generate coverage report
pnpm test:coverage

# View detailed report
open coverage/index.html

# Adjust thresholds in vitest.config.ts if needed (temporarily)
coverage: {
  thresholds: {
    lines: 85,  // Lower from 90
  }
}
```

## Deployment Issues

### Vercel build fails

**Problem**: Build fails on Vercel

**Solutions**:

1. Check build logs in Vercel dashboard

2. Verify environment variables are set:
   - DATABASE_URL
   - OPENAI_API_KEY
   - NEXTAUTH_SECRET

3. Test build locally:
```bash
pnpm build
```

4. Check Node version matches:
```json
// package.json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Database migrations fail

**Problem**: Migrations fail on deploy

**Solutions**:

1. Run migrations manually:
```bash
pnpm prisma migrate deploy
```

2. Check DATABASE_URL format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

3. Reset database (development only):
```bash
pnpm prisma migrate reset
```

### Environment variables not found

**Problem**: `Error: Environment variable not found`

**Solutions**:

1. Add to Vercel dashboard:
   - Settings > Environment Variables

2. Restart deployment:
```bash
vercel --prod
```

3. Check .env.example vs actual .env

## Runtime Issues

### OpenAI API errors

**Problem**: `Error: OpenAI API request failed`

**Solutions**:

1. Check API key:
```bash
echo $OPENAI_API_KEY
```

2. Verify API key has credits:
   - Visit platform.openai.com/account/billing

3. Check rate limits:
```typescript
// Add retry logic
import { retry } from '@/lib/retry';

const result = await retry(() =>
  openai.chat.completions.create({...})
, { retries: 3 });
```

4. Handle 429 errors:
```typescript
if (error.status === 429) {
  await new Promise(r => setTimeout(r, 60000)); // Wait 1 minute
  // Retry request
}
```

### WebSocket connection fails

**Problem**: Real-time updates not working

**Solutions**:

1. Check WebSocket URL:
```javascript
const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000');
```

2. Verify CORS settings:
```typescript
// pages/api/socket.ts
const io = new Server(res.socket.server, {
  cors: {
    origin: process.env.NEXTAUTH_URL,
    methods: ["GET", "POST"]
  }
});
```

3. Check firewall/proxy settings

### Agent workflow stuck

**Problem**: Workflow doesn't progress

**Solutions**:

1. Check agent execution logs:
```bash
# Via API
curl https://api.example.com/api/projects/{id}/agents

# Via database
psql -c "SELECT * FROM \"AgentExecution\" WHERE \"projectId\" = 'xxx';"
```

2. Cancel and restart:
```bash
curl -X POST https://api.example.com/api/projects/{id}/cancel
```

3. Check Redis connection:
```bash
redis-cli ping
# Should return: PONG
```

## Database Issues

### Connection pool exhausted

**Problem**: `Error: Connection pool exhausted`

**Solutions**:

1. Increase connection limit:
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  relationMode = "prisma"

  // Add connection pooling
  poolTimeout = 60
  connectionLimit = 10
}
```

2. Use connection pooling:
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

3. Close connections properly:
```typescript
// Always use prisma.$disconnect()
finally {
  await prisma.$disconnect();
}
```

### Migration conflicts

**Problem**: Migration conflicts between branches

**Solution**:

```bash
# Reset migrations (dev only!)
pnpm prisma migrate reset

# Create new migration
pnpm prisma migrate dev --name merge-fix

# Or resolve manually
pnpm prisma migrate resolve --applied [migration-name]
```

### Query timeout

**Problem**: `Error: Query timeout`

**Solutions**:

1. Add indexes:
```prisma
model Project {
  // ...fields

  @@index([userId, status])
  @@index([createdAt])
}
```

2. Optimize query:
```typescript
// Before
const projects = await prisma.project.findMany({
  include: { agentExecutions: true }
});

// After (only needed fields)
const projects = await prisma.project.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    agentExecutions: {
      select: { agentName: true, status: true }
    }
  }
});
```

3. Increase timeout:
```typescript
await prisma.$queryRaw`...`.timeout(30000);
```

## Authentication Issues

### JWT token invalid

**Problem**: `Error: Invalid token`

**Solutions**:

1. Check NEXTAUTH_SECRET:
```bash
echo $NEXTAUTH_SECRET
# Should be set and same across deployments
```

2. Regenerate secret:
```bash
openssl rand -base64 32
```

3. Clear cookies and login again

### Session expired

**Problem**: User logged out unexpectedly

**Solutions**:

1. Increase session duration:
```typescript
// [...nextauth].ts
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

2. Implement refresh tokens

3. Check cookie settings:
```typescript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  }
}
```

## Performance Issues

### Slow page loads

**Problem**: Pages load slowly

**Solutions**:

1. Enable caching:
```typescript
// Enable SWR
import useSWR from 'swr';

const { data } = useSWR('/api/projects', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000
});
```

2. Implement pagination:
```typescript
const projects = await prisma.project.findMany({
  take: 10,
  skip: page * 10
});
```

3. Use React.lazy for code splitting:
```typescript
const Dashboard = lazy(() => import('@/components/Dashboard'));
```

### High API latency

**Problem**: API requests take too long

**Solutions**:

1. Add caching layer:
```typescript
import { redis } from '@/lib/redis';

const cached = await redis.get(`projects:${userId}`);
if (cached) return JSON.parse(cached);

const projects = await prisma.project.findMany(...);
await redis.set(`projects:${userId}`, JSON.stringify(projects), 'EX', 300);
```

2. Optimize database queries (see above)

3. Use Edge Functions:
```typescript
// Add to API route
export const config = {
  runtime: 'edge',
};
```

### Memory leaks

**Problem**: Memory usage increases over time

**Solutions**:

1. Clean up event listeners:
```typescript
useEffect(() => {
  const handler = () => {...};
  socket.on('event', handler);

  return () => {
    socket.off('event', handler);
  };
}, []);
```

2. Close database connections:
```typescript
// Always disconnect
await prisma.$disconnect();
```

3. Monitor with Vercel Analytics

## Getting Help

If you're still stuck:

1. **Check logs**:
   - Vercel: `vercel logs`
   - Local: Check terminal output
   - Database: Supabase dashboard

2. **Search issues**: [GitHub Issues](https://github.com/c3ali/AI-SSII/issues)

3. **Ask for help**:
   - Discord: [Join server](https://discord.gg/ssii-ia)
   - Email: support@ssii-ia.com

4. **Create an issue**:
   - Include error message
   - Include steps to reproduce
   - Include environment (OS, Node version, etc.)

---

**Last Updated**: 2025-01-10
