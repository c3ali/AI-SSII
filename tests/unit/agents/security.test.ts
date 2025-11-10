import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityAgent } from '@/agents/security';

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}));

describe('SecurityAgent', () => {
  let agent: SecurityAgent;
  let mockOpenAI: any;

  beforeEach(() => {
    agent = new SecurityAgent();
    mockOpenAI = (agent as any).openai;
    vi.clearAllMocks();
  });

  describe('audit', () => {
    it('should perform OWASP security audit', async () => {
      const codebase = {
        files: [
          {
            path: 'src/app/api/auth/route.ts',
            content: 'export async function POST(req) { const { password } = await req.json(); }',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/app/api'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              owaspScore: 9.2,
              vulnerabilities: [
                {
                  severity: 'medium',
                  category: 'A02:2021 - Cryptographic Failures',
                  description: 'Password should be hashed before storage',
                  location: 'src/app/api/auth/route.ts:1',
                  recommendation: 'Use bcrypt to hash passwords'
                }
              ],
              checklist: {
                'A01:2021': { name: 'Broken Access Control', passed: true },
                'A02:2021': { name: 'Cryptographic Failures', passed: false },
                'A03:2021': { name: 'Injection', passed: true },
                'A04:2021': { name: 'Insecure Design', passed: true },
                'A05:2021': { name: 'Security Misconfiguration', passed: true },
                'A06:2021': { name: 'Vulnerable Components', passed: true },
                'A07:2021': { name: 'Authentication Failures', passed: true },
                'A08:2021': { name: 'Software Integrity Failures', passed: true },
                'A09:2021': { name: 'Logging Failures', passed: true },
                'A10:2021': { name: 'SSRF', passed: true }
              },
              recommendations: [
                'Hash all passwords using bcrypt with salt',
                'Implement rate limiting on authentication endpoints'
              ]
            })
          }
        }]
      });

      const result = await agent.audit(codebase);

      expect(result.owaspScore).toBeGreaterThanOrEqual(9.0);
      expect(result.vulnerabilities).toHaveLength(1);
      expect(result.checklist['A02:2021'].passed).toBe(false);
      expect(result.recommendations).toContain(expect.stringContaining('bcrypt'));
    });

    it('should detect SQL injection vulnerabilities', async () => {
      const codebase = {
        files: [
          {
            path: 'src/lib/db.ts',
            content: 'db.query(`SELECT * FROM users WHERE id = ${userId}`)' ,
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/lib'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              owaspScore: 7.5,
              vulnerabilities: [
                {
                  severity: 'critical',
                  category: 'A03:2021 - Injection',
                  description: 'SQL injection vulnerability detected',
                  location: 'src/lib/db.ts:1',
                  recommendation: 'Use parameterized queries or ORM'
                }
              ],
              checklist: {
                'A01:2021': { name: 'Broken Access Control', passed: true },
                'A02:2021': { name: 'Cryptographic Failures', passed: true },
                'A03:2021': { name: 'Injection', passed: false },
                'A04:2021': { name: 'Insecure Design', passed: true },
                'A05:2021': { name: 'Security Misconfiguration', passed: true },
                'A06:2021': { name: 'Vulnerable Components', passed: true },
                'A07:2021': { name: 'Authentication Failures', passed: true },
                'A08:2021': { name: 'Software Integrity Failures', passed: true },
                'A09:2021': { name: 'Logging Failures', passed: true },
                'A10:2021': { name: 'SSRF', passed: true }
              },
              recommendations: ['Use Prisma ORM for type-safe queries']
            })
          }
        }]
      });

      const result = await agent.audit(codebase);

      expect(result.vulnerabilities).toContainEqual(
        expect.objectContaining({
          severity: 'critical',
          category: expect.stringContaining('Injection')
        })
      );
    });

    it('should detect XSS vulnerabilities', async () => {
      const codebase = {
        files: [
          {
            path: 'src/components/Comment.tsx',
            content: '<div dangerouslySetInnerHTML={{ __html: userInput }} />',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/components'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              owaspScore: 8.0,
              vulnerabilities: [
                {
                  severity: 'high',
                  category: 'A03:2021 - Injection',
                  description: 'Potential XSS vulnerability from dangerouslySetInnerHTML',
                  location: 'src/components/Comment.tsx:1',
                  recommendation: 'Sanitize user input with DOMPurify'
                }
              ],
              checklist: {
                'A01:2021': { name: 'Broken Access Control', passed: true },
                'A02:2021': { name: 'Cryptographic Failures', passed: true },
                'A03:2021': { name: 'Injection', passed: false },
                'A04:2021': { name: 'Insecure Design', passed: true },
                'A05:2021': { name: 'Security Misconfiguration', passed: true },
                'A06:2021': { name: 'Vulnerable Components', passed: true },
                'A07:2021': { name: 'Authentication Failures', passed: true },
                'A08:2021': { name: 'Software Integrity Failures', passed: true },
                'A09:2021': { name: 'Logging Failures', passed: true },
                'A10:2021': { name: 'SSRF', passed: true }
              },
              recommendations: ['Use DOMPurify to sanitize HTML']
            })
          }
        }]
      });

      const result = await agent.audit(codebase);

      expect(result.vulnerabilities.some(v => v.description.includes('XSS'))).toBe(true);
    });

    it('should validate environment variables security', async () => {
      const codebase = {
        files: [
          {
            path: 'src/config/env.ts',
            content: 'export const API_KEY = "hardcoded-key-123"',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/config'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              owaspScore: 8.5,
              vulnerabilities: [
                {
                  severity: 'medium',
                  category: 'A05:2021 - Security Misconfiguration',
                  description: 'Hardcoded API key detected',
                  location: 'src/config/env.ts:1',
                  recommendation: 'Use environment variables for sensitive data'
                }
              ],
              checklist: {
                'A01:2021': { name: 'Broken Access Control', passed: true },
                'A02:2021': { name: 'Cryptographic Failures', passed: true },
                'A03:2021': { name: 'Injection', passed: true },
                'A04:2021': { name: 'Insecure Design', passed: true },
                'A05:2021': { name: 'Security Misconfiguration', passed: false },
                'A06:2021': { name: 'Vulnerable Components', passed: true },
                'A07:2021': { name: 'Authentication Failures', passed: true },
                'A08:2021': { name: 'Software Integrity Failures', passed: true },
                'A09:2021': { name: 'Logging Failures', passed: true },
                'A10:2021': { name: 'SSRF', passed: true }
              },
              recommendations: ['Move all secrets to .env files']
            })
          }
        }]
      });

      const result = await agent.audit(codebase);

      expect(result.vulnerabilities.some(v =>
        v.description.includes('Hardcoded')
      )).toBe(true);
    });

    it('should pass audit with secure code', async () => {
      const codebase = {
        files: [
          {
            path: 'src/app/api/users/route.ts',
            content: 'export async function GET() { const users = await prisma.user.findMany(); }',
            language: 'typescript'
          }
        ],
        structure: {
          directories: ['src/app/api'],
          entryPoint: 'src/app/page.tsx'
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              owaspScore: 10.0,
              vulnerabilities: [],
              checklist: {
                'A01:2021': { name: 'Broken Access Control', passed: true },
                'A02:2021': { name: 'Cryptographic Failures', passed: true },
                'A03:2021': { name: 'Injection', passed: true },
                'A04:2021': { name: 'Insecure Design', passed: true },
                'A05:2021': { name: 'Security Misconfiguration', passed: true },
                'A06:2021': { name: 'Vulnerable Components', passed: true },
                'A07:2021': { name: 'Authentication Failures', passed: true },
                'A08:2021': { name: 'Software Integrity Failures', passed: true },
                'A09:2021': { name: 'Logging Failures', passed: true },
                'A10:2021': { name: 'SSRF', passed: true }
              },
              recommendations: []
            })
          }
        }]
      });

      const result = await agent.audit(codebase);

      expect(result.owaspScore).toBe(10.0);
      expect(result.vulnerabilities).toHaveLength(0);
    });
  });
});
