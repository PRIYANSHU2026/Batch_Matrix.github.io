"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBatch } from '@/contexts/BatchContext';
import { calculateMolecularWeight, calculateMassPercent, formulaToElementsArray } from '@/lib/batchCalculations';
import ElementAutoSuggest from '@/components/forms/ElementAutoSuggest';

export default function MassCalculationCard() {
  const { atomics } = useBatch();
  const [formula, setFormula] = useState<string>('Na2O');
  const [elements, setElements] = useState<Array<{ count: number; atomicWeight: number; symbol: string; name: string }>>([]);
  const [molecularWeight, setMolecularWeight] = useState<number>(0);

  useEffect(() => {
    if (formula && atomics.length > 0) {
      const parsedElements = formulaToElementsArray(formula, atomics);

      if (parsedElements) {
        // Add symbol and name to each element for display
        const elementsWithDetails = parsedElements.map(el => {
          const atomicInfo = atomics.find(a => Math.abs(a["Atomic Mass"] - el.atomicWeight) < 0.01);
          return {
            ...el,
            symbol: atomicInfo?.Symbol || '?',
            name: atomicInfo?.Element || 'Unknown'
          };
        });

        setElements(elementsWithDetails);
        setMolecularWeight(calculateMolecularWeight(parsedElements));
      } else {
        setElements([]);
        setMolecularWeight(0);
      }
    }
  }, [formula, atomics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Molecular Weight Calculator</CardTitle>
        <CardDescription>
          Calculate molecular weight and mass percentage of elements in a compound
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="formula">Chemical Formula</Label>
            <ElementAutoSuggest
              value={formula}
              onChange={setFormula}
              atomics={atomics}
              inputProps={{
                placeholder: "e.g. Na2O, CaO, H2SO4",
                className: "font-mono"
              }}
            />
          </div>

          {elements.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="font-medium">Results</div>
              <div className="flex justify-between">
                <span>Molecular Weight:</span>
                <span className="font-mono font-semibold">{molecularWeight.toFixed(4)} g/mol</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Element</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Atomic Weight</TableHead>
                    <TableHead className="text-right">Mass %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elements.map((el, index) => (
                    <TableRow key={`element-${el.symbol}-${index}`}>
                      <TableCell>{el.name}</TableCell>
                      <TableCell className="font-mono">{el.symbol}</TableCell>
                      <TableCell className="text-right">{el.count}</TableCell>
                      <TableCell className="text-right">{el.atomicWeight.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {calculateMassPercent(el.count, el.atomicWeight, molecularWeight).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {elements.length === 0 && formula && (
            <div className="text-amber-600 dark:text-amber-400 mt-2">
              Invalid formula or elements not found in periodic table.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
