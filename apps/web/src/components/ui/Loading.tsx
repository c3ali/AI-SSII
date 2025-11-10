import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        <div className={cn('loading-spinner border-4 border-electric-blue/30 border-t-electric-blue rounded-full', sizes[size])}></div>
      </div>
      {text && <p className="mt-3 text-sm text-gray-400">{text}</p>}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading size="lg" text="Loading..." />
    </div>
  )
}

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading size="lg" />
    </div>
  )
}
