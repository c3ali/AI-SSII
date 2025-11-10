'use client'

import { useEffect, useRef } from 'react'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function PromptInput({ value, onChange, placeholder, disabled }: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [value])

  const defaultPlaceholder = `📝 Décrivez votre application en français naturel...

"Je veux une app de livraison de repas avec :
- Paiement mobile (Stripe)
- Suivi GPS temps réel (Mapbox)
- Dashboard admin pour 3 gestionnaires
- Mode offline pour les chauffeurs
- Push notifications
- 50 chauffeurs max dans la v1"

💡 Astuce : Plus vous êtes précis, mieux c'est !`

  return (
    <div className="w-full space-y-4">
      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          disabled={disabled}
          className="relative z-10 w-full min-h-[300px] rounded-xl glass border-white/20 bg-white/5 px-6 py-4 text-base text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:glass-strong focus-visible:border-purple-500/50 focus-visible:glow disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-300"
          style={{ overflow: 'hidden' }}
        />
        {/* Gradient border on focus */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-emerald-500/0 group-focus-within:from-purple-500/20 group-focus-within:via-blue-500/20 group-focus-within:to-emerald-500/20 transition-all duration-300 -z-10 blur-xl pointer-events-none" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground/60 font-medium">{value.length} caractères</span>
          {value.length < 50 && value.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs text-yellow-400 font-medium">Minimum 50 caractères requis</span>
            </div>
          )}
          {value.length >= 50 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-in slide-in-from-left duration-300">
              <span className="text-emerald-400">✓</span>
              <span className="text-xs text-emerald-400 font-medium">Brief suffisamment détaillé</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
