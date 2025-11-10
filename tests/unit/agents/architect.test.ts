import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchitectAgent } from '@/agents/architect';

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('ArchitectAgent', () => {
  let agent: ArchitectAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new ArchitectAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('design', () => {
    it('should generate technical architecture from project plan', async () => {
      const projectPlan = {
        title: 'E-commerce Platform',
        objectives: ['Online sales'],
        userStories: [
          {
            title: 'Browse products',
            description: 'User can browse',
            acceptanceCriteria: ['Display products'],
            estimationHours: 4,
            priority: 'Must' as const
          }
        ],
        timeline: 2,
        budget: 45
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              stack: 'NEXTJS',
              frontend: {
                framework: 'Next.js 14',
                styling: 'Tailwind CSS',
                stateManagement: 'Zustand'
              },
              backend: {
                framework: 'Next.js API Routes',
                orm: 'Prisma',
                authentication: 'NextAuth.js'
              },
              database: {
                type: 'PostgreSQL',
                provider: 'Supabase',
                schema: {
                  tables: [
                    {
                      name: 'products',
                      columns: [
                        { name: 'id', type: 'uuid', primary: true },
                        { name: 'name', type: 'string' },
                        { name: 'price', type: 'decimal' }
                      ]
                    }
                  ]
                }
              },
              infrastructure: {
                hosting: 'Vercel',
                cdn: 'Vercel CDN',
                storage: 'Supabase Storage'
              },
              architecture: {
                pattern: 'Monorepo',
                layers: ['Presentation', 'Business Logic', 'Data Access']
              }
            })
          }
        }]
      });

      const result = await agent.design(projectPlan);

      expect(result).toMatchObject({
        stack: 'NEXTJS',
        frontend: expect.objectContaining({
          framework: expect.stringContaining('Next.js')
        }),
        backend: expect.objectContaining({
          orm: 'Prisma'
        }),
        database: expect.objectContaining({
          type: 'PostgreSQL',
          provider: 'Supabase'
        })
      });
    });

    it('should select appropriate stack based on requirements', async () => {
      const projectPlan = {
        title: 'Mobile App',
        objectives: ['Mobile-first'],
        userStories: [],
        timeline: 2,
        budget: 40
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              stack: 'REACT_NATIVE',
              frontend: { framework: 'React Native' },
              backend: { framework: 'Expo' },
              database: { type: 'PostgreSQL', provider: 'Supabase' },
              infrastructure: { hosting: 'Expo' },
              architecture: { pattern: 'Mobile-first' }
            })
          }
        }]
      });

      const result = await agent.design(projectPlan);

      expect(result.stack).toBe('REACT_NATIVE');
    });

    it('should generate database schema from user stories', async () => {
      const projectPlan = {
        title: 'Blog Platform',
        objectives: ['Publish articles'],
        userStories: [
          {
            title: 'Create posts',
            description: 'Users can create blog posts',
            acceptanceCriteria: ['Save posts'],
            estimationHours: 3,
            priority: 'Must' as const
          }
        ],
        timeline: 1,
        budget: 30
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              stack: 'NEXTJS',
              frontend: { framework: 'Next.js' },
              backend: { framework: 'FastAPI' },
              database: {
                type: 'PostgreSQL',
                provider: 'Supabase',
                schema: {
                  tables: [
                    {
                      name: 'posts',
                      columns: [
                        { name: 'id', type: 'uuid', primary: true },
                        { name: 'title', type: 'string' },
                        { name: 'content', type: 'text' },
                        { name: 'author_id', type: 'uuid' },
                        { name: 'created_at', type: 'timestamp' }
                      ],
                      indexes: ['author_id'],
                      relations: [
                        { table: 'users', type: 'many-to-one', column: 'author_id' }
                      ]
                    }
                  ]
                }
              },
              infrastructure: { hosting: 'Vercel' },
              architecture: { pattern: 'MVC' }
            })
          }
        }]
      });

      const result = await agent.design(projectPlan);

      expect(result.database.schema?.tables).toContainEqual(
        expect.objectContaining({
          name: 'posts',
          columns: expect.arrayContaining([
            expect.objectContaining({ name: 'title' })
          ])
        })
      );
    });

    it('should optimize for budget constraints', async () => {
      const projectPlan = {
        title: 'Budget App',
        objectives: ['Cost-effective'],
        userStories: [],
        timeline: 1,
        budget: 20 // Low budget
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              stack: 'NEXTJS',
              frontend: { framework: 'Next.js' },
              backend: { framework: 'Next.js API Routes' },
              database: {
                type: 'PostgreSQL',
                provider: 'Supabase' // Free tier
              },
              infrastructure: {
                hosting: 'Vercel', // Free tier
                cdn: 'Vercel CDN'
              },
              architecture: { pattern: 'Serverless' }
            })
          }
        }]
      });

      const result = await agent.design(projectPlan);

      // Should use free/cheap services
      expect(result.infrastructure.hosting).toBe('Vercel');
      expect(result.database.provider).toBe('Supabase');
    });

    it('should validate architecture output', () => {
      const architecture = {
        stack: 'NEXTJS',
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      expect(() => agent.validateOutput(architecture)).not.toThrow();
    });

    it('should reject invalid stack type', () => {
      const architecture = {
        stack: 'INVALID_STACK' as any,
        frontend: { framework: 'Next.js' },
        backend: { framework: 'FastAPI' },
        database: { type: 'PostgreSQL', provider: 'Supabase' },
        infrastructure: { hosting: 'Vercel' },
        architecture: { pattern: 'MVC' }
      };

      expect(() => agent.validateOutput(architecture)).toThrow();
    });
  });
});
