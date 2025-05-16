"use client";

import type { FC } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ProductResult } from '@/types';

interface BatchProductTableProps {
  results: ProductResult[];
  weightPercents: number[];
  totalWeight: number;
  desiredBatch: number;
  title?: string;
  description?: string;
}

const BatchProductTable: FC<BatchProductTableProps> = ({
  results,
  weightPercents,
  totalWeight,
  desiredBatch,
  title = "Product Calculation",
  description = "Calculated product weights with Gravimetric Factors"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Product</TableHead>
              <TableHead>MW</TableHead>
              <TableHead>Precursor</TableHead>
              <TableHead>Ratio</TableHead>
              <TableHead>GF</TableHead>
              <TableHead>Molar Qty</TableHead>
              <TableHead className="text-right">Weight (g)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={`result-${result.formula || 'empty'}-${index}`}>
                <TableCell className="font-medium">{result.formula || "-"}</TableCell>
                <TableCell>{result.mw ? result.mw.toFixed(3) : "-"}</TableCell>
                <TableCell>{result.precursorFormula || "-"}</TableCell>
                <TableCell>
                  {result.precursorMoles}:{result.productMoles}
                </TableCell>
                <TableCell>{result.gf !== null ? result.gf.toFixed(6) : "-"}</TableCell>
                <TableCell>{result.molQty.toFixed(3)}</TableCell>
                <TableCell className="text-right">
                  {weightPercents[index] ? weightPercents[index].toFixed(3) : "0.000"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell className="font-medium">Total</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>{totalWeight.toFixed(3)}</TableCell>
              <TableCell className="text-right font-semibold">
                {desiredBatch.toFixed(3)}
              </TableCell>
            </TableRow>
          </TableBody>
          <TableCaption>
            Product calculation with Gravimetric Factors applied from precursors.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BatchProductTable;
