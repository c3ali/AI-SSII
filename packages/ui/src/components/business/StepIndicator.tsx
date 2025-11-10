/**
 * StepIndicator Component
 * Indicateur de progression par étapes
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

export interface StepIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function StepIndicator({
  steps,
  orientation = 'horizontal',
  className,
}: StepIndicatorProps) {
  const getStepColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success border-success text-white';
      case 'current':
        return 'bg-primary border-primary text-white';
      case 'error':
        return 'bg-error border-error text-white';
      default:
        return 'bg-background border-border text-muted-foreground';
    }
  };

  const getConnectorColor = (currentStatus: Step['status'], nextStatus: Step['status']) => {
    if (currentStatus === 'completed') {
      return 'bg-success';
    }
    return 'bg-border';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                  getStepColor(step.status)
                )}
              >
                {step.status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </motion.div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <h4
                  className={cn(
                    'font-medium',
                    step.status === 'current' && 'text-primary',
                    step.status === 'completed' && 'text-success',
                    step.status === 'error' && 'text-error',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </h4>
                {step.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-5 top-10 h-full w-0.5 -translate-x-1/2',
                  getConnectorColor(step.status, steps[index + 1].status)
                )}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-2">
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2',
                getStepColor(step.status)
              )}
            >
              {step.status === 'completed' ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </motion.div>

            {/* Step label */}
            <div className="text-center">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'current' && 'text-primary',
                  step.status === 'completed' && 'text-success',
                  step.status === 'error' && 'text-error',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 flex-1',
                getConnectorColor(step.status, steps[index + 1].status)
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
