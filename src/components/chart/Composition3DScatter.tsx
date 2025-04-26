"use client";

import { type FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Plot3DPoint } from '@/types';

// Dynamically import Plotly to avoid SSR issues
const PlotComponent = dynamic(() => import('react-plotly.js'), { ssr: false });

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
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  zLabel = 'Z Axis',
  width = '100%',
  height = 400
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract data for plotly
  const xValues = data.map(item => item.x);
  const yValues = data.map(item => item.y);
  const zValues = data.map(item => item.z);
  const labels = data.map(item => item.label || '');
  const sizes = data.map(item => item.size || 8);
  const colors = data.map(item => item.color || '#1e88e5');

  // Convert width/height to numbers for Plotly layout
  const layoutWidth = typeof width === 'string' ? undefined : width;
  const layoutHeight = typeof height === 'number' ? height : undefined;

  if (!isMounted) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center border rounded-md bg-muted/30"
      >
        <p className="text-muted-foreground">Loading 3D visualization...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ width }}>
      {title && <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>}
      <div className="rounded-md border overflow-hidden p-1 bg-card">
        <PlotComponent
          data={[
            {
              type: 'scatter3d',
              mode: 'markers',
              x: xValues,
              y: yValues,
              z: zValues,
              text: labels,
              hoverinfo: 'text',
              marker: {
                size: sizes,
                color: colors,
                opacity: 0.8,
              },
            },
          ]}
          layout={{
            width: layoutWidth,
            height: layoutHeight,
            title: '',
            margin: { l: 0, r: 0, b: 0, t: 0, pad: 10 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              xaxis: {
                title: xLabel,
                showgrid: true,
                zeroline: true,
              },
              yaxis: {
                title: yLabel,
                showgrid: true,
                zeroline: true,
              },
              zaxis: {
                title: zLabel,
                showgrid: true,
                zeroline: true,
              },
              camera: {
                eye: { x: 1.25, y: 1.25, z: 1.25 }
              }
            },
            autosize: true
          }}
          config={{
            displayModeBar: true,
            responsive: true,
          }}
          style={{ width: '100%', height: typeof height === 'number' ? height : 400 }}
        />
      </div>
    </div>
  );
};

export default Composition3DScatter;
