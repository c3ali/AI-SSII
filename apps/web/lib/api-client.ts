import {
  ApiResponse,
  PaginatedResponse,
  ProjectsAPI,
  ListProjectsParams,
  CheckpointsAPI,
  AuthAPI,
  RegisterDTO,
} from "@/types/api"
import { Project, CreateProjectDTO, UpdateProjectDTO, Checkpoint } from "@/types/project"

class APIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: "UNKNOWN_ERROR",
            message: "An unknown error occurred",
          },
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: (error as Error).message,
        },
      }
    }
  }

  // Projects API
  projects: ProjectsAPI = {
    list: async (params?: ListProjectsParams) => {
      const queryParams = new URLSearchParams()

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value))
          }
        })
      }

      const query = queryParams.toString()
      const endpoint = `/api/projects${query ? `?${query}` : ""}`

      return this.request<PaginatedResponse<Project>>(endpoint)
    },

    get: async (id: string) => {
      return this.request<Project>(`/api/projects/${id}`)
    },

    create: async (data: CreateProjectDTO) => {
      return this.request<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    update: async (id: string, data: UpdateProjectDTO) => {
      return this.request<Project>(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
    },

    delete: async (id: string) => {
      return this.request<void>(`/api/projects/${id}`, {
        method: "DELETE",
      })
    },
  }

  // Checkpoints API
  checkpoints: CheckpointsAPI = {
    list: async (projectId: string) => {
      return this.request<Checkpoint[]>(`/api/projects/${projectId}/checkpoints`)
    },

    approve: async (checkpointId: string) => {
      return this.request<Checkpoint>(`/api/checkpoints/${checkpointId}/approve`, {
        method: "POST",
      })
    },

    reject: async (checkpointId: string, reason: string) => {
      return this.request<Checkpoint>(`/api/checkpoints/${checkpointId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      })
    },
  }

  // Auth API
  auth: AuthAPI = {
    login: async (email: string, password: string) => {
      return this.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
    },

    register: async (data: RegisterDTO) => {
      return this.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    logout: async () => {
      return this.request("/api/auth/logout", {
        method: "POST",
      })
    },

    me: async () => {
      return this.request("/api/auth/me")
    },
  }
}

// Singleton instance
export const apiClient = new APIClient()
