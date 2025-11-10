import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'input-field resize-none',
            error && 'border-error-red focus:ring-error-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-red">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
