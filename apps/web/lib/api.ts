const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Project APIs
export interface InitProjectRequest {
  brief: string
  budget_tokens?: number
  target?: 'web' | 'mobile' | 'both'
  stack?: string
}

export interface InitProjectResponse {
  project_id: string
  token_estimate: number
  status: string
}

export interface ProjectStatusResponse {
  status: string
  tokens_spent: number
  human_decisions: HumanDecision[]
  progress?: number
  current_step?: string
  urls?: {
    github?: string
    preview?: string
    dashboard?: string
  }
}

export interface HumanDecision {
  id: string
  type: string
  proposal: any
  alternative?: any
  deadline: number
  status: 'pending' | 'approved' | 'rejected' | 'expired'
}

export const initProject = (data: InitProjectRequest) => {
  return apiCall<InitProjectResponse>('/projects/init', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const getProjectStatus = (projectId: string) => {
  return apiCall<ProjectStatusResponse>(`/projects/${projectId}/status`)
}

// Agent APIs
export interface AgentStatus {
  status: 'idle' | 'running' | 'error'
  current_task: string | null
  tokens_per_hour?: number
}

export interface AgentsStatusResponse {
  [agent: string]: AgentStatus
}

export interface AgentLog {
  timestamp: string
  message: string
  tokens_used: number
}

export const getAgentStatus = () => {
  return apiCall<AgentsStatusResponse>('/agents/status')
}

export const getAgentLogs = (agentId: string) => {
  return apiCall<{ logs: AgentLog[] }>(`/agents/${agentId}/logs`)
}

// Human Decision APIs
export interface RespondToDecisionRequest {
  approved: boolean
  modifications?: string
}

export const respondToDecision = (decisionId: string, data: RespondToDecisionRequest) => {
  return apiCall<{ success: boolean }>(`/human-decisions/${decisionId}/respond`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Monitoring APIs
export interface ProjectMetrics {
  lighthouse_score: number
  bundle_size_kb: number
  test_coverage: number
  security_score: number
}

export const getProjectMetrics = (projectId: string) => {
  return apiCall<ProjectMetrics>(`/monitoring/metrics/${projectId}`)
}

export interface SLAMetrics {
  uptime_30d: number
  avg_deployment_time: number
}

export const getSLAMetrics = () => {
  return apiCall<SLAMetrics>('/monitoring/sla')
}

// Billing APIs
export interface CreateInvoiceResponse {
  invoice_url: string
  amount: number
}

export const createInvoice = (projectId: string) => {
  return apiCall<CreateInvoiceResponse>('/billing/create-invoice', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId }),
  })
}
