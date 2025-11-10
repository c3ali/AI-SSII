import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr = 'PPP') {
  return format(new Date(date), formatStr)
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getStatusColor(status: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  const statusColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    SUCCESS: 'success',
    RUNNING: 'info',
    PENDING: 'warning',
    FAILED: 'error',
    CANCELLED: 'error',
    DRAFT: 'warning',
    QUEUED: 'info',
  }
  return statusColors[status] || 'info'
}

export function getAgentIcon(agent: string) {
  const agentIcons: Record<string, string> = {
    DIRECTOR: '🎯',
    ARCHITECT: '🏗️',
    DEVELOPER: '💻',
    SECURITY: '🔒',
    QA: '🧪',
    DEVOPS: '🚀',
  }
  return agentIcons[agent] || '🤖'
}

export function getTemplateIcon(category: string) {
  const categoryIcons: Record<string, string> = {
    ECOMMERCE: '🛍️',
    SAAS: '💼',
    LANDING: '📄',
    DASHBOARD: '📊',
    MOBILE: '📱',
    API: '🔌',
  }
  return categoryIcons[category] || '📦'
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}
