import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/services/project.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    // Récupérer le statut via le service
    const status = await projectService.getProjectStatus(projectId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error in /api/v1/projects/[projectId]/status:', error)

    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('introuvable') ? 404 : 500

    return NextResponse.json({ message }, { status })
  }
}
