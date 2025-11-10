/**
 * LineChart Component
 * Graphique en ligne avec Recharts
 */

import * as React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../primitives/card';
import { cn } from '../../utils/cn';

export interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name?: string;
    color?: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function LineChart({
  data,
  lines,
  xAxisKey,
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  return (
    <Card className={cn('p-6', className)}>
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data}>
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
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || `hsl(${index * 60}, 70%, 50%)`}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  );
}
