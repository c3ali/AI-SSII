import { create } from "zustand"
import { Project, AgentType, AgentExecution, AgentStatus, CreateProjectDTO, UpdateProjectDTO } from "@/types/project"
import { WebSocketMessage } from "@/types/api"

interface ProjectState {
  // State
  projects: Project[]
  activeProject: Project | null
  isLoading: boolean
  error: string | null

  // Actions
  setProjects: (projects: Project[]) => void
  setActiveProject: (project: Project | null) => void
  createProject: (data: CreateProjectDTO) => Promise<void>
  updateProject: (id: string, data: UpdateProjectDTO) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>

  // WebSocket updates
  handleWebSocketMessage: (message: WebSocketMessage) => void
  updateAgentStatus: (projectId: string, agentType: AgentType, agent: Partial<AgentExecution>) => void

  // UI
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,

  // Actions
  setProjects: (projects) => set({ projects }),

  setActiveProject: (project) => set({ activeProject: project }),

  createProject: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const result = await response.json()
      const newProject = result.data

      set((state) => ({
        projects: [newProject, ...state.projects],
        activeProject: newProject,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      const result = await response.json()
      const updatedProject = result.data

      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        activeProject: state.activeProject?.id === id ? updatedProject : state.activeProject,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }

      const result = await response.json()
      set({ projects: result.data.items, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/projects/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch project")
      }

      const result = await response.json()
      set({ activeProject: result.data, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  handleWebSocketMessage: (message) => {
    const { type, payload } = message

    switch (type) {
      case "agent_progress":
      case "agent_started":
      case "agent_completed":
      case "agent_failed":
        if (payload.projectId && payload.agentType) {
          get().updateAgentStatus(payload.projectId, payload.agentType, payload.agent)
        }
        break

      case "project_updated":
        if (payload.project) {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === payload.project.id ? payload.project : p
            ),
            activeProject: state.activeProject?.id === payload.project.id
              ? payload.project
              : state.activeProject,
          }))
        }
        break
    }
  },

  updateAgentStatus: (projectId, agentType, agentUpdate) => {
    set((state) => {
      const updateProjectAgents = (project: Project) => {
        if (project.id !== projectId) return project

        return {
          ...project,
          agents: {
            ...project.agents,
            [agentType]: {
              ...project.agents[agentType],
              ...agentUpdate,
            },
          },
        }
      }

      return {
        projects: state.projects.map(updateProjectAgents),
        activeProject: state.activeProject
          ? updateProjectAgents(state.activeProject)
          : null,
      }
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
