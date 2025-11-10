'use client'

import { TARGETS } from '@/lib/constants'

interface TargetSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const options = [
  { value: TARGETS.WEB, label: 'Web seul', icon: '🖥️', description: 'Application web uniquement' },
  { value: TARGETS.MOBILE, label: 'Mobile seul', icon: '📱', description: 'Application mobile (iOS & Android)' },
  { value: TARGETS.BOTH, label: 'Web + Mobile', icon: '🌐', description: 'Application complète (recommandé)' },
]

export function TargetSelector({ value, onChange, disabled }: TargetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Cible</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              value === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input hover:border-primary/50 hover:bg-accent'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-3xl mb-2">{option.icon}</span>
            <span className="font-medium text-sm">{option.label}</span>
            <span className="text-xs text-muted-foreground mt-1">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
