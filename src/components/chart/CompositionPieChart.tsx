"use client";

import type { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ElementComposition } from '@/types';

interface CompositionPieChartProps {
  data: ElementComposition[];
  title?: string;
}

const CompositionPieChart: FC<CompositionPieChartProps> = ({ data, title }) => {
  // Filter out elements with very small percentages (less than 0.5%)
  const filteredData = data.filter(item => item.percentage >= 0.5);

  // If there are elements with < 0.5%, add an "Other" category
  const smallElements = data.filter(item => item.percentage < 0.5);
  if (smallElements.length > 0) {
    const otherPercentage = smallElements.reduce((sum, item) => sum + item.percentage, 0);
    if (otherPercentage > 0) {
      filteredData.push({
        element: 'Other',
        percentage: otherPercentage,
        color: '#aaaaaa'
      });
    }
  }

  return (
    <div className="w-full h-[300px] flex flex-col">
      {title && <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            dataKey="percentage"
            nameKey="element"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={30}
            labelLine={true}
            label={({ element, percentage }) => `${element} (${percentage.toFixed(1)}%)`}
          >
            {filteredData.map((entry) => (
              <Cell key={`cell-${entry.element}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Percentage']}
            labelFormatter={(label) => `Element: ${label}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompositionPieChart;
