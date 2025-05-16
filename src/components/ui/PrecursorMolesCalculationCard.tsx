"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBatch } from '@/contexts/BatchContext';
import { calculateTotalWeight, calculateAdjustedWeights } from '@/lib/batchCalculations';

export default function PrecursorMolesCalculationCard() {
  const { components, desiredBatch } = useBatch();
  const [precursorMoles, setPrecursorMoles] = useState<number>(1);
  const [componentsWithMoles, setComponentsWithMoles] = useState<Array<{
    formula: string;
    matrix: number;
    molecularWeight: number;
    precursorMoles: number;
  }>>([]);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [adjustedWeights, setAdjustedWeights] = useState<Array<{ formula: string; weight: number }>>([]);

  // Update components with moles
  useEffect(() => {
    const updatedComponents = components.map(c => ({
      formula: c.formula,
      matrix: c.matrix,
      molecularWeight: c.mw,
      precursorMoles
    }));

    setComponentsWithMoles(updatedComponents);

    // Calculate total weight and adjusted weights
    if (updatedComponents.length > 0) {
      const calculatedTotalWeight = calculateTotalWeight(updatedComponents);
      setTotalWeight(calculatedTotalWeight);

      const calculatedAdjustedWeights = calculateAdjustedWeights(
        updatedComponents,
        calculatedTotalWeight,
        desiredBatch
      );
      setAdjustedWeights(calculatedAdjustedWeights);
    }
  }, [components, precursorMoles, desiredBatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Calculations with Precursor Moles</CardTitle>
        <CardDescription>
          Calculate batch weights considering precursor moles: (Matrix × MW × Precursor Moles) ÷ 1000
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="precursor-moles">Precursor Moles</Label>
            <Input
              id="precursor-moles"
              type="number"
              value={precursorMoles}
              onChange={(e) => setPrecursorMoles(Number(e.target.value) || 1)}
              min={1}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Number of moles to use for precursor calculations
            </p>
          </div>

          {componentsWithMoles.length > 0 && (
            <div className="space-y-4 mt-4">
              <div className="font-medium">Results</div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chemical</TableHead>
                    <TableHead className="text-right">MW</TableHead>
                    <TableHead className="text-right">Matrix (%)</TableHead>
                    <TableHead className="text-right">Moles</TableHead>
                    <TableHead className="text-right">Mol Qty</TableHead>
                    <TableHead className="text-right">Batch wt (g)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {componentsWithMoles.map((comp, index) => (
                    <TableRow key={`comp-${comp.formula || 'empty'}-${index}`}>
                      <TableCell className="font-medium font-mono">{comp.formula || '—'}</TableCell>
                      <TableCell className="text-right">{comp.molecularWeight.toFixed(3)}</TableCell>
                      <TableCell className="text-right">{comp.matrix.toFixed(3)}</TableCell>
                      <TableCell className="text-right">{comp.precursorMoles}</TableCell>
                      <TableCell className="text-right">
                        {((comp.matrix * comp.molecularWeight * comp.precursorMoles) / 1000).toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right">
                        {adjustedWeights[index]?.weight.toFixed(4) || '0.0000'}
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Net wt</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold">
                      {componentsWithMoles.reduce((a, c) => a + Number(c.matrix), 0).toFixed(3)}
                    </TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold">{totalWeight.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-semibold">{desiredBatch.toFixed(3)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Using formula: (Matrix × MW × Precursor Moles) ÷ 1000 = Molecular Quantity</div>
                <div>Batch weights: (Mol Qty ÷ Total Weight) × Desired Batch Size</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
