import { apiClient } from './client'
import type { User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', data)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', credentials)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/users/me')
    return response.data
  },
}
