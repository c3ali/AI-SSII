import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeveloperAgent } from '@/agents/developer';

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('DeveloperAgent', () => {
  let agent: DeveloperAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new DeveloperAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate code from architecture', async () => {
      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js 14' },
        backend: { framework: 'Next.js API Routes', orm: 'Prisma' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              files: [
                {
                  path: 'src/app/page.tsx',
                  content: 'export default function Home() { return <div>Home</div>; }',
                  language: 'typescript'
                },
                {
                  path: 'src/app/api/products/route.ts',
                  content: 'export async function GET() { return Response.json([]); }',
                  language: 'typescript'
                },
                {
                  path: 'prisma/schema.prisma',
                  content: 'model Product { id String @id }',
                  language: 'prisma'
                }
              ],
              structure: {
                directories: ['src/app', 'src/components', 'prisma'],
                entryPoint: 'src/app/page.tsx'
              }
            })
          }
        }]
      });

      const result = await agent.generate(architecture, []);

      expect(result.files).toHaveLength(3);
      expect(result.files).toContainEqual(
        expect.objectContaining({
          path: 'src/app/page.tsx',
          language: 'typescript'
        })
      );
      expect(result.structure.entryPoint).toBe('src/app/page.tsx');
    });

    it('should implement user stories', async () => {
      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      const userStories = [
        {
          title: 'User can login',
          description: 'Authentication feature',
          acceptanceCriteria: ['Email/password login'],
          estimationHours: 3,
          priority: 'Must' as const
        }
      ];

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              files: [
                {
                  path: 'src/app/login/page.tsx',
                  content: 'export default function Login() { return <form>Login</form>; }',
                  language: 'typescript'
                },
                {
                  path: 'src/lib/auth.ts',
                  content: 'export async function login() {}',
                  language: 'typescript'
                }
              ],
              structure: {
                directories: ['src/app/login', 'src/lib'],
                entryPoint: 'src/app/page.tsx'
              }
            })
          }
        }]
      });

      const result = await agent.generate(architecture, userStories);

      const authFiles = result.files.filter(f =>
        f.path.includes('login') || f.path.includes('auth')
      );
      expect(authFiles.length).toBeGreaterThan(0);
    });

    it('should follow Next.js best practices', async () => {
      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js 14' },
        backend: { framework: 'Next.js API Routes' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'App Router' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              files: [
                {
                  path: 'src/app/layout.tsx',
                  content: 'export default function RootLayout({ children }) { return <html><body>{children}</body></html>; }',
                  language: 'typescript'
                },
                {
                  path: 'src/app/page.tsx',
                  content: 'export default function Page() { return <div>Page</div>; }',
                  language: 'typescript'
                }
              ],
              structure: {
                directories: ['src/app'],
                entryPoint: 'src/app/page.tsx'
              }
            })
          }
        }]
      });

      const result = await agent.generate(architecture, []);

      // Should have app router structure
      expect(result.files.some(f => f.path.includes('app/layout.tsx'))).toBe(true);
      expect(result.files.some(f => f.path.includes('app/page.tsx'))).toBe(true);
    });

    it('should generate TypeScript files', async () => {
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
              files: [
                {
                  path: 'src/types/index.ts',
                  content: 'export interface User { id: string; name: string; }',
                  language: 'typescript'
                }
              ],
              structure: {
                directories: ['src/types'],
                entryPoint: 'src/app/page.tsx'
              }
            })
          }
        }]
      });

      const result = await agent.generate(architecture, []);

      const tsFiles = result.files.filter(f =>
        f.path.endsWith('.ts') || f.path.endsWith('.tsx')
      );
      expect(tsFiles.length).toBeGreaterThan(0);
    });

    it('should handle generation errors', async () => {
      const architecture = {
        stack: 'NEXTJS' as const,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('Generation failed')
      );

      await expect(agent.generate(architecture, [])).rejects.toThrow('Generation failed');
    });

    it('should validate generated code structure', () => {
      const codeOutput = {
        files: [
          {
            path: 'src/app/page.tsx',
            content: 'export default function Page() {}',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/app'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      expect(() => agent.validateOutput(codeOutput)).not.toThrow();
    });

    it('should reject empty file list', () => {
      const codeOutput = {
        files: [],
        structure: {
          directories: ['src'],
          entryPoint: 'src/index.tsx'
        }
      };

      expect(() => agent.validateOutput(codeOutput)).toThrow();
    });
  });
});
