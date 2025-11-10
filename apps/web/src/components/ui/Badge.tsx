import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
  children: ReactNode
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-success-green/10 text-success-green border-success-green/20',
    warning: 'bg-warning-amber/10 text-warning-amber border-warning-amber/20',
    error: 'bg-error-red/10 text-error-red border-error-red/20',
    info: 'bg-electric-blue/10 text-electric-blue border-electric-blue/20',
    default: 'bg-gray-700/50 text-gray-300 border-gray-600/20',
  }

  return (
    <span
      className={cn(
        'status-badge',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
