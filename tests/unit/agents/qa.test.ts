import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QAAgent } from '@/agents/qa';

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('QAAgent', () => {
  let agent: QAAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new QAAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('test', () => {
    it('should run comprehensive quality checks', async () => {
      const codebase = {
        files: [
          {
            path: 'src/app/page.tsx',
            content: 'export default function Home() { return <div>Home</div>; }',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/app'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testResults: {
                unit: {
                  total: 45,
                  passed: 43,
                  failed: 2,
                  coverage: 92.5
                },
                integration: {
                  total: 12,
                  passed: 12,
                  failed: 0,
                  coverage: 88.0
                },
                e2e: {
                  total: 8,
                  passed: 8,
                  failed: 0,
                  coverage: 85.0
                }
              },
              lighthouseScores: {
                performance: 96,
                accessibility: 98,
                bestPractices: 95,
                seo: 100,
                pwa: 90
              },
              codeQuality: {
                eslintErrors: 0,
                eslintWarnings: 3,
                typeErrors: 0,
                duplicateCode: 2.5
              },
              recommendations: [
                'Fix remaining unit test failures',
                'Address ESLint warnings',
                'Reduce code duplication'
              ]
            })
          }
        }]
      });

      const result = await agent.test(codebase);

      expect(result.testResults.unit.coverage).toBeGreaterThanOrEqual(90);
      expect(result.lighthouseScores.performance).toBeGreaterThanOrEqual(95);
      expect(result.codeQuality.eslintErrors).toBe(0);
    });

    it('should validate test coverage > 90%', async () => {
      const codebase = {
        files: [
          {
            path: 'src/utils/format.ts',
            content: 'export function format(text: string) { return text.trim(); }',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/utils'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testResults: {
                unit: {
                  total: 10,
                  passed: 10,
                  failed: 0,
                  coverage: 95.0
                },
                integration: {
                  total: 5,
                  passed: 5,
                  failed: 0,
                  coverage: 92.0
                },
                e2e: {
                  total: 3,
                  passed: 3,
                  failed: 0,
                  coverage: 90.0
                }
              },
              lighthouseScores: {
                performance: 98,
                accessibility: 100,
                bestPractices: 100,
                seo: 100,
                pwa: 95
              },
              codeQuality: {
                eslintErrors: 0,
                eslintWarnings: 0,
                typeErrors: 0,
                duplicateCode: 0
              },
              recommendations: []
            })
          }
        }]
      });

      const result = await agent.test(codebase);

      expect(result.testResults.unit.coverage).toBeGreaterThanOrEqual(90);
      expect(result.testResults.integration.coverage).toBeGreaterThanOrEqual(90);
      expect(result.testResults.e2e.coverage).toBeGreaterThanOrEqual(90);
    });

    it('should validate Lighthouse scores > 95', async () => {
      const codebase = {
        files: [],
        structure: { directories: [], entryPoint: 'index.tsx' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testResults: {
                unit: { total: 10, passed: 10, failed: 0, coverage: 95 },
                integration: { total: 5, passed: 5, failed: 0, coverage: 93 },
                e2e: { total: 3, passed: 3, failed: 0, coverage: 91 }
              },
              lighthouseScores: {
                performance: 97,
                accessibility: 100,
                bestPractices: 96,
                seo: 100,
                pwa: 95
              },
              codeQuality: {
                eslintErrors: 0,
                eslintWarnings: 0,
                typeErrors: 0,
                duplicateCode: 1.0
              },
              recommendations: []
            })
          }
        }]
      });

      const result = await agent.test(codebase);

      expect(result.lighthouseScores.performance).toBeGreaterThanOrEqual(95);
      expect(result.lighthouseScores.accessibility).toBeGreaterThanOrEqual(95);
      expect(result.lighthouseScores.bestPractices).toBeGreaterThanOrEqual(95);
    });

    it('should detect code quality issues', async () => {
      const codebase = {
        files: [
          {
            path: 'src/bad-code.ts',
            content: 'var x = 1; console.log(x);',
            language: 'typescript'
          }
        ],
        structure: { directories: ['src'], entryPoint: 'index.tsx' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testResults: {
                unit: { total: 5, passed: 5, failed: 0, coverage: 90 },
                integration: { total: 2, passed: 2, failed: 0, coverage: 90 },
                e2e: { total: 1, passed: 1, failed: 0, coverage: 90 }
              },
              lighthouseScores: {
                performance: 96,
                accessibility: 98,
                bestPractices: 95,
                seo: 100,
                pwa: 90
              },
              codeQuality: {
                eslintErrors: 5,
                eslintWarnings: 12,
                typeErrors: 2,
                duplicateCode: 15.5
              },
              recommendations: [
                'Fix ESLint errors (use const instead of var)',
                'Address TypeScript type errors',
                'Reduce code duplication from 15.5% to < 5%'
              ]
            })
          }
        }]
      });

      const result = await agent.test(codebase);

      expect(result.codeQuality.eslintErrors).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate test recommendations', async () => {
      const codebase = {
        files: [
          {
            path: 'src/app/api/users/route.ts',
            content: 'export async function GET() {}',
            language: 'typescript'
          }
        ],
        structure: { directories: ['src/app/api'], entryPoint: 'index.tsx' }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testResults: {
                unit: { total: 3, passed: 3, failed: 0, coverage: 75 }, // Low coverage
                integration: { total: 1, passed: 1, failed: 0, coverage: 80 },
                e2e: { total: 1, passed: 1, failed: 0, coverage: 90 }
              },
              lighthouseScores: {
                performance: 96,
                accessibility: 98,
                bestPractices: 95,
                seo: 100,
                pwa: 90
              },
              codeQuality: {
                eslintErrors: 0,
                eslintWarnings: 2,
                typeErrors: 0,
                duplicateCode: 3.0
              },
              recommendations: [
                'Increase unit test coverage from 75% to > 90%',
                'Add integration tests for API routes',
                'Add error handling tests'
              ]
            })
          }
        }]
      });

      const result = await agent.test(codebase);

      expect(result.recommendations).toContain(
        expect.stringContaining('coverage')
      );
    });

    it('should validate output format', () => {
      const qaOutput = {
        testResults: {
          unit: { total: 10, passed: 10, failed: 0, coverage: 95 },
          integration: { total: 5, passed: 5, failed: 0, coverage: 92 },
          e2e: { total: 3, passed: 3, failed: 0, coverage: 90 }
        },
        lighthouseScores: {
          performance: 96,
          accessibility: 98,
          bestPractices: 95,
          seo: 100,
          pwa: 90
        },
        codeQuality: {
          eslintErrors: 0,
          eslintWarnings: 1,
          typeErrors: 0,
          duplicateCode: 2.0
        },
        recommendations: []
      };

      expect(() => agent.validateOutput(qaOutput)).not.toThrow();
    });

    it('should reject invalid coverage values', () => {
      const qaOutput = {
        testResults: {
          unit: { total: 10, passed: 10, failed: 0, coverage: 150 }, // Invalid
          integration: { total: 5, passed: 5, failed: 0, coverage: 92 },
          e2e: { total: 3, passed: 3, failed: 0, coverage: 90 }
        },
        lighthouseScores: {
          performance: 96,
          accessibility: 98,
          bestPractices: 95,
          seo: 100,
          pwa: 90
        },
        codeQuality: {
          eslintErrors: 0,
          eslintWarnings: 0,
          typeErrors: 0,
          duplicateCode: 0
        },
        recommendations: []
      };

      expect(() => agent.validateOutput(qaOutput)).toThrow();
    });
  });
});
