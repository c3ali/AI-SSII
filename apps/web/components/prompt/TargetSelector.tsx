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
    <div className="space-y-4">
      <label className="text-base font-semibold text-foreground">Plateforme cible</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ${
                isSelected
                  ? 'glass-strong border-2 border-purple-500/50 glow scale-105'
                  : 'glass border border-white/10 hover:glass-strong hover:border-white/20 hover:scale-105'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Glow effect on selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 -z-10 blur-xl" />
              )}

              <span className={`text-4xl mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                {option.icon}
              </span>
              <span className={`font-bold text-base mb-2 ${isSelected ? 'gradient-text' : 'text-foreground'}`}>
                {option.label}
              </span>
              <span className="text-xs text-foreground/60 text-center leading-relaxed">
                {option.description}
              </span>

              {/* Checkmark for selected */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
