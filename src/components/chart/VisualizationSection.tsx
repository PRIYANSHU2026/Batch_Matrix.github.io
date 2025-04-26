"use client";

import { type FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBatch } from '@/contexts/BatchContext';
import CompositionPieChart from './CompositionPieChart';
import CompositionBarChart from './CompositionBarChart';
import Composition3DScatter from './Composition3DScatter';
import type { Plot3DPoint } from '@/types';

const VisualizationSection: FC = () => {
  const { elementComposition, components } = useBatch();
  const [tab, setTab] = useState('pie');

  // Generate 3D data for the scatter plot
  const generate3DData = (): Plot3DPoint[] => {
    // We'll use up to 3 main elements for x, y, z axes
    const topElements = [...elementComposition]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // If we don't have at least 3 elements, add dummy ones
    while (topElements.length < 3) {
      topElements.push({
        element: `Element-${topElements.length + 1}`,
        percentage: 0,
        color: 'gray'
      });
    }

    // Create a 3D point for each composition
    return components
      .filter(comp => comp.formula && comp.matrix > 0)
      .map(comp => {
        // Calculate content of each element in this compound
        const elementValues = new Map<string, number>();
        for (const elem of elementComposition) {
          elementValues.set(elem.element, 0);
        }

        // Simplistic mapping just for visualization
        for (const elem of elementComposition) {
          if (comp.formula.includes(elem.element.substring(0, 2))) {
            elementValues.set(elem.element, elem.percentage * (comp.matrix / 100));
          }
        }

        return {
          x: elementValues.get(topElements[0].element) || 0,
          y: elementValues.get(topElements[1].element) || 0,
          z: elementValues.get(topElements[2].element) || 0,
          label: `${comp.formula} (${comp.matrix.toFixed(1)}%)`,
          size: 10 + (comp.matrix / 10),
          color: `rgba(${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, ${Math.random() * 200 + 50}, 0.8)`
        };
      });
  };

  const scatter3DData = generate3DData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Composition Visualization</CardTitle>
        <CardDescription>
          Analyze the elemental composition of your batch in different chart formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" onValueChange={setTab} value={tab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="3d">3D Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-4">
            <CompositionPieChart
              data={elementComposition}
              title="Element Composition Distribution"
            />
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            <CompositionBarChart
              data={elementComposition}
              title="Element Composition by Percentage"
            />
          </TabsContent>

          <TabsContent value="3d" className="mt-4">
            <Composition3DScatter
              data={scatter3DData}
              title="3D Element Distribution"
              xLabel={elementComposition[0]?.element || 'X'}
              yLabel={elementComposition[1]?.element || 'Y'}
              zLabel={elementComposition[2]?.element || 'Z'}
              height={400}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualizationSection;
