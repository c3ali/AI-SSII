import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brief, budget_tokens, target } = body

    // Validate
    if (!brief || brief.length < 50) {
      return NextResponse.json(
        { message: 'Brief must be at least 50 characters' },
        { status: 400 }
      )
    }

    // Generate mock project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Calculate token estimate
    const tokenEstimate = budget_tokens || 50000

    // Return mock response
    return NextResponse.json({
      project_id: projectId,
      token_estimate: tokenEstimate,
      status: 'analyzing',
    })
  } catch (error) {
    console.error('Error in /api/v1/projects/init:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
