'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'

interface ProgressStep {
  id: string
  name: string
  icon: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: number
  message?: string
}

interface ProgressPanelProps {
  isOpen: boolean
  currentStatus: string
  progress?: number
  onClose?: () => void
}

const STEPS: Omit<ProgressStep, 'status'>[] = [
  { id: 'analyzing', name: 'Analyse du brief', icon: '⏳' },
  { id: 'designing', name: 'Création du design system', icon: '🎨' },
  { id: 'coding', name: 'Génération du code', icon: '💻' },
  { id: 'security', name: 'Audit de sécurité', icon: '🛡️' },
  { id: 'testing', name: 'Tests automatisés', icon: '🧪' },
  { id: 'deploying', name: 'Déploiement', icon: '☁️' },
]

export function ProgressPanel({ isOpen, currentStatus, progress = 0, onClose }: ProgressPanelProps) {
  const [steps, setSteps] = useState<ProgressStep[]>(
    STEPS.map(step => ({ ...step, status: 'pending' }))
  )
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setSteps(steps =>
      steps.map((step, index) => {
        if (step.id === currentStatus) {
          return { ...step, status: 'running' }
        }
        if (STEPS.findIndex(s => s.id === currentStatus) > index) {
          return { ...step, status: 'completed' }
        }
        if (currentStatus === 'failed') {
          return { ...step, status: 'failed' }
        }
        return { ...step, status: 'pending' }
      })
    )
  }, [currentStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  const completedSteps = steps.filter(s => s.status === 'completed').length
  const totalSteps = steps.length
  const overallProgress = (completedSteps / totalSteps) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Génération en cours...</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>⏱️ {formatTime(elapsedTime)}</span>
              <Badge variant="outline">{completedSteps}/{totalSteps} étapes</Badge>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overallProgress.toFixed(0)}% complété
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  step.status === 'running' ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                }`}
              >
                <div className="mt-0.5">
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === 'running' && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  {step.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="font-medium">{step.name}</span>
                    {step.status === 'running' && (
                      <Badge variant="outline" className="ml-auto">En cours...</Badge>
                    )}
                    {step.status === 'completed' && (
                      <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                        Terminé
                      </Badge>
                    )}
                  </div>
                  {step.message && (
                    <p className="text-sm text-muted-foreground mt-1">{step.message}</p>
                  )}
                  {step.duration && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Durée: {step.duration}s
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Pendant ce temps</strong>, l'équipe de 6 agents IA travaille en parallèle sur votre projet.
              Vous serez notifié si une validation humaine est nécessaire.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
