import { NextResponse } from 'next/server'
import { agentOrchestrator } from '@/services/agent-orchestrator'

export async function GET() {
  try {
    const agentStatus = await agentOrchestrator.getAgentsStatus()

    return NextResponse.json(agentStatus)
  } catch (error) {
    console.error('Error in /api/v1/agents/status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
