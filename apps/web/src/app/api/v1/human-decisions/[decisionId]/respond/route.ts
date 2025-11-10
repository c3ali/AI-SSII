import { NextRequest, NextResponse } from 'next/server'
import { decisionService } from '@/services/decision.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { decisionId: string } }
) {
  try {
    const body = await request.json()
    const { approved, chosenOption, modifications } = body
    const { decisionId } = params

    // Enregistrer la réponse via le service
    await decisionService.respondToDecision(decisionId, {
      approved,
      chosenOption,
      modifications,
    })

    return NextResponse.json({
      success: true,
      decision_id: decisionId,
      approved,
      modifications,
    })
  } catch (error) {
    console.error('Error in /api/v1/human-decisions/[decisionId]/respond:', error)

    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('introuvable') || message.includes('traitée') || message.includes('dépassé') ? 400 : 500

    return NextResponse.json({ message }, { status })
  }
}
