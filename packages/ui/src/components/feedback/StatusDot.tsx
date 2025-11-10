/**
 * StatusDot Component
 * Composant point de statut pour indiquer l'état
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const statusDotVariants = cva('relative inline-flex h-3 w-3 rounded-full', {
  variants: {
    status: {
      idle: 'bg-gray-400',
      running: 'bg-blue-500',
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
    },
  },
  defaultVariants: {
    status: 'idle',
  },
});

export interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  className?: string;
  pulse?: boolean;
}

function StatusDot({ status, pulse = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            status === 'running' && 'bg-blue-400',
            status === 'success' && 'bg-green-400',
            status === 'error' && 'bg-red-400',
            status === 'warning' && 'bg-yellow-400'
          )}
        />
      )}
      <span className={cn(statusDotVariants({ status }))} />
    </span>
  );
}

export { StatusDot, statusDotVariants };
