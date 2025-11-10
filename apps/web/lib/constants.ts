// Token costs and limits
export const TOKEN_COSTS = {
  PER_TOKEN: 0.00002, // 2 centimes per 1000 tokens
  MINIMUM: 1000,
  MAXIMUM: 100000,
  DEFAULT: 50000,
} as const

// Project generation timeouts (in milliseconds)
export const TIMEOUTS = {
  ANALYZING: 30000, // 30 seconds
  DESIGNING: 120000, // 2 minutes
  CODING: 480000, // 8 minutes
  SECURITY: 60000, // 1 minute
  TESTING: 60000, // 1 minute
  DEPLOYING: 30000, // 30 seconds
  TOTAL: 720000, // 12 minutes
} as const

// Human decision deadline (in milliseconds)
export const DECISION_DEADLINE = 300000 // 5 minutes

// Agent status polling interval
export const AGENT_POLL_INTERVAL = 2000 // 2 seconds

// Project statuses
export const PROJECT_STATUS = {
  ANALYZING: 'analyzing',
  DESIGNING: 'designing',
  CODING: 'coding',
  TESTING: 'testing',
  DEPLOYING: 'deploying',
  DEPLOYED: 'deployed',
  FAILED: 'failed',
} as const

// Target platforms
export const TARGETS = {
  WEB: 'web',
  MOBILE: 'mobile',
  BOTH: 'both',
} as const

// Agent types
export const AGENTS = {
  DIRECTOR: 'DIRECTOR',
  ARCHITECT: 'ARCHITECT',
  DEVELOPER: 'DEVELOPER',
  SECURITY: 'SECURITY',
  QA: 'QA',
  DEVOPS: 'DEVOPS',
} as const

// Tech stacks
export const STACKS = [
  { value: 'NEXTJS', label: 'Next.js', icon: '⚛️' },
  { value: 'REACT_NATIVE', label: 'React Native', icon: '📱' },
  { value: 'EXPO', label: 'Expo', icon: '🚀' },
  { value: 'NUXT', label: 'Nuxt.js', icon: '💚' },
  { value: 'FLUTTER', label: 'Flutter', icon: '🎯' },
] as const

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS]
export type Target = typeof TARGETS[keyof typeof TARGETS]
export type Agent = typeof AGENTS[keyof typeof AGENTS]
