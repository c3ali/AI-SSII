import { useMemo } from "react"
import { AgentType, AgentExecution } from "@/types/project"
import { AGENTS } from "@/types/agent"
import { useProjectStore } from "@/stores/project-store"

export function useAgent(projectId: string, agentType: AgentType) {
  const activeProject = useProjectStore((state) => state.activeProject)

  const agentInfo = AGENTS[agentType]
  const agentExecution = useMemo(() => {
    if (!activeProject || activeProject.id !== projectId) {
      return null
    }
    return activeProject.agents[agentType]
  }, [activeProject, projectId, agentType])

  return {
    agent: agentInfo,
    execution: agentExecution,
    isRunning: agentExecution?.status === "running",
    isCompleted: agentExecution?.status === "completed",
    isFailed: agentExecution?.status === "failed",
    progress: agentExecution?.progress || 0,
    logs: agentExecution?.logs || [],
    output: agentExecution?.output,
    error: agentExecution?.error,
  }
}

export function useAgents(projectId: string) {
  const activeProject = useProjectStore((state) => state.activeProject)

  const agents = useMemo(() => {
    if (!activeProject || activeProject.id !== projectId) {
      return []
    }

    return Object.values(AgentType).map((type) => ({
      info: AGENTS[type],
      execution: activeProject.agents[type],
    }))
  }, [activeProject, projectId])

  const stats = useMemo(() => {
    const total = agents.length
    const completed = agents.filter((a) => a.execution.status === "completed").length
    const running = agents.filter((a) => a.execution.status === "running").length
    const failed = agents.filter((a) => a.execution.status === "failed").length
    const progress = Math.round((completed / total) * 100)

    return { total, completed, running, failed, progress }
  }, [agents])

  return {
    agents,
    stats,
  }
}
