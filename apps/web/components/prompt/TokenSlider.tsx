'use client'

import { TOKEN_COSTS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

interface TokenSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function TokenSlider({ value, onChange, disabled }: TokenSliderProps) {
  const cost = value * TOKEN_COSTS.PER_TOKEN

  return (
    <div className="space-y-2">
      <label htmlFor="token-slider" className="text-sm font-medium">
        Budget max (tokens)
      </label>
      <div className="flex items-center gap-4">
        <input
          id="token-slider"
          type="range"
          min={TOKEN_COSTS.MINIMUM}
          max={TOKEN_COSTS.MAXIMUM}
          step={1000}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="text-sm font-medium w-24 text-right">
          {value.toLocaleString()}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{TOKEN_COSTS.MINIMUM.toLocaleString()} min</span>
        <span className="font-medium text-foreground">
          Coût estimé : {formatCurrency(cost)}
        </span>
        <span>{TOKEN_COSTS.MAXIMUM.toLocaleString()} max</span>
      </div>
    </div>
  )
}
