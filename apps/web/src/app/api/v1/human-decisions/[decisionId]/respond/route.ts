import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { decisionId: string } }
) {
  try {
    const body = await request.json()
    const { approved, modifications } = body
    const { decisionId } = params

    console.log(`Decision ${decisionId} response:`, { approved, modifications })

    // In production, this would update the database
    // and notify the backend to continue processing

    return NextResponse.json({
      success: true,
      decision_id: decisionId,
      approved,
      modifications,
    })
  } catch (error) {
    console.error('Error in /api/v1/human-decisions/[decisionId]/respond:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
