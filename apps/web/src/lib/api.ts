import axios from 'axios'
import type { Project, Execution, Template, User, Metrics, ApiResponse, PaginatedResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    })
    return data
  },
  register: async (email: string, password: string, name: string) => {
    const { data } = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', {
      email,
      password,
      name,
    })
    return data
  },
  me: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data
  },
}

// Project APIs
export const projectApi = {
  getAll: async (page = 1, pageSize = 10) => {
    const { data } = await api.get<PaginatedResponse<Project>>('/projects', {
      params: { page, pageSize },
    })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`)
    return data
  },
  create: async (project: Partial<Project>) => {
    const { data } = await api.post<ApiResponse<Project>>('/projects', project)
    return data
  },
  update: async (id: string, project: Partial<Project>) => {
    const { data } = await api.put<ApiResponse<Project>>(`/projects/${id}`, project)
    return data
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/projects/${id}`)
    return data
  },
  start: async (id: string) => {
    const { data } = await api.post<ApiResponse<Project>>(`/projects/${id}/start`)
    return data
  },
  cancel: async (id: string) => {
    const { data } = await api.post<ApiResponse<Project>>(`/projects/${id}/cancel`)
    return data
  },
}

// Execution APIs
export const executionApi = {
  getByProjectId: async (projectId: string) => {
    const { data } = await api.get<ApiResponse<Execution[]>>(`/projects/${projectId}/executions`)
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Execution>>(`/executions/${id}`)
    return data
  },
}

// Template APIs
export const templateApi = {
  getAll: async (category?: string) => {
    const { data } = await api.get<ApiResponse<Template[]>>('/templates', {
      params: { category },
    })
    return data
  },
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Template>>(`/templates/${id}`)
    return data
  },
  getPopular: async (limit = 6) => {
    const { data } = await api.get<ApiResponse<Template[]>>('/templates/popular', {
      params: { limit },
    })
    return data
  },
}

// Metrics APIs
export const metricsApi = {
  getByProjectId: async (projectId: string) => {
    const { data } = await api.get<ApiResponse<Metrics>>(`/projects/${projectId}/metrics`)
    return data
  },
}

export default api
