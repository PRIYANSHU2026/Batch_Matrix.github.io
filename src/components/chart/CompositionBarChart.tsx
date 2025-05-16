"use client";

import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ElementComposition } from '@/types';

interface CompositionBarChartProps {
  data: ElementComposition[];
  title?: string;
  yAxisLabel?: string;
}

const CompositionBarChart: FC<CompositionBarChartProps> = ({
  data,
  title,
  yAxisLabel = 'Percentage (%)'
}) => {
  // Sort data by percentage (descending)
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="w-full h-[300px] flex flex-col">
      {title && <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.7} />
          <XAxis dataKey="element" />
          <YAxis
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Percentage']}
            labelFormatter={(label) => `Element: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="percentage"
            name="Percentage"
            fill="#1e88e5"
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
          >
            {sortedData.map((entry) => (
              <Bar
                key={`bar-${entry.element}`}
                dataKey="percentage"
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompositionBarChart;
