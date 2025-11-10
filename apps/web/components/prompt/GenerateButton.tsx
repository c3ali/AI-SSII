'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type ButtonState = 'idle' | 'analyzing' | 'designing' | 'coding' | 'testing' | 'deploying' | 'done'

interface GenerateButtonProps {
  state: ButtonState
  onClick: () => void
  disabled?: boolean
}

const stateConfig = {
  idle: {
    icon: '🚀',
    text: 'Générer l'application',
    className: 'bg-primary hover:bg-primary/90',
    showSpinner: false,
  },
  analyzing: {
    icon: '⏳',
    text: 'Analyse du brief...',
    className: 'bg-blue-500 hover:bg-blue-600',
    showSpinner: true,
  },
  designing: {
    icon: '🎨',
    text: 'Création du design system...',
    className: 'bg-purple-500 hover:bg-purple-600',
    showSpinner: true,
  },
  coding: {
    icon: '💻',
    text: 'Génération du code...',
    className: 'bg-green-500 hover:bg-green-600',
    showSpinner: true,
  },
  testing: {
    icon: '🧪',
    text: 'Tests automatisés...',
    className: 'bg-yellow-500 hover:bg-yellow-600',
    showSpinner: true,
  },
  deploying: {
    icon: '☁️',
    text: 'Déploiement...',
    className: 'bg-indigo-500 hover:bg-indigo-600',
    showSpinner: true,
  },
  done: {
    icon: '✅',
    text: 'Application générée !',
    className: 'bg-green-600 hover:bg-green-700',
    showSpinner: false,
  },
}

export function GenerateButton({ state, onClick, disabled }: GenerateButtonProps) {
  const config = stateConfig[state]
  const isLoading = state !== 'idle' && state !== 'done'

  return (
    <div className="space-y-3">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full h-14 text-lg font-semibold ${config.className}`}
        size="lg"
      >
        {config.showSpinner && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        <span className="mr-2">{config.icon}</span>
        {config.text}
      </Button>

      {state === 'idle' && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            Estimation : 12 minutes
          </span>
          <span className="flex items-center gap-1">
            <span>💰</span>
            Coût : ~3k tokens (≈ 0.06€)
          </span>
        </div>
      )}
    </div>
  )
}
