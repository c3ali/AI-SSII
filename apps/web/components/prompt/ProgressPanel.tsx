'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2, XCircle, X } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 glass-strong border-b border-white/10 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black gradient-text">Génération en cours...</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
                <span className="text-sm">⏱️</span>
                <span className="text-sm font-medium text-foreground/80">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong border border-purple-500/30">
                <span className="text-sm font-bold gradient-text">{completedSteps}/{totalSteps} étapes</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 transition-all duration-500 rounded-full shadow-lg shadow-purple-500/50"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground/60">
                {overallProgress.toFixed(0)}% complété
              </p>
              <p className="text-xs text-foreground/60">
                Temps restant estimé: ~{Math.max(0, 12 - Math.floor(elapsedTime / 60))} min
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                step.status === 'running'
                  ? 'glass-strong border-2 border-purple-500/50 glow scale-105'
                  : step.status === 'completed'
                  ? 'glass border border-emerald-500/30'
                  : 'glass border border-white/5'
              }`}
            >
              <div className="mt-1">
                {step.status === 'completed' && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                )}
                {step.status === 'running' && (
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 animate-pulse">
                    <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Circle className="h-5 w-5 text-foreground/40" />
                  </div>
                )}
                {step.status === 'failed' && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-semibold text-foreground">{step.name}</span>
                  {step.status === 'running' && (
                    <div className="ml-auto px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-medium text-purple-400 animate-pulse">
                      En cours...
                    </div>
                  )}
                  {step.status === 'completed' && (
                    <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400">
                      ✓ Terminé
                    </div>
                  )}
                </div>
                {step.message && (
                  <p className="text-sm text-foreground/60 mt-1">{step.message}</p>
                )}
                {step.duration && (
                  <p className="text-xs text-foreground/40 mt-1">
                    Durée: {step.duration}s
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="p-6 pt-0">
          <div className="p-4 glass-strong rounded-xl border border-blue-500/30">
            <p className="text-sm text-foreground/80">
              💡 <strong className="gradient-text">Pendant ce temps</strong>, l'équipe de 6 agents IA travaille en parallèle sur votre projet.
              Vous serez notifié si une validation humaine est nécessaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
