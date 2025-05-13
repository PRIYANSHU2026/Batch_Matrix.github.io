"use client";

import type { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ComponentResult } from '@/types';
import { useBatch } from '@/contexts/BatchContext';

interface BatchProductsResultTableProps {
  results: ComponentResult[];
  weightPercents: number[];
  totalWeight: number;
  desiredBatch: number;
  title: string;
  description: string;
}

const BatchProductsResultTable: FC<BatchProductsResultTableProps> = ({
  results,
  weightPercents,
  totalWeight,
  desiredBatch,
  title,
  description
}) => {
  // Get batch context
  const batch = useBatch();

  // Filter out empty products or those with the same formula for precursor and product
  const validResults = results.filter(r =>
    r.formula &&
    r.productFormula &&
    r.formula !== r.productFormula &&
    r.molQty > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Precursor</TableHead>
              <TableHead>Precursor MW</TableHead>
              <TableHead>GF</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validResults.length ? (
              <>
                {validResults.map((result, i) => {
                  return (
                    <TableRow key={`product-result-${result.productFormula}-${i}`}>
                      <TableCell className="font-mono text-sm">{result.productFormula}</TableCell>
                      <TableCell className="font-mono text-sm">{result.formula}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {result.mw ? result.mw.toFixed(2) : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {result.gf !== null ? result.gf.toFixed(4) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {weightPercents[i].toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {((weightPercents[i] / desiredBatch) * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {desiredBatch.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    100.00%
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No valid products to display. Add products with different formulas than their precursors.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BatchProductsResultTable;
