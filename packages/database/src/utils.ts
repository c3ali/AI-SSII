import { prisma } from './client';
import { Prisma, ProjectStatus, ExecutionStatus, Agent } from '@prisma/client';

/**
 * Database utilities and helper functions
 */

// ============================================
// PAGINATION
// ============================================
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T>(
  model: any,
  params: PaginationParams = {},
  where: any = {},
  orderBy: any = { createdAt: 'desc' }
): Promise<PaginatedResult<T>> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ============================================
// PROJECT HELPERS
// ============================================

export async function getProjectWithMetrics(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      metrics: true,
      executions: {
        orderBy: { startedAt: 'desc' },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      files: true,
    },
  });
}

export async function getProjectExecutions(projectId: string, agent?: Agent) {
  return prisma.execution.findMany({
    where: {
      projectId,
      ...(agent && { agent }),
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      ...(status === 'RUNNING' && { startedAt: new Date() }),
      ...(status === 'SUCCESS' && { completedAt: new Date() }),
      ...(status === 'FAILED' && { completedAt: new Date() }),
    },
  });
}

// ============================================
// EXECUTION HELPERS
// ============================================

export async function createExecution(data: {
  projectId: string;
  userId?: string;
  agent: Agent;
  input: any;
}) {
  return prisma.execution.create({
    data: {
      projectId: data.projectId,
      userId: data.userId,
      agent: data.agent,
      input: data.input,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });
}

export async function completeExecution(
  executionId: string,
  data: {
    status: ExecutionStatus;
    output?: any;
    error?: string;
    duration?: number;
    tokensUsed?: number;
    cost?: number;
  }
) {
  return prisma.execution.update({
    where: { id: executionId },
    data: {
      ...data,
      completedAt: new Date(),
      progress: 100,
    },
  });
}

export async function updateExecutionProgress(
  executionId: string,
  progress: number,
  logs?: any[]
) {
  return prisma.execution.update({
    where: { id: executionId },
    data: {
      progress,
      ...(logs && { logs }),
    },
  });
}

// ============================================
// METRICS HELPERS
// ============================================

export async function updateMetrics(
  projectId: string,
  metrics: Partial<Omit<Prisma.MetricsCreateInput, 'project'>>
) {
  return prisma.metrics.upsert({
    where: { projectId },
    create: {
      projectId,
      ...metrics,
    },
    update: metrics,
  });
}

// ============================================
// USER HELPERS
// ============================================

export async function getUserProjects(
  userId: string,
  status?: ProjectStatus
) {
  return prisma.project.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      metrics: true,
      _count: {
        select: {
          executions: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserStats(userId: string) {
  const [totalProjects, successfulProjects, runningProjects, totalExecutions] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'SUCCESS' } }),
      prisma.project.count({ where: { userId, status: 'RUNNING' } }),
      prisma.execution.count({ where: { userId } }),
    ]);

  return {
    totalProjects,
    successfulProjects,
    runningProjects,
    totalExecutions,
    successRate:
      totalProjects > 0
        ? ((successfulProjects / totalProjects) * 100).toFixed(2)
        : '0',
  };
}

// ============================================
// TEMPLATE HELPERS
// ============================================

export async function incrementTemplateUsage(templateId: string) {
  return prisma.template.update({
    where: { id: templateId },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  });
}

export async function getPopularTemplates(limit: number = 10) {
  return prisma.template.findMany({
    take: limit,
    orderBy: [{ usageCount: 'desc' }, { rating: 'desc' }],
  });
}

// ============================================
// SEARCH & FILTERS
// ============================================

export async function searchProjects(query: string, userId?: string) {
  return prisma.project.findMany({
    where: {
      ...(userId && { userId }),
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { brief: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      metrics: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  message: string;
  timestamp: Date;
}> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error}`,
      timestamp: new Date(),
    };
  }
}

// ============================================
// CLEANUP
// ============================================

export async function cleanupOldExecutions(daysOld: number = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);

  return prisma.execution.deleteMany({
    where: {
      createdAt: {
        lt: date,
      },
      status: {
        in: ['SUCCESS', 'FAILED'],
      },
    },
  });
}
