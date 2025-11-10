import { NextRequest, NextResponse } from 'next/server'

// Mock in-memory storage for project status
// In production, this would come from a database
const projectStatuses = new Map<string, any>()

// Simulate project progression
const STATUS_PROGRESSION = [
  'analyzing',
  'designing',
  'coding',
  'security',
  'testing',
  'deploying',
  'deployed',
]

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    // Get or create project status
    if (!projectStatuses.has(projectId)) {
      // Initialize with first status
      projectStatuses.set(projectId, {
        status: 'analyzing',
        tokens_spent: 0,
        human_decisions: [],
        progress: 0,
        current_step: 'analyzing',
        created_at: Date.now(),
      })
    }

    const projectStatus = projectStatuses.get(projectId)

    // Simulate progression (in real app, this would be updated by the backend)
    const elapsed = Date.now() - projectStatus.created_at
    const progressionSteps = Math.floor(elapsed / 10000) // Progress every 10 seconds

    if (progressionSteps < STATUS_PROGRESSION.length) {
      const currentIndex = Math.min(progressionSteps, STATUS_PROGRESSION.length - 1)
      projectStatus.status = STATUS_PROGRESSION[currentIndex]
      projectStatus.current_step = STATUS_PROGRESSION[currentIndex]
      projectStatus.progress = (currentIndex / (STATUS_PROGRESSION.length - 1)) * 100
      projectStatus.tokens_spent = Math.min(progressionSteps * 8000, 50000)
    }

    // If deployed, add URLs
    if (projectStatus.status === 'deployed') {
      projectStatus.urls = {
        github: 'https://github.com/example/generated-project',
        preview: 'https://generated-project.vercel.app',
        dashboard: 'https://vercel.com/dashboard/project',
      }
    }

    return NextResponse.json(projectStatus)
  } catch (error) {
    console.error('Error in /api/v1/projects/[projectId]/status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
