/**
 * Spinner Component
 * Composant spinner/loader pour indiquer le chargement
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      secondary: 'text-secondary',
      muted: 'text-muted-foreground',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

function Spinner({ size, variant, className, label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn(spinnerVariants({ size, variant }), className)} />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export { Spinner, spinnerVariants };
