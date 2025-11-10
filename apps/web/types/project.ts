export enum ProjectStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

export enum AgentType {
  ARCHITECT = "architect",
  BACKEND = "backend",
  FRONTEND = "frontend",
  DATABASE = "database",
  TESTING = "testing",
  DEPLOYMENT = "deployment"
}

export interface Project {
  id: string
  name: string
  description: string
  brief: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
  userId: string

  // Configuration
  config: ProjectConfig

  // Metrics
  metrics: ProjectMetrics

  // Agents status
  agents: Record<AgentType, AgentExecution>
}

export interface ProjectConfig {
  stack: TechStack
  budget?: number
  timeline?: string
  requirements: ProjectRequirements
}

export interface TechStack {
  frontend?: string[]
  backend?: string[]
  database?: string[]
  infrastructure?: string[]
}

export interface ProjectRequirements {
  security: SecurityLevel
  performance: PerformanceLevel
  scalability: ScalabilityLevel
  testCoverage: number
  documentation: boolean
}

export enum SecurityLevel {
  BASIC = "basic",
  STANDARD = "standard",
  ADVANCED = "advanced",
  CRITICAL = "critical"
}

export enum PerformanceLevel {
  BASIC = "basic",
  OPTIMIZED = "optimized",
  HIGH_PERFORMANCE = "high_performance"
}

export enum ScalabilityLevel {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  ENTERPRISE = "enterprise"
}

export interface ProjectMetrics {
  totalDuration?: number
  linesOfCode?: number
  testCoverage?: number
  securityScore?: number
  performanceScore?: number
  filesGenerated?: number
  agentsExecuted?: number
}

export interface AgentExecution {
  agentType: AgentType
  status: AgentStatus
  progress: number
  startedAt?: string
  completedAt?: string
  duration?: number
  output?: AgentOutput
  error?: string
  logs: AgentLog[]
}

export enum AgentStatus {
  IDLE = "idle",
  QUEUED = "queued",
  RUNNING = "running",
  WAITING_APPROVAL = "waiting_approval",
  COMPLETED = "completed",
  FAILED = "failed",
  SKIPPED = "skipped"
}

export interface AgentOutput {
  files: GeneratedFile[]
  summary: string
  metrics?: Record<string, any>
  artifacts?: Artifact[]
}

export interface GeneratedFile {
  path: string
  content?: string
  size: number
  language: string
}

export interface Artifact {
  type: string
  name: string
  url?: string
  metadata?: Record<string, any>
}

export interface AgentLog {
  timestamp: string
  level: LogLevel
  message: string
  metadata?: Record<string, any>
}

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error"
}

export interface Checkpoint {
  id: string
  projectId: string
  agentType: AgentType
  timestamp: string
  description: string
  status: CheckpointStatus
  requiredApproval: boolean
  approved?: boolean
  approvedBy?: string
  approvedAt?: string
  data: Record<string, any>
}

export enum CheckpointStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface CreateProjectDTO {
  name: string
  description: string
  brief: string
  config: ProjectConfig
}

export interface UpdateProjectDTO {
  name?: string
  description?: string
  status?: ProjectStatus
  config?: Partial<ProjectConfig>
}
