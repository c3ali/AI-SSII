/**
 * Divider Component
 * Composant divider pour séparer visuellement le contenu
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const dividerVariants = cva('bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
    variant: {
      solid: '',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
  },
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation, variant, label, ...props }, ref) => {
    if (label && orientation === 'horizontal') {
      return (
        <div className={cn('relative flex items-center', className)} ref={ref} {...props}>
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 flex-shrink text-xs text-muted-foreground">{label}</span>
          <div className="flex-grow border-t border-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, variant }), className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider, dividerVariants };
