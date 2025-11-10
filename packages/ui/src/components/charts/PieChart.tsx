/**
 * PieChart Component
 * Graphique en camembert avec Recharts
 */

import * as React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../primitives/card';
import { cn } from '../../utils/cn';

export interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 70%, 50%)',
  'hsl(340, 70%, 50%)',
  'hsl(40, 70%, 50%)',
  'hsl(120, 70%, 50%)',
  'hsl(180, 70%, 50%)',
];

export function PieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  className,
}: PieChartProps) {
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <Card className={cn('p-6', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </Card>
  );
}
