"use client";

import type { FC } from 'react';
import { useBatch } from '@/contexts/BatchContext';
import BatchInputForm from '@/components/forms/BatchInputForm';
import BatchProductForm from '@/components/forms/BatchProductForm';
import BatchResultTable from '@/components/ui/BatchResultTable';
import BatchProductsResultTable from '@/components/ui/BatchProductsResultTable';
import VisualizationSection from '@/components/chart/VisualizationSection';

const BatchCalculator: FC = () => {
  const {
    compResults,
    weightPercents,
    totalWeight,
    desiredBatch,
    gfResults,
    gfWeightPercents,
    gfTotalWeight,
    productResults,
    productWeightPercents,
    productTotalWeight,
    products
  } = useBatch();

  // Check if any products have valid GF values
  const hasProductsWithGF = products.some(p => p.formula && p.gf !== null);
  const hasValidProducts = productResults.some(prod => prod.formula && prod.molQty > 0);

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <header className="mb-8 text-center">
        <div className="inline-block mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
          Glass Manufacturing Tools
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tighter mb-2 text-blue-900 dark:text-blue-100">
          Batch Matrix Composition Calculator
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Calculate and visualize chemical compositions for glass batches with automatic molar calculations
          and advanced gravimetric factor adjustments.
        </p>
      </header>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Batch Precursors</h2>
        <BatchInputForm />
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Batch Products</h2>
        <BatchProductForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <BatchResultTable
          results={compResults}
          weightPercents={weightPercents}
          totalWeight={totalWeight}
          desiredBatch={desiredBatch}
          title="Precursor Matrix Calculation"
          description="(MW × Precursor Moles × Matrix)/1000 = Mol Qty. Each Mol Qty/Net wt = Batch wt (g)"
        />

        {hasProductsWithGF && (
          <BatchResultTable
            results={gfResults}
            weightPercents={gfWeightPercents}
            totalWeight={gfTotalWeight}
            desiredBatch={desiredBatch}
            title="GF-Adjusted Precursor Matrix"
            description="(MW × Product Moles × Matrix)/1000 = Mol Qty. Each Mol Qty/Net wt = Batch wt (g)"
            showGF={true}
          />
        )}
      </div>

      {hasValidProducts && (
        <div className="mb-12">
          <BatchProductsResultTable
            results={productResults}
            weightPercents={productWeightPercents}
            totalWeight={productTotalWeight}
            desiredBatch={desiredBatch}
            title="Product Calculation Results"
            description="Calculated product weights with gravimetric factors applied"
          />
        </div>
      )}

      <div className="mb-12">
        <VisualizationSection />
      </div>
    </div>
  );
};

export default BatchCalculator;
