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
    <div className="w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        className="w-full min-h-[300px] rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        style={{ overflow: 'hidden' }}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.length} caractères</span>
        {value.length < 50 && value.length > 0 && (
          <span className="text-yellow-600">Minimum 50 caractères requis</span>
        )}
        {value.length >= 50 && (
          <span className="text-green-600">✓ Brief suffisamment détaillé</span>
        )}
      </div>
    </div>
  )
}
