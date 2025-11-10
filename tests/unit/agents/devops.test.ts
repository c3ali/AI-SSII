import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevOpsAgent } from '@/agents/devops';

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('DevOpsAgent', () => {
  let agent: DevOpsAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new DevOpsAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('deploy', () => {
    it('should deploy to Vercel and Supabase', async () => {
      const codebase = {
        files: [
          {
            path: 'src/app/page.tsx',
            content: 'export default function Home() {}',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/app'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js 14' },
        backend: { framework: 'Next.js API Routes' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              deploymentUrl: 'https://my-app.vercel.app',
              databaseUrl: 'https://abc123.supabase.co',
              status: 'deployed',
              infrastructure: {
                hosting: {
                  provider: 'Vercel',
                  region: 'us-east-1',
                  instanceType: 'serverless'
                },
                database: {
                  provider: 'Supabase',
                  region: 'us-east-1',
                  plan: 'free'
                },
                cdn: {
                  provider: 'Vercel CDN',
                  enabled: true
                }
              },
              environmentVariables: [
                { key: 'DATABASE_URL', configured: true },
                { key: 'NEXTAUTH_SECRET', configured: true },
                { key: 'OPENAI_API_KEY', configured: true }
              ],
              cicd: {
                provider: 'Vercel',
                autoDeployOnPush: true,
                branch: 'main'
              },
              costs: {
                monthly: 0,
                breakdown: {
                  hosting: 0,
                  database: 0,
                  cdn: 0
                }
              },
              healthChecks: {
                status: 'healthy',
                responseTime: 245,
                uptime: 100
              }
            })
          }
        }]
      });

      const result = await agent.deploy(codebase, architecture);

      expect(result.deploymentUrl).toMatch(/https:\/\/.+\.vercel\.app/);
      expect(result.databaseUrl).toMatch(/https:\/\/.+\.supabase\.co/);
      expect(result.status).toBe('deployed');
      expect(result.costs.monthly).toBeLessThanOrEqual(50);
    });

    it('should configure environment variables', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              deploymentUrl: 'https://app.vercel.app',
              databaseUrl: 'https://db.supabase.co',
              status: 'deployed',
              infrastructure: {
                hosting: { provider: 'Vercel', region: 'us-east-1', instanceType: 'serverless' },
                database: { provider: 'Supabase', region: 'us-east-1', plan: 'free' },
                cdn: { provider: 'Vercel CDN', enabled: true }
              },
              environmentVariables: [
                { key: 'DATABASE_URL', configured: true },
                { key: 'NEXTAUTH_URL', configured: true },
                { key: 'NEXTAUTH_SECRET', configured: true },
                { key: 'OPENAI_API_KEY', configured: true },
                { key: 'STRIPE_SECRET_KEY', configured: true }
              ],
              cicd: {
                provider: 'Vercel',
                autoDeployOnPush: true,
                branch: 'main'
              },
              costs: { monthly: 0, breakdown: { hosting: 0, database: 0, cdn: 0 } },
              healthChecks: { status: 'healthy', responseTime: 200, uptime: 100 }
            })
          }
        }]
      });

      const result = await agent.deploy(codebase, architecture);

      expect(result.environmentVariables.length).toBeGreaterThan(0);
      expect(result.environmentVariables.every(v => v.configured)).toBe(true);
    });

    it('should setup CI/CD pipeline', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              deploymentUrl: 'https://app.vercel.app',
              databaseUrl: 'https://db.supabase.co',
              status: 'deployed',
              infrastructure: {
                hosting: { provider: 'Vercel', region: 'us-east-1', instanceType: 'serverless' },
                database: { provider: 'Supabase', region: 'us-east-1', plan: 'free' },
                cdn: { provider: 'Vercel CDN', enabled: true }
              },
              environmentVariables: [],
              cicd: {
                provider: 'Vercel',
                autoDeployOnPush: true,
                branch: 'main',
                previewDeployments: true,
                buildCommand: 'pnpm build',
                testCommand: 'pnpm test'
              },
              costs: { monthly: 0, breakdown: { hosting: 0, database: 0, cdn: 0 } },
              healthChecks: { status: 'healthy', responseTime: 180, uptime: 100 }
            })
          }
        }]
      });

      const result = await agent.deploy(codebase, architecture);

      expect(result.cicd.provider).toBe('Vercel');
      expect(result.cicd.autoDeployOnPush).toBe(true);
      expect(result.cicd.branch).toBe('main');
    });

    it('should validate infrastructure costs < 50€/month', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              deploymentUrl: 'https://app.vercel.app',
              databaseUrl: 'https://db.supabase.co',
              status: 'deployed',
              infrastructure: {
                hosting: { provider: 'Vercel', region: 'us-east-1', instanceType: 'serverless' },
                database: { provider: 'Supabase', region: 'us-east-1', plan: 'free' },
                cdn: { provider: 'Vercel CDN', enabled: true }
              },
              environmentVariables: [],
              cicd: {
                provider: 'Vercel',
                autoDeployOnPush: true,
                branch: 'main'
              },
              costs: {
                monthly: 35,
                breakdown: {
                  hosting: 20,
                  database: 10,
                  cdn: 5
                }
              },
              healthChecks: { status: 'healthy', responseTime: 200, uptime: 100 }
            })
          }
        }]
      });

      const result = await agent.deploy(codebase, architecture);

      expect(result.costs.monthly).toBeLessThanOrEqual(50);
    });

    it('should run health checks', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              deploymentUrl: 'https://app.vercel.app',
              databaseUrl: 'https://db.supabase.co',
              status: 'deployed',
              infrastructure: {
                hosting: { provider: 'Vercel', region: 'us-east-1', instanceType: 'serverless' },
                database: { provider: 'Supabase', region: 'us-east-1', plan: 'free' },
                cdn: { provider: 'Vercel CDN', enabled: true }
              },
              environmentVariables: [],
              cicd: {
                provider: 'Vercel',
                autoDeployOnPush: true,
                branch: 'main'
              },
              costs: { monthly: 0, breakdown: { hosting: 0, database: 0, cdn: 0 } },
              healthChecks: {
                status: 'healthy',
                responseTime: 180,
                uptime: 99.9,
                checks: [
                  { name: 'Homepage', url: '/', status: 200, time: 120 },
                  { name: 'API', url: '/api/health', status: 200, time: 50 },
                  { name: 'Database', status: 'connected', time: 10 }
                ]
              }
            })
          }
        }]
      });

      const result = await agent.deploy(codebase, architecture);

      expect(result.healthChecks.status).toBe('healthy');
      expect(result.healthChecks.uptime).toBeGreaterThanOrEqual(99);
    });

    it('should handle deployment failures', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('Deployment failed')
      );

      await expect(agent.deploy(codebase, architecture)).rejects.toThrow('Deployment failed');
    });
  });
});
