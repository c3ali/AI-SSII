// User types
export type Role = 'USER' | 'ADMIN' | 'DEVELOPER'

export interface User {
  id: string
  email: string
  name: string | null
  role: Role
  avatar: string | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

// Project types
export type ProjectStatus = 'DRAFT' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
export type Stack = 'NEXTJS' | 'REACT_NATIVE' | 'EXPO' | 'NUXT' | 'FLUTTER'

export interface Project {
  id: string
  name: string
  brief: string
  status: ProjectStatus
  userId: string
  config: Record<string, any>
  stack: Stack
  budget: number
  timeline: number
  plan: Record<string, any> | null
  architecture: Record<string, any> | null
  codebase: Record<string, any> | null
  security: Record<string, any> | null
  tests: Record<string, any> | null
  deployment: Record<string, any> | null
  githubUrl: string | null
  deployUrl: string | null
  docsUrl: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Execution types
export type Agent = 'DIRECTOR' | 'ARCHITECT' | 'DEVELOPER' | 'SECURITY' | 'QA' | 'DEVOPS'
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'

export interface Execution {
  id: string
  projectId: string
  userId: string | null
  agent: Agent
  status: ExecutionStatus
  progress: number
  input: Record<string, any>
  output: Record<string, any> | null
  error: string | null
  logs: any[]
  duration: number | null
  tokensUsed: number | null
  cost: number | null
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Metrics types
export interface Metrics {
  id: string
  projectId: string
  coverage: number | null
  complexity: number | null
  linesOfCode: number | null
  testsPassed: number | null
  testsTotal: number | null
  lighthouse: number | null
  bundleSize: number | null
  loadTime: number | null
  owaspScore: number | null
  vulnerabilities: number | null
  estimatedCost: number | null
  apiTokensUsed: number | null
  createdAt: Date
  updatedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  detail?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
