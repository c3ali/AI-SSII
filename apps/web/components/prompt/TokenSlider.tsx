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

  const percentage = ((value - TOKEN_COSTS.MINIMUM) / (TOKEN_COSTS.MAXIMUM - TOKEN_COSTS.MINIMUM)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="token-slider" className="text-base font-semibold text-foreground">
          Budget max (tokens)
        </label>
        <div className="px-4 py-1.5 rounded-full glass border border-white/20">
          <span className="text-sm font-bold gradient-text">
            {value.toLocaleString()} tokens
          </span>
        </div>
      </div>

      <div className="relative pt-1">
        <input
          id="token-slider"
          type="range"
          min={TOKEN_COSTS.MINIMUM}
          max={TOKEN_COSTS.MAXIMUM}
          step={1000}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider-thumb"
          style={{
            background: `linear-gradient(to right,
              hsl(263 70% 60%) 0%,
              hsl(217 91% 60%) ${percentage}%,
              rgba(255,255,255,0.05) ${percentage}%,
              rgba(255,255,255,0.05) 100%)`
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
          <span className="text-xs text-foreground/60">Min:</span>
          <span className="text-xs font-medium text-foreground/80">{TOKEN_COSTS.MINIMUM.toLocaleString()}</span>
        </div>
        <div className="px-4 py-1.5 rounded-full glass-strong border border-purple-500/30 glow">
          <span className="text-sm font-bold gradient-text">
            Coût : {formatCurrency(cost)}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
          <span className="text-xs text-foreground/60">Max:</span>
          <span className="text-xs font-medium text-foreground/80">{TOKEN_COSTS.MAXIMUM.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
