#!/usr/bin/env tsx
/**
 * Database Health Check Script
 * Checks database connection, performance, and integrity
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  metrics?: Record<string, any>;
  duration?: number;
}

async function checkPostgresConnection(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1 as result`;
    const duration = Date.now() - start;

    return {
      name: 'PostgreSQL Connection',
      status: 'healthy',
      message: 'Database connection is working',
      duration,
    };
  } catch (error) {
    return {
      name: 'PostgreSQL Connection',
      status: 'unhealthy',
      message: `Connection failed: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkDatabaseSize(): Promise<HealthCheckResult> {
  try {
    const result = await prisma.$queryRaw<Array<{ size: string }>>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;

    return {
      name: 'Database Size',
      status: 'healthy',
      message: 'Database size retrieved',
      metrics: {
        size: result[0]?.size || 'Unknown',
      },
    };
  } catch (error) {
    return {
      name: 'Database Size',
      status: 'degraded',
      message: `Could not retrieve size: ${error}`,
    };
  }
}

async function checkTableCounts(): Promise<HealthCheckResult> {
  try {
    const [users, projects, executions, templates, comments, files] =
      await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.execution.count(),
        prisma.template.count(),
        prisma.comment.count(),
        prisma.file.count(),
      ]);

    return {
      name: 'Table Counts',
      status: 'healthy',
      message: 'All tables accessible',
      metrics: {
        users,
        projects,
        executions,
        templates,
        comments,
        files,
        total: users + projects + executions + templates + comments + files,
      },
    };
  } catch (error) {
    return {
      name: 'Table Counts',
      status: 'unhealthy',
      message: `Could not count tables: ${error}`,
    };
  }
}

async function checkQueryPerformance(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Run a moderately complex query
    await prisma.project.findMany({
      take: 10,
      include: {
        user: true,
        metrics: true,
        executions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const duration = Date.now() - start;
    const status = duration < 100 ? 'healthy' : duration < 500 ? 'degraded' : 'unhealthy';

    return {
      name: 'Query Performance',
      status,
      message: `Complex query completed in ${duration}ms`,
      duration,
      metrics: {
        threshold: {
          healthy: '< 100ms',
          degraded: '100-500ms',
          unhealthy: '> 500ms',
        },
      },
    };
  } catch (error) {
    return {
      name: 'Query Performance',
      status: 'unhealthy',
      message: `Query failed: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkRedisConnection(): Promise<HealthCheckResult> {
  const start = Date.now();
  let client;

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    client = createClient({ url: redisUrl });

    await client.connect();
    await client.ping();
    await client.disconnect();

    const duration = Date.now() - start;

    return {
      name: 'Redis Connection',
      status: 'healthy',
      message: 'Redis connection is working',
      duration,
    };
  } catch (error) {
    if (client?.isOpen) {
      await client.disconnect();
    }

    return {
      name: 'Redis Connection',
      status: 'unhealthy',
      message: `Redis connection failed: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkIndexes(): Promise<HealthCheckResult> {
  try {
    const indexes = await prisma.$queryRaw<
      Array<{ tablename: string; indexname: string }>
    >`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;

    const indexCount = indexes.length;

    return {
      name: 'Database Indexes',
      status: 'healthy',
      message: `Found ${indexCount} indexes`,
      metrics: {
        total: indexCount,
        byTable: indexes.reduce((acc, idx) => {
          acc[idx.tablename] = (acc[idx.tablename] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    return {
      name: 'Database Indexes',
      status: 'degraded',
      message: `Could not retrieve indexes: ${error}`,
    };
  }
}

async function runHealthChecks() {
  console.log('\n🏥 Database Health Check\n');
  console.log('Running diagnostics...\n');

  const checks = [
    checkPostgresConnection(),
    checkDatabaseSize(),
    checkTableCounts(),
    checkQueryPerformance(),
    checkRedisConnection(),
    checkIndexes(),
  ];

  const results = await Promise.all(checks);

  // Display results
  results.forEach((result) => {
    const icon =
      result.status === 'healthy'
        ? '✅'
        : result.status === 'degraded'
        ? '⚠️'
        : '❌';

    console.log(`${icon} ${result.name}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    console.log(`   ${result.message}`);

    if (result.duration !== undefined) {
      console.log(`   Duration: ${result.duration}ms`);
    }

    if (result.metrics) {
      console.log(`   Metrics:`, JSON.stringify(result.metrics, null, 2));
    }

    console.log();
  });

  // Overall status
  const hasUnhealthy = results.some((r) => r.status === 'unhealthy');
  const hasDegraded = results.some((r) => r.status === 'degraded');

  console.log('━'.repeat(50));
  if (hasUnhealthy) {
    console.log('❌ Overall Status: UNHEALTHY\n');
    process.exit(1);
  } else if (hasDegraded) {
    console.log('⚠️  Overall Status: DEGRADED\n');
    process.exit(0);
  } else {
    console.log('✅ Overall Status: HEALTHY\n');
    process.exit(0);
  }
}

runHealthChecks()
  .catch((error) => {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
