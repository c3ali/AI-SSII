'use client'

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
    text: "Générer l'application",
    className: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105',
    showSpinner: false,
  },
  analyzing: {
    icon: '⏳',
    text: 'Analyse du brief...',
    className: 'bg-gradient-to-r from-blue-600 to-cyan-600 animate-pulse shadow-lg shadow-blue-500/50',
    showSpinner: true,
  },
  designing: {
    icon: '🎨',
    text: 'Création du design system...',
    className: 'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse shadow-lg shadow-purple-500/50',
    showSpinner: true,
  },
  coding: {
    icon: '💻',
    text: 'Génération du code...',
    className: 'bg-gradient-to-r from-emerald-600 to-teal-600 animate-pulse shadow-lg shadow-emerald-500/50',
    showSpinner: true,
  },
  testing: {
    icon: '🧪',
    text: 'Tests automatisés...',
    className: 'bg-gradient-to-r from-yellow-600 to-orange-600 animate-pulse shadow-lg shadow-yellow-500/50',
    showSpinner: true,
  },
  deploying: {
    icon: '☁️',
    text: 'Déploiement...',
    className: 'bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse shadow-lg shadow-indigo-500/50',
    showSpinner: true,
  },
  done: {
    icon: '✅',
    text: 'Application générée !',
    className: 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/70',
    showSpinner: false,
  },
}

export function GenerateButton({ state, onClick, disabled }: GenerateButtonProps) {
  const config = stateConfig[state]
  const isLoading = state !== 'idle' && state !== 'done'

  return (
    <div className="space-y-4">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full h-16 rounded-xl text-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${config.className}`}
      >
        <div className="flex items-center justify-center gap-3">
          {config.showSpinner && <Loader2 className="h-6 w-6 animate-spin" />}
          <span className="text-2xl">{config.icon}</span>
          <span>{config.text}</span>
        </div>
      </button>

      {state === 'idle' && (
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
            <span className="text-lg">⏱️</span>
            <span className="text-foreground/80 font-medium">12 minutes</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
            <span className="text-lg">💰</span>
            <span className="text-foreground/80 font-medium">~3k tokens (≈ 0.06€)</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center">
          <div className="px-4 py-2 rounded-full glass-strong border border-white/20 shimmer">
            <span className="text-sm font-medium gradient-text">Génération en cours...</span>
          </div>
        </div>
      )}
    </div>
  )
}
