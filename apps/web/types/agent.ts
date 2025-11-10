import { AgentType, AgentStatus, AgentLog } from "./project"

export interface Agent {
  type: AgentType
  name: string
  description: string
  icon: string
  color: string
  capabilities: string[]
  dependencies: AgentType[]
}

export interface AgentNode {
  id: string
  type: AgentType
  position: { x: number; y: number }
  data: AgentNodeData
}

export interface AgentNodeData {
  label: string
  status: AgentStatus
  progress: number
  icon: string
  color: string
  logs: AgentLog[]
  output?: any
}

export interface AgentEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  label?: string
}

export interface AgentConfig {
  enabled: boolean
  priority: number
  timeout?: number
  retryCount?: number
  customParams?: Record<string, any>
}

export interface WorkflowState {
  currentAgent?: AgentType
  completedAgents: AgentType[]
  failedAgents: AgentType[]
  totalProgress: number
}

export const AGENTS: Record<AgentType, Agent> = {
  [AgentType.ARCHITECT]: {
    type: AgentType.ARCHITECT,
    name: "Architect Agent",
    description: "Définit l'architecture globale du projet",
    icon: "🏗️",
    color: "#3b82f6",
    capabilities: [
      "Architecture design",
      "Technology stack selection",
      "System design patterns",
      "Scalability planning"
    ],
    dependencies: []
  },
  [AgentType.BACKEND]: {
    type: AgentType.BACKEND,
    name: "Backend Agent",
    description: "Génère le code backend avec API et logique métier",
    icon: "⚙️",
    color: "#10b981",
    capabilities: [
      "API development",
      "Business logic",
      "Data validation",
      "Authentication"
    ],
    dependencies: [AgentType.ARCHITECT]
  },
  [AgentType.FRONTEND]: {
    type: AgentType.FRONTEND,
    name: "Frontend Agent",
    description: "Crée l'interface utilisateur et l'expérience",
    icon: "🎨",
    color: "#f59e0b",
    capabilities: [
      "UI components",
      "User experience",
      "Responsive design",
      "State management"
    ],
    dependencies: [AgentType.ARCHITECT]
  },
  [AgentType.DATABASE]: {
    type: AgentType.DATABASE,
    name: "Database Agent",
    description: "Conçoit et crée les schémas de base de données",
    icon: "🗄️",
    color: "#8b5cf6",
    capabilities: [
      "Schema design",
      "Migrations",
      "Indexing",
      "Query optimization"
    ],
    dependencies: [AgentType.ARCHITECT]
  },
  [AgentType.TESTING]: {
    type: AgentType.TESTING,
    name: "Testing Agent",
    description: "Génère les tests unitaires et d'intégration",
    icon: "🧪",
    color: "#ec4899",
    capabilities: [
      "Unit tests",
      "Integration tests",
      "E2E tests",
      "Test coverage"
    ],
    dependencies: [AgentType.BACKEND, AgentType.FRONTEND, AgentType.DATABASE]
  },
  [AgentType.DEPLOYMENT]: {
    type: AgentType.DEPLOYMENT,
    name: "Deployment Agent",
    description: "Configure le déploiement et l'infrastructure",
    icon: "🚀",
    color: "#06b6d4",
    capabilities: [
      "CI/CD setup",
      "Infrastructure as code",
      "Deployment automation",
      "Monitoring"
    ],
    dependencies: [AgentType.TESTING]
  }
}
