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
import type { ProductResult } from '@/types';

interface BatchProductsResultTableProps {
  results: ProductResult[];
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
  // Filter out empty products
  const validResults = results.filter(r => r.formula && r.molQty > 0);

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
              <TableHead>Ratio</TableHead>
              <TableHead>GF</TableHead>
              <TableHead>MW eff.</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validResults.length ? (
              <>
                {validResults.map((result, i) => (
                  <TableRow key={`product-result-${result.formula}-${i}`}>
                    <TableCell className="font-mono text-sm">{result.formula}</TableCell>
                    <TableCell className="font-mono text-sm">{result.precursorFormula}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.precursorMoles}:{result.productMoles}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.gf !== null ? result.gf.toFixed(4) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.gf !== null
                        ? (result.mw * result.gf).toFixed(2)
                        : result.mw.toFixed(2)
                      }
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {weightPercents[i].toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {((weightPercents[i] / desiredBatch) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={5} className="font-medium">
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
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No valid products to display. Add products with their precursors to see results.
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
