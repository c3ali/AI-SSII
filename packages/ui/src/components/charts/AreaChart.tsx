/**
 * AreaChart Component
 * Graphique en aires avec Recharts
 */

import * as React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../primitives/card';
import { cn } from '../../utils/cn';

export interface AreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name?: string;
    color?: string;
  }>;
  xAxisKey: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  className?: string;
}

export function AreaChart({
  data,
  areas,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: AreaChartProps) {
  return (
    <Card className={cn('p-6', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis dataKey={xAxisKey} className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={area.color || `hsl(${index * 60}, 70%, 50%)`}
              fill={area.color || `hsl(${index * 60}, 70%, 50%)`}
              fillOpacity={0.6}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
