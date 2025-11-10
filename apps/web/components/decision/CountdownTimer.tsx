'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  deadline: number // Unix timestamp in milliseconds
  onExpire?: () => void
}

export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now()
      const remaining = deadline - now
      return Math.max(0, remaining)
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline, onExpire])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`
  }

  const percentage = ((deadline - Date.now()) / (5 * 60 * 1000)) * 100
  const isUrgent = timeLeft < 60000 // Less than 1 minute

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-red-900">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Temps expiré</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${isUrgent ? 'animate-pulse' : ''}`}>
      <div className="flex items-center gap-2">
        <Clock className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`} />
        <span className={`font-medium ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
          Il vous reste {formatTime(timeLeft)} pour répondre
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isUrgent ? 'bg-red-500' : 'bg-primary'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
    </div>
  )
}
