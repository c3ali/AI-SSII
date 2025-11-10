import { NextRequest, NextResponse } from 'next/server'
import { generateProjectPlan, ProjectBrief } from '@/lib/agents/director'

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, brief, stack, budget, timeline } = body

    // Validate required fields
    if (!name || !brief || !stack) {
      return NextResponse.json(
        { error: 'Missing required fields: name, brief, stack' },
        { status: 400 }
      )
    }

    // Create project brief
    const projectBrief: ProjectBrief = {
      name,
      brief,
      stack,
      budget,
      timeline,
    }

    // Generate project plan using Director Agent
    const plan = await generateProjectPlan(projectBrief)

    // Return the generated plan
    return NextResponse.json({
      success: true,
      project: {
        id: `proj_${Date.now()}`,
        name,
        brief,
        stack,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        plan,
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate project plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
