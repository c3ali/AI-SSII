import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalUsers,
      totalExecutions,
      recentProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'RUNNING' } }),
      prisma.project.count({ where: { status: 'SUCCESS' } }),
      prisma.user.count(),
      prisma.execution.count(),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ])

    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalUsers,
      totalExecutions,
      successRate:
        totalProjects > 0
          ? ((completedProjects / totalProjects) * 100).toFixed(1)
          : '0',
      recentProjects,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
