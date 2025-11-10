import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { WorkflowOrchestrator } from '@/lib/workflow/orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

vi.mock('openai');

describe('Workflow Integration', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.$executeRaw`TRUNCATE TABLE "Project" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "AgentExecution" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should execute complete workflow with all 6 agents', async () => {
    const orchestrator = new WorkflowOrchestrator();

    const result = await orchestrator.execute({
      brief: 'Create a simple landing page with contact form',
      userId: 'test-user-123',
      options: {
        stack: 'NEXTJS',
        budget: 30
      }
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.projectId).toBeDefined();

    // Check all agents executed
    expect(result.outputs).toHaveProperty('director');
    expect(result.outputs).toHaveProperty('architect');
    expect(result.outputs).toHaveProperty('developer');
    expect(result.outputs).toHaveProperty('security');
    expect(result.outputs).toHaveProperty('qa');
    expect(result.outputs).toHaveProperty('devops');

    // Verify database state
    const project = await prisma.project.findUnique({
      where: { id: result.projectId },
      include: { agentExecutions: true }
    });

    expect(project).not.toBeNull();
    expect(project?.status).toBe('SUCCESS');
    expect(project?.agentExecutions).toHaveLength(6);

    // Verify each agent execution
    const agentNames = project?.agentExecutions.map(e => e.agentName);
    expect(agentNames).toContain('director');
    expect(agentNames).toContain('architect');
    expect(agentNames).toContain('developer');
    expect(agentNames).toContain('security');
    expect(agentNames).toContain('qa');
    expect(agentNames).toContain('devops');
  });

  it('should handle workflow cancellation', async () => {
    const orchestrator = new WorkflowOrchestrator();

    const workflowPromise = orchestrator.execute({
      brief: 'Test cancellation',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    // Cancel after 1 second
    setTimeout(() => {
      orchestrator.cancel();
    }, 1000);

    const result = await workflowPromise;

    expect(result.status).toBe('CANCELLED');

    const project = await prisma.project.findFirst({
      where: { userId: 'test-user' },
      orderBy: { createdAt: 'desc' }
    });

    expect(project?.status).toBe('CANCELLED');
  });

  it('should validate checkpoints and wait for approval', async () => {
    const orchestrator = new WorkflowOrchestrator({
      manualCheckpoints: true
    });

    const workflowPromise = orchestrator.execute({
      brief: 'Test with checkpoints',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    // Wait for first checkpoint (after architect)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Should be waiting at checkpoint
    expect(orchestrator.getStatus()).toBe('WAITING_CHECKPOINT');

    // Approve checkpoint
    orchestrator.approveCheckpoint({
      approved: true,
      feedback: 'Architecture looks good'
    });

    const result = await workflowPromise;

    expect(result.status).toBe('SUCCESS');
  });

  it('should handle agent failures gracefully', async () => {
    const orchestrator = new WorkflowOrchestrator();

    // Mock architect to fail
    vi.spyOn(orchestrator, 'runAgent').mockImplementation(async (agentName) => {
      if (agentName === 'architect') {
        throw new Error('Architecture generation failed');
      }
      return { success: true, output: {} };
    });

    const result = await orchestrator.execute({
      brief: 'Test failure',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    expect(result.status).toBe('FAILED');
    expect(result.error).toContain('Architecture generation failed');

    const project = await prisma.project.findFirst({
      where: { userId: 'test-user' },
      orderBy: { createdAt: 'desc' }
    });

    expect(project?.status).toBe('FAILED');
  });

  it('should retry failed agents up to 3 times', async () => {
    const orchestrator = new WorkflowOrchestrator({ maxRetries: 3 });

    let attempts = 0;
    vi.spyOn(orchestrator, 'runAgent').mockImplementation(async (agentName) => {
      if (agentName === 'developer') {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
      }
      return { success: true, output: {} };
    });

    const result = await orchestrator.execute({
      brief: 'Test retry',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    expect(result.status).toBe('SUCCESS');
    expect(attempts).toBe(3);
  });

  it('should pass data between agents correctly', async () => {
    const orchestrator = new WorkflowOrchestrator();

    const result = await orchestrator.execute({
      brief: 'Test data flow',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    // Architect should receive director output
    expect(result.outputs.architect.input).toEqual(result.outputs.director);

    // Developer should receive architect output
    expect(result.outputs.developer.input).toEqual(result.outputs.architect);

    // Security should receive developer output
    expect(result.outputs.security.input).toEqual(result.outputs.developer);
  });

  it('should save progress at each step', async () => {
    const orchestrator = new WorkflowOrchestrator();

    await orchestrator.execute({
      brief: 'Test progress saving',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    const executions = await prisma.agentExecution.findMany({
      where: { project: { userId: 'test-user' } },
      orderBy: { createdAt: 'asc' }
    });

    expect(executions.length).toBe(6);

    // Each execution should have timestamps
    executions.forEach(exec => {
      expect(exec.startedAt).toBeDefined();
      expect(exec.completedAt).toBeDefined();
      expect(exec.duration).toBeGreaterThan(0);
    });
  });

  it('should track execution metrics', async () => {
    const orchestrator = new WorkflowOrchestrator();

    const result = await orchestrator.execute({
      brief: 'Test metrics',
      userId: 'test-user',
      options: { stack: 'NEXTJS', budget: 30 }
    });

    expect(result.metrics).toBeDefined();
    expect(result.metrics.totalDuration).toBeGreaterThan(0);
    expect(result.metrics.agentDurations).toHaveProperty('director');
    expect(result.metrics.agentDurations).toHaveProperty('architect');
    expect(result.metrics.tokensUsed).toBeGreaterThan(0);
    expect(result.metrics.estimatedCost).toBeGreaterThan(0);
  });
});
