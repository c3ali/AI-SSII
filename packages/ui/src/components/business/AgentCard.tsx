/**
 * AgentCard Component
 * Carte agent avec statut et progression
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/card';
import { Badge } from '../feedback/Badge';
import { Progress } from '../feedback/Progress';
import { StatusDot } from '../feedback/StatusDot';
import { cn } from '../../utils/cn';

export interface AgentCardProps {
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  logs?: string[];
  icon: React.ReactNode;
  startTime?: Date;
  endTime?: Date;
  className?: string;
}

const statusConfig = {
  idle: { color: 'gray' as const, label: 'En attente', pulse: false, badgeVariant: 'outline' as const },
  running: { color: 'blue' as const, label: 'En cours', pulse: true, badgeVariant: 'default' as const },
  success: { color: 'green' as const, label: 'Terminé', pulse: false, badgeVariant: 'success' as const },
  error: { color: 'red' as const, label: 'Erreur', pulse: false, badgeVariant: 'error' as const },
};

export function AgentCard({
  name,
  description,
  status,
  progress = 0,
  logs = [],
  icon,
  startTime,
  endTime,
  className,
}: AgentCardProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn('relative', className)}
    >
      <Card className="relative overflow-hidden">
        {/* Gradient border animation pour running */}
        {status === 'running' && (
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-20 bg-[length:200%_200%]" />
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-2 dark:from-gray-800 dark:to-gray-900">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusDot status={status} pulse={config.pulse} />
            <Badge variant={config.badgeVariant}>{config.label}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          {status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              {logs.length > 0 && (
                <div className="mt-3 rounded-md bg-muted/50 p-2">
                  <p className="font-mono text-xs text-muted-foreground">{logs[logs.length - 1]}</p>
                </div>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complété avec succès
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center text-sm text-red-600">
              <XCircle className="mr-2 h-4 w-4" />
              Une erreur est survenue
            </div>
          )}

          {status === 'idle' && (
            <div className="text-sm text-muted-foreground">Prêt à démarrer</div>
          )}

          {(startTime || endTime) && (
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              {startTime && (
                <div>
                  <span className="font-medium">Début: </span>
                  {startTime.toLocaleTimeString()}
                </div>
              )}
              {endTime && (
                <div>
                  <span className="font-medium">Fin: </span>
                  {endTime.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
