"use client";

import type { FC, ChangeEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBatch } from '@/contexts/BatchContext';
import ElementAutoSuggest from './ElementAutoSuggest';
import { molecularWeight } from '@/lib/chemistry';

interface ComponentCardProps {
  index: number;
  formula: string;
  matrix: number;
  mw: number;
  productFormula: string;
  productMW: number;
  precursorMoles: number;
  productMoles: number;
  gf: number | null;
  onChange: (field: 'formula' | 'matrix' | 'productFormula' | 'precursorMoles' | 'productMoles') =>
    (val: string | number | { target: { value: string } }) => void;
}

// Individual precursor card
const ComponentCard: FC<ComponentCardProps> = ({
  index,
  formula,
  matrix,
  mw,
  productFormula,
  productMW,
  precursorMoles,
  productMoles,
  gf,
  onChange
}) => {
  const { atomics } = useBatch();

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-blue-100 dark:border-blue-900 shadow-lg shadow-blue-500/5">
      <CardContent className="pt-4 pb-2 px-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Precursor {index+1}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            MW: {mw ? mw.toFixed(3) : "-"}
          </span>
        </div>

        <div className="space-y-3">
          {/* Precursor Formula */}
          <div className="w-full">
            <ElementAutoSuggest
              value={formula}
              onChange={onChange('formula')}
              atomics={atomics}
              inputProps={{
                placeholder: "Precursor Formula (e.g. CaO)",
                className: "w-full"
              }}
            />
          </div>

          {/* Matrix % */}
          <div className="w-full">
            <Input
              type="number"
              placeholder="Matrix (%)"
              value={matrix || ''}
              min={0}
              max={100}
              step={0.01}
              onChange={onChange('matrix')}
              className="w-full"
            />
          </div>

          {/* Product Formula - hidden but maintained in state */}
          <input
            type="hidden"
            value={productFormula || formula}
            onChange={onChange('productFormula')}
          />

          {/* Precursor/Product Moles - hidden but maintained in state */}
          <input
            type="hidden"
            value={precursorMoles || 1}
            onChange={onChange('precursorMoles')}
          />

          <input
            type="hidden"
            value={productMoles || 1}
            onChange={onChange('productMoles')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Main batch input form
const BatchInputForm: FC = () => {
  const {
    components,
    numComponents,
    desiredBatch,
    handleComponentChange,
    setNumComponents,
    setDesiredBatch,
    warning
  } = useBatch();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="num-components">Number of Precursors</Label>
        <Input
          id="num-components"
          type="number"
          min={1}
          max={10}
          value={numComponents}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNumComponents(Number(e.target.value))}
          className="w-full md:w-48"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {components.map((comp, i) => (
          <ComponentCard
            // Using formula and index as key since formula might not be unique
            key={`comp-${comp.formula || 'empty'}-${i}`}
            index={i}
            formula={comp.formula}
            matrix={comp.matrix}
            mw={comp.mw}
            productFormula={comp.productFormula}
            productMW={comp.productMW}
            precursorMoles={comp.precursorMoles}
            productMoles={comp.productMoles}
            gf={comp.gf}
            onChange={field => handleComponentChange(i, field)}
          />
        ))}
      </div>

      <div className="flex flex-col space-y-2">
        <Label htmlFor="desired-batch">Desired Batch Weight (g)</Label>
        <Input
          id="desired-batch"
          type="number"
          min={0.1}
          max={10000}
          value={desiredBatch}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDesiredBatch(Number(e.target.value))}
          className="w-full md:w-48"
        />
      </div>

      {warning && (
        <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          <span className="text-amber-600 dark:text-amber-400 mr-1.5">⚠</span>
          {warning}
        </div>
      )}
    </div>
  );
};

export default BatchInputForm;
