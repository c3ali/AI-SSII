/**
 * BarChart Component
 * Graphique en barres avec Recharts
 */

import * as React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../primitives/card';
import { cn } from '../../utils/cn';

export interface BarChartProps {
  data: any[];
  bars: Array<{
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

export function BarChart({
  data,
  bars,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  stacked = false,
  className,
}: BarChartProps) {
  return (
    <Card className={cn('p-6', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data}>
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color || `hsl(${index * 60}, 70%, 50%)`}
              stackId={stacked ? 'stack' : undefined}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
}
