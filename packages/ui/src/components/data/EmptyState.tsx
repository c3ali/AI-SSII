/**
 * EmptyState Component
 * Composant pour afficher un état vide
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { FileX } from 'lucide-react';
import { Button } from '../primitives/button';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center p-12 text-center', className)}
    >
      <div className="mb-4 rounded-full bg-muted p-6">
        {icon || <FileX className="h-12 w-12 text-muted-foreground" />}
      </div>

      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      {description && <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>}

      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
