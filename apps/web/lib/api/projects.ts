import { apiClient } from './client'
import type { Project, PaginatedResponse } from '@/types'

export interface CreateProjectData {
  name: string
  brief: string
  stack?: string
  budget?: number
  timeline?: number
}

export const projectsApi = {
  async list(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get('/api/projects', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  async get(id: string): Promise<Project> {
    const response = await apiClient.get(`/api/projects/${id}`)
    return response.data
  },

  async create(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post('/api/projects', data)
    return response.data
  },

  async update(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    const response = await apiClient.put(`/api/projects/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/projects/${id}`)
  },
}
