import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DirectorAgent } from '@/agents/director';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('DirectorAgent', () => {
  let agent: DirectorAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new DirectorAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('analyze', () => {
    it('should generate project plan from brief', async () => {
      const brief = 'Create an e-commerce platform with Stripe payments';

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'E-commerce Platform',
              objectives: [
                'Enable online product sales',
                'Integrate Stripe payments',
                'Manage inventory'
              ],
              userStories: [
                {
                  title: 'User can browse products',
                  description: 'As a customer, I want to browse available products',
                  acceptanceCriteria: [
                    'Products are displayed in a grid',
                    'Each product shows image, name, and price',
                    'Users can filter by category'
                  ],
                  estimationHours: 4,
                  priority: 'Must'
                },
                {
                  title: 'User can add to cart',
                  description: 'As a customer, I want to add products to cart',
                  acceptanceCriteria: [
                    'Cart icon shows item count',
                    'Cart persists across sessions'
                  ],
                  estimationHours: 3,
                  priority: 'Must'
                }
              ],
              timeline: 2,
              budget: 45
            })
          }
        }]
      });

      const result = await agent.analyze(brief);

      expect(result).toMatchObject({
        title: 'E-commerce Platform',
        objectives: expect.arrayContaining(['Enable online product sales']),
        userStories: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining('browse'),
            priority: 'Must'
          })
        ]),
        timeline: 2,
        budget: 45
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4-turbo-preview',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining(brief)
            })
          ])
        })
      );
    });

    it('should validate budget constraints', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              objectives: ['Test'],
              userStories: [],
              timeline: 1,
              budget: 60
            })
          }
        }]
      });

      const result = await agent.analyze('Test brief');

      // Should cap budget at 50
      expect(result.budget).toBeLessThanOrEqual(50);
    });

    it('should decompose tasks under 4 hours', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Complex Platform',
              objectives: ['Build platform'],
              userStories: [
                {
                  title: 'Complex feature',
                  description: 'Build complex feature',
                  acceptanceCriteria: ['Criteria'],
                  estimationHours: 8,
                  priority: 'Must'
                }
              ],
              timeline: 3,
              budget: 45
            })
          }
        }]
      });

      const result = await agent.analyze('Complex platform');

      result.userStories.forEach(story => {
        expect(story.estimationHours).toBeLessThanOrEqual(4);
      });
    });

    it('should prioritize user stories correctly', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Multi-feature App',
              objectives: ['Feature 1', 'Feature 2'],
              userStories: [
                {
                  title: 'Critical feature',
                  description: 'Must have',
                  acceptanceCriteria: ['Works'],
                  estimationHours: 4,
                  priority: 'Must'
                },
                {
                  title: 'Nice to have',
                  description: 'Optional',
                  acceptanceCriteria: ['Works'],
                  estimationHours: 2,
                  priority: 'Could'
                }
              ],
              timeline: 2,
              budget: 40
            })
          }
        }]
      });

      const result = await agent.analyze('Multi-feature app');

      const priorities = result.userStories.map(s => s.priority);
      expect(priorities).toContain('Must');
    });

    it('should handle empty brief', async () => {
      await expect(agent.analyze('')).rejects.toThrow(/brief.*required/i);
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API Error')
      );

      await expect(agent.analyze('Test brief')).rejects.toThrow('API Error');
    });
  });

  describe('validateOutput', () => {
    it('should validate correct output format', () => {
      const output = {
        title: 'Test Project',
        objectives: ['Objective 1'],
        userStories: [
          {
            title: 'Story 1',
            description: 'Description',
            acceptanceCriteria: ['Criteria'],
            estimationHours: 3,
            priority: 'Must'
          }
        ],
        timeline: 2,
        budget: 40
      };

      expect(() => agent.validateOutput(output)).not.toThrow();
    });

    it('should reject invalid user story priority', () => {
      const output = {
        title: 'Test',
        objectives: ['Obj'],
        userStories: [
          {
            title: 'Story',
            description: 'Desc',
            acceptanceCriteria: ['Criteria'],
            estimationHours: 3,
            priority: 'Invalid' as any
          }
        ],
        timeline: 1,
        budget: 30
      };

      expect(() => agent.validateOutput(output)).toThrow();
    });

    it('should reject missing required fields', () => {
      const output = {
        title: 'Test',
        objectives: ['Obj'],
        // Missing userStories
        timeline: 1,
        budget: 30
      };

      expect(() => agent.validateOutput(output as any)).toThrow();
    });
  });
});
