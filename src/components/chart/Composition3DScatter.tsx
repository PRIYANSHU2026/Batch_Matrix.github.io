"use client";

import { type FC } from 'react';
import type { Plot3DPoint } from '@/types';

interface Composition3DScatterProps {
  data: Plot3DPoint[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  width?: number | string;
  height?: number | string;
}

const Composition3DScatter: FC<Composition3DScatterProps> = ({
  data,
  title = 'Composition 3D Visualization',
  width = '100%',
  height = 400
}) => {
  // Create a simplified placeholder for the 3D visualization
  return (
    <div className="w-full flex flex-col" style={{ width }}>
      {title && <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>}
      <div
        className="rounded-md border overflow-hidden p-6 bg-card flex items-center justify-center"
        style={{ height: typeof height === 'number' ? height : 400 }}
      >
        <div className="text-center">
          <p className="text-lg font-medium mb-2">3D Visualization</p>
          <p className="text-muted-foreground text-sm">
            {data.length} data points available for visualization
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {data.slice(0, 6).map((point, index) => (
              <div
                key={index}
                className="p-2 rounded-md"
                style={{
                  backgroundColor: point.color || '#1e88e5',
                  color: 'white',
                  width: '100%',
                  textAlign: 'center'
                }}
              >
                {point.label || `Point ${index + 1}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Composition3DScatter;
