/**
 * MetricCard Component
 * Carte métrique pour afficher des KPI et statistiques
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/card';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-success/50 bg-success/5',
  warning: 'border-warning/50 bg-warning/5',
  error: 'border-error/50 bg-error/5',
  info: 'border-info/50 bg-info/5',
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-error" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    if (trend.value > 0) return 'text-success';
    if (trend.value < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className={cn('relative overflow-hidden', variantStyles[variant])}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>

        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">{value}</div>

            {trend && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {Math.abs(trend.value)}%
                  {trend.label && ` ${trend.label}`}
                </span>
              </div>
            )}
          </div>

          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
