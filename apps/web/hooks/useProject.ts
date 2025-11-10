import { useEffect } from "react"
import { useProjectStore } from "@/stores/project-store"
import { useWebSocket } from "./useWebSocket"

export function useProject(projectId?: string) {
  const {
    activeProject,
    isLoading,
    error,
    fetchProject,
    updateProject,
    deleteProject,
  } = useProjectStore()

  // Connect WebSocket for real-time updates
  const { isConnected } = useWebSocket(projectId)

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
    }
  }, [projectId, fetchProject])

  return {
    project: activeProject,
    isLoading,
    error,
    isConnected,
    updateProject,
    deleteProject,
    refetch: () => projectId && fetchProject(projectId),
  }
}

export function useProjects() {
  const { projects, isLoading, error, fetchProjects, createProject } =
    useProjectStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    createProject,
    refetch: fetchProjects,
  }
}
