"use client";

import type { FC, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBatch } from '@/contexts/BatchContext';
import ElementAutoSuggest from './ElementAutoSuggest';
import { molecularWeight } from '@/lib/chemistry';

interface ProductCardProps {
  index: number;
  formula: string;
  precursorFormula: string;
  precursorMoles: number;
  productMoles: number;
  mw: number;
  gf: number | null;
  onChange: (field: 'formula' | 'precursorFormula' | 'precursorMoles' | 'productMoles') =>
    (val: string | number | { target: { value: string } }) => void;
}

// Individual product card with GF calculator
const ProductCard: FC<ProductCardProps> = ({
  index,
  formula,
  precursorFormula,
  precursorMoles,
  productMoles,
  mw,
  gf,
  onChange
}) => {
  const { atomics } = useBatch();

  const precursorMW = molecularWeight(precursorFormula, atomics);
  const productMW = molecularWeight(formula, atomics);

  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-green-100 dark:border-green-900 shadow-lg shadow-green-500/5">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-green-800 dark:text-green-300">Product {index+1}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            MW: {mw ? mw.toFixed(3) : "-"}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="w-full">
            <ElementAutoSuggest
              value={formula}
              onChange={onChange('formula')}
              atomics={atomics}
              inputProps={{
                placeholder: "Product Formula (e.g. B2O3)",
                className: "w-full"
              }}
            />
          </div>
        </div>

        <div className="border-t pt-3 mt-2">
          <p className="text-sm font-medium mb-2 text-green-700 dark:text-green-400">Gravimetric Factor Calculator</p>

          {/* Precursor Formula */}
          <div className="mb-2">
            <Label htmlFor={`precursor-formula-${index}`} className="text-xs mb-1 block">
              Precursor Formula
            </Label>
            <ElementAutoSuggest
              value={precursorFormula}
              onChange={onChange('precursorFormula')}
              atomics={atomics}
              inputProps={{
                id: `precursor-formula-${index}`,
                placeholder: "e.g. H3BO3",
                className: "w-full text-sm"
              }}
            />
            <div className="text-xs mt-1 text-gray-500">
              MW: {precursorMW?.toFixed(4) || "-"}
            </div>
          </div>

          {/* Precursor Moles */}
          <div className="mb-2">
            <Label htmlFor={`precursor-moles-${index}`} className="text-xs mb-1 block">
              Precursor Moles
            </Label>
            <Input
              id={`precursor-moles-${index}`}
              type="number"
              min={1}
              value={precursorMoles}
              onChange={onChange('precursorMoles')}
              className="text-sm"
            />
          </div>

          {/* Product Moles */}
          <div className="mb-2">
            <Label htmlFor={`product-moles-${index}`} className="text-xs mb-1 block">
              Product Moles
            </Label>
            <Input
              id={`product-moles-${index}`}
              type="number"
              min={1}
              value={productMoles}
              onChange={onChange('productMoles')}
              className="text-sm"
            />
            <div className="text-xs mt-1 text-gray-500">
              MW: {productMW?.toFixed(4) || "-"}
            </div>
          </div>

          {/* GF Result */}
          <div className="mt-3 pt-2 border-t border-green-100 dark:border-green-900">
            <div className="flex justify-between items-center">
              <div className="text-xs font-medium">Gravimetric Factor:</div>
              <div className="text-base font-semibold text-green-700 dark:text-green-300 font-mono">
                {gf !== null ? gf.toFixed(6) : "—"}
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Applied as: Adjusted MW = Mole weight of precursor × GF
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main batch product form
const BatchProductForm: FC = () => {
  const {
    products,
    numProducts,
    handleProductChange,
    setNumProducts,
  } = useBatch();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="num-products">Number of Products</Label>
        <Input
          id="num-products"
          type="number"
          min={1}
          max={10}
          value={numProducts}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNumProducts(Number(e.target.value))}
          className="w-full md:w-48"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {products.map((product, i) => (
          <ProductCard
            key={`product-${product.formula || 'empty'}-${i}`}
            index={i}
            formula={product.formula}
            precursorFormula={product.precursorFormula}
            precursorMoles={product.precursorMoles}
            productMoles={product.productMoles}
            mw={product.mw}
            gf={product.gf}
            onChange={field => handleProductChange(i, field)}
          />
        ))}
      </div>
    </div>
  );
};

export default BatchProductForm;
