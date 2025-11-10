/**
 * Progress Component
 * Composant barre de progression
 */

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../utils/cn';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value = 0, variant = 'default', showValue = false, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };

    return (
      <div className="space-y-1">
        {showValue && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{value}%</span>
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-300',
              variantClasses[variant]
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
