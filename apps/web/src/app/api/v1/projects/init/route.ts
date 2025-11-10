import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/services/project.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brief, budget_tokens, target, stack } = body

    // Créer le projet via le service
    const result = await projectService.createProject({
      brief,
      budgetTokens: budget_tokens,
      target,
      stack,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in /api/v1/projects/init:', error)

    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('50 caractères') ? 400 : 500

    return NextResponse.json({ message }, { status })
  }
}
