"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ComponentResult } from '@/types';
import { useBatch } from '@/contexts/BatchContext';

interface BatchResultTableProps {
  results: ComponentResult[];
  weightPercents: number[];
  totalWeight: number;
  desiredBatch: number;
  title: string;
  description?: string;
  showGF?: boolean;
}

const BatchResultTable: FC<BatchResultTableProps> = ({
  results,
  weightPercents,
  totalWeight,
  desiredBatch,
  title,
  description,
  showGF = false
}) => {
  const { products } = useBatch();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chemical</TableHead>
                {showGF && <TableHead className="text-right">Product</TableHead>}
                <TableHead className="text-right">{showGF ? 'MW × GF' : 'MW'}</TableHead>
                <TableHead className="text-right">Matrix (%)</TableHead>
                <TableHead className="text-right">Mol Qty</TableHead>
                <TableHead className="text-right">Batch wt (g)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={result.formula || `result-${index}`}>
                  <TableCell className="font-medium font-mono">
                    {result.formula || '—'}
                  </TableCell>
                  {showGF && (
                    <TableCell className="text-right font-mono">
                      {result.productFormula || '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-right">{result.mw ? result.mw.toFixed(3) : '—'}</TableCell>
                  <TableCell className="text-right">{result.matrix.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{result.molQty.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{weightPercents[index].toFixed(4)}</TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-muted/50">
                <TableCell className="font-semibold">Net wt</TableCell>
                {showGF && <TableCell />}
                <TableCell />
                <TableCell className="text-right font-semibold">
                  {results.reduce((a, c) => a + Number(c.matrix), 0).toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-semibold">{totalWeight.toFixed(4)}</TableCell>
                <TableCell className="text-right font-semibold">{desiredBatch.toFixed(3)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchResultTable;
