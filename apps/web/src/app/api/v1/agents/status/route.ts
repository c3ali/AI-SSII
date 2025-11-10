import { NextResponse } from 'next/server'

export async function GET() {
  // Mock agent status
  const agentStatus = {
    director: {
      status: 'running' as const,
      current_task: 'Coordinating project generation',
      tokens_per_hour: 1200,
    },
    architect: {
      status: 'running' as const,
      current_task: 'Designing system architecture',
      tokens_per_hour: 2400,
    },
    developer: {
      status: 'running' as const,
      current_task: 'Generating code components',
      tokens_per_hour: 4800,
    },
    security: {
      status: 'idle' as const,
      current_task: null,
      tokens_per_hour: 800,
    },
    qa: {
      status: 'idle' as const,
      current_task: null,
      tokens_per_hour: 600,
    },
    devops: {
      status: 'idle' as const,
      current_task: null,
      tokens_per_hour: 400,
    },
  }

  return NextResponse.json(agentStatus)
}
