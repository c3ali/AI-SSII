"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AGENTS } from "@/types/agent"
import { AgentType, AgentStatus } from "@/types/project"

// Mock data - would come from WebSocket in real app
const mockAgentsStatus = [
  { type: AgentType.ARCHITECT, status: AgentStatus.COMPLETED, progress: 100 },
  { type: AgentType.BACKEND, status: AgentStatus.RUNNING, progress: 65 },
  { type: AgentType.FRONTEND, status: AgentStatus.RUNNING, progress: 45 },
  { type: AgentType.DATABASE, status: AgentStatus.QUEUED, progress: 0 },
  { type: AgentType.TESTING, status: AgentStatus.IDLE, progress: 0 },
  { type: AgentType.DEPLOYMENT, status: AgentStatus.IDLE, progress: 0 },
]

const statusColors: Record<AgentStatus, string> = {
  [AgentStatus.IDLE]: "secondary",
  [AgentStatus.QUEUED]: "outline",
  [AgentStatus.RUNNING]: "default",
  [AgentStatus.WAITING_APPROVAL]: "warning",
  [AgentStatus.COMPLETED]: "success",
  [AgentStatus.FAILED]: "destructive",
  [AgentStatus.SKIPPED]: "secondary",
}

export function AgentStatusGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAgentsStatus.map((agentStatus) => {
            const agent = AGENTS[agentStatus.type]
            return (
              <div
                key={agentStatus.type}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-2xl">{agent.icon}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {agent.name}
                      </p>
                      <Badge variant={statusColors[agentStatus.status] as any}>
                        {agentStatus.status}
                      </Badge>
                    </div>
                    {agentStatus.status === AgentStatus.RUNNING && (
                      <div className="flex items-center space-x-2">
                        <Progress value={agentStatus.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {agentStatus.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
