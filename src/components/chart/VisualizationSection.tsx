"use client";

import { type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useBatch } from '@/contexts/BatchContext';
import CompositionPieChart from './CompositionPieChart';

const VisualizationSection: FC = () => {
  const { elementComposition } = useBatch();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Composition Visualization</CardTitle>
        <CardDescription>
          Analyze the elemental composition of your batch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CompositionPieChart
          data={elementComposition}
          title="Element Composition Distribution"
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationSection;
