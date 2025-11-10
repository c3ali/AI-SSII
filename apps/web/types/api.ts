import { Project, CreateProjectDTO, UpdateProjectDTO, Checkpoint } from "./project"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: any
  timestamp: string
}

export enum WebSocketMessageType {
  AGENT_STARTED = "agent_started",
  AGENT_PROGRESS = "agent_progress",
  AGENT_COMPLETED = "agent_completed",
  AGENT_FAILED = "agent_failed",
  AGENT_LOG = "agent_log",
  PROJECT_UPDATED = "project_updated",
  CHECKPOINT_CREATED = "checkpoint_created",
  ERROR = "error"
}

export interface ProjectsAPI {
  list: (params?: ListProjectsParams) => Promise<ApiResponse<PaginatedResponse<Project>>>
  get: (id: string) => Promise<ApiResponse<Project>>
  create: (data: CreateProjectDTO) => Promise<ApiResponse<Project>>
  update: (id: string, data: UpdateProjectDTO) => Promise<ApiResponse<Project>>
  delete: (id: string) => Promise<ApiResponse<void>>
}

export interface ListProjectsParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CheckpointsAPI {
  list: (projectId: string) => Promise<ApiResponse<Checkpoint[]>>
  approve: (checkpointId: string) => Promise<ApiResponse<Checkpoint>>
  reject: (checkpointId: string, reason: string) => Promise<ApiResponse<Checkpoint>>
}

export interface AuthAPI {
  login: (email: string, password: string) => Promise<ApiResponse<{ token: string; user: User }>>
  register: (data: RegisterDTO) => Promise<ApiResponse<{ token: string; user: User }>>
  logout: () => Promise<ApiResponse<void>>
  me: () => Promise<ApiResponse<User>>
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  avatar?: string
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export interface RegisterDTO {
  email: string
  password: string
  name: string
}
