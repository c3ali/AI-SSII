/**
 * ProjectCard Component
 * Carte projet pour afficher les informations d'un projet
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../primitives/card';
import { Badge } from '../feedback/Badge';
import { Progress } from '../feedback/Progress';
import { cn } from '../../utils/cn';

export interface ProjectCardProps {
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed';
  progress?: number;
  tags?: string[];
  team?: number;
  dueDate?: Date;
  repository?: string;
  className?: string;
  onClick?: () => void;
}

const statusConfig = {
  planning: { label: 'Planification', variant: 'outline' as const },
  in_progress: { label: 'En cours', variant: 'default' as const },
  review: { label: 'En revue', variant: 'warning' as const },
  completed: { label: 'Terminé', variant: 'success' as const },
};

export function ProjectCard({
  name,
  description,
  status,
  progress = 0,
  tags = [],
  team,
  dueDate,
  repository,
  className,
  onClick,
}: ProjectCardProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-lg',
          onClick && 'hover:border-primary'
        )}
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          {status === 'in_progress' && progress > 0 && (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progression</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {team && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{team} membre{team > 1 ? 's' : ''}</span>
              </div>
            )}

            {dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{dueDate.toLocaleDateString()}</span>
              </div>
            )}

            {repository && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span className="truncate">{repository}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
