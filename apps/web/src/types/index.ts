export type UserRole = 'USER' | 'ADMIN' | 'DEVELOPER'

export type ProjectStatus = 'DRAFT' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export type AgentType = 'DIRECTOR' | 'ARCHITECT' | 'DEVELOPER' | 'SECURITY' | 'QA' | 'DEVOPS'

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export type StackType = 'NEXTJS' | 'REACT_NATIVE' | 'EXPO' | 'NUXT' | 'FLUTTER'

export type TemplateCategory = 'ECOMMERCE' | 'SAAS' | 'LANDING' | 'DASHBOARD' | 'MOBILE' | 'API'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  brief: string
  status: ProjectStatus
  stack: StackType
  budget?: number
  timeline?: number
  userId: string
  templateId?: string
  createdAt: string
  updatedAt: string
  user?: User
  template?: Template
  executions?: Execution[]
  metrics?: Metrics
  comments?: Comment[]
  files?: File[]
}

export interface Execution {
  id: string
  agent: AgentType
  status: ExecutionStatus
  progress: number
  input: any
  output?: any
  logs?: any
  performance?: any
  projectId: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Metrics {
  id: string
  codeCoverage?: number
  lighthouseScore?: number
  bundleSize?: number
  loadTime?: number
  securityScore?: number
  maintainabilityIndex?: number
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  stack: StackType
  preview?: string
  config: any
  usageCount: number
  rating?: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  projectId: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: User
}

export interface File {
  id: string
  filename: string
  mimetype: string
  size: number
  url: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
