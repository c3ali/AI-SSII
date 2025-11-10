import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Integration', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "Project" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Project CRUD', () => {
    it('should create a new project', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Create a landing page',
          userId: user.id,
          status: 'PENDING'
        }
      });

      expect(project).toMatchObject({
        name: 'Test Project',
        brief: 'Create a landing page',
        status: 'PENDING'
      });

      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve project with relations', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Test brief',
          userId: user.id,
          status: 'RUNNING',
          agentExecutions: {
            create: [
              {
                agentName: 'director',
                status: 'SUCCESS',
                startedAt: new Date(),
                completedAt: new Date(),
                duration: 5000,
                output: { test: 'data' }
              }
            ]
          }
        },
        include: {
          agentExecutions: true,
          user: true
        }
      });

      expect(project.agentExecutions).toHaveLength(1);
      expect(project.agentExecutions[0].agentName).toBe('director');
      expect(project.user.email).toBe('test@example.com');
    });

    it('should update project status', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Test brief',
          userId: user.id,
          status: 'PENDING'
        }
      });

      const updated = await prisma.project.update({
        where: { id: project.id },
        data: { status: 'RUNNING', progress: 50 }
      });

      expect(updated.status).toBe('RUNNING');
      expect(updated.progress).toBe(50);
    });

    it('should delete project and cascade to agent executions', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Test brief',
          userId: user.id,
          status: 'SUCCESS',
          agentExecutions: {
            create: [
              {
                agentName: 'director',
                status: 'SUCCESS',
                startedAt: new Date(),
                completedAt: new Date(),
                duration: 5000,
                output: {}
              }
            ]
          }
        }
      });

      await prisma.project.delete({
        where: { id: project.id }
      });

      const deletedProject = await prisma.project.findUnique({
        where: { id: project.id }
      });

      const executions = await prisma.agentExecution.findMany({
        where: { projectId: project.id }
      });

      expect(deletedProject).toBeNull();
      expect(executions).toHaveLength(0);
    });
  });

  describe('Agent Execution Tracking', () => {
    it('should track agent execution with timing', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Test brief',
          userId: user.id,
          status: 'RUNNING'
        }
      });

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 10000); // 10 seconds later

      const execution = await prisma.agentExecution.create({
        data: {
          projectId: project.id,
          agentName: 'architect',
          status: 'SUCCESS',
          startedAt: startTime,
          completedAt: endTime,
          duration: 10000,
          output: {
            stack: 'NEXTJS',
            architecture: 'MVC'
          },
          tokensUsed: 1500,
          cost: 0.03
        }
      });

      expect(execution.duration).toBe(10000);
      expect(execution.tokensUsed).toBe(1500);
      expect(execution.cost).toBe(0.03);
    });

    it('should query agent executions by status', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User'
        }
      });

      const project = await prisma.project.create({
        data: {
          name: 'Test Project',
          brief: 'Test brief',
          userId: user.id,
          status: 'RUNNING',
          agentExecutions: {
            create: [
              {
                agentName: 'director',
                status: 'SUCCESS',
                startedAt: new Date(),
                completedAt: new Date(),
                duration: 5000,
                output: {}
              },
              {
                agentName: 'architect',
                status: 'RUNNING',
                startedAt: new Date(),
                duration: 0,
                output: {}
              },
              {
                agentName: 'developer',
                status: 'FAILED',
                startedAt: new Date(),
                completedAt: new Date(),
                duration: 3000,
                output: {},
                error: 'Generation failed'
              }
            ]
          }
        }
      });

      const successfulExecutions = await prisma.agentExecution.findMany({
        where: {
          projectId: project.id,
          status: 'SUCCESS'
        }
      });

      const failedExecutions = await prisma.agentExecution.findMany({
        where: {
          projectId: project.id,
          status: 'FAILED'
        }
      });

      expect(successfulExecutions).toHaveLength(1);
      expect(failedExecutions).toHaveLength(1);
      expect(failedExecutions[0].error).toBe('Generation failed');
    });
  });

  describe('User Projects', () => {
    it('should retrieve all projects for a user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          projects: {
            create: [
              {
                name: 'Project 1',
                brief: 'Brief 1',
                status: 'SUCCESS'
              },
              {
                name: 'Project 2',
                brief: 'Brief 2',
                status: 'RUNNING'
              },
              {
                name: 'Project 3',
                brief: 'Brief 3',
                status: 'FAILED'
              }
            ]
          }
        },
        include: {
          projects: true
        }
      });

      expect(user.projects).toHaveLength(3);
    });

    it('should count projects by status for a user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          projects: {
            create: [
              { name: 'P1', brief: 'B1', status: 'SUCCESS' },
              { name: 'P2', brief: 'B2', status: 'SUCCESS' },
              { name: 'P3', brief: 'B3', status: 'RUNNING' },
              { name: 'P4', brief: 'B4', status: 'FAILED' }
            ]
          }
        }
      });

      const successCount = await prisma.project.count({
        where: {
          userId: user.id,
          status: 'SUCCESS'
        }
      });

      const runningCount = await prisma.project.count({
        where: {
          userId: user.id,
          status: 'RUNNING'
        }
      });

      expect(successCount).toBe(2);
      expect(runningCount).toBe(1);
    });
  });
});
