import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const projects = await prisma.project.findMany({
      where: status ? { status: status as any } : undefined,
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
        _count: {
          select: {
            executions: true,
            comments: true,
            files: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, brief, stack, budget, timeline, userId } = body

    // For demo purposes, create a default user if userId not provided
    let user
    if (!userId) {
      user = await prisma.user.upsert({
        where: { email: 'demo@ssii.com' },
        update: {},
        create: {
          email: 'demo@ssii.com',
          password: 'demo',
          name: 'Demo User',
          role: 'USER',
        },
      })
    }

    const project = await prisma.project.create({
      data: {
        name,
        brief,
        stack: stack || 'NEXTJS',
        budget: budget || 50,
        timeline: timeline || 7,
        userId: userId || user!.id,
        status: 'DRAFT',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
