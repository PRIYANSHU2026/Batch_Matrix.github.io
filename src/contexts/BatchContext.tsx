"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AtomicMass, ComponentItem, ComponentResult, ElementComposition, ProductItem, ProductResult } from '@/types';
import { molecularWeight, calculateGF, extractElements, getElementColor, calculateTotalBatchWeight, calculateAdjustedBatchWeights } from '@/lib/chemistry';
import { calculateGravimetricFactor, calculateComponentWeight, calculateTotalWeightWithGF, calculateBatchWeights } from '@/lib/gfUtils';
import { calculateMolecularWeight, calculateMassPercent, calculateTotalWeight, calculateAdjustedWeights, formulaToElementsArray } from '@/lib/batchCalculations';

interface BatchContextType {
  // Data
  atomics: AtomicMass[];
  components: ComponentItem[];
  products: ProductItem[];

  // Component inputs
  numComponents: number;
  numProducts: number;
  desiredBatch: number;

  // GF Calculator
  precursorFormula: string;
  precursorMoles: number;
  productFormula: string;
  productMoles: number;
  gf: number | null;

  // Results
  compResults: ComponentResult[];
  weightPercents: number[];
  totalWeight: number;
  gfResults: ComponentResult[];
  gfWeightPercents: number[];
  gfTotalWeight: number;
  productResults: ProductResult[];
  productWeightPercents: number[];
  productTotalWeight: number;
  warning: string;

  // Visualization data
  elementComposition: ElementComposition[];

  // Actions
  setNumComponents: (num: number) => void;
  setNumProducts: (num: number) => void;
  setDesiredBatch: (weight: number) => void;
  handleComponentChange: (i: number, field: "formula" | "matrix") => (val: string | number | { target: { value: string } }) => void;
  handleProductChange: (i: number, field: "formula" | "precursorFormula" | "precursorMoles" | "productMoles") => (val: string | number | { target: { value: string } }) => void;
  setPrecursorFormula: (formula: string) => void;
  setPrecursorMoles: (moles: number) => void;
  setProductFormula: (formula: string) => void;
  setProductMoles: (moles: number) => void;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

export function BatchProvider({ children }: { children: ReactNode }) {
  // Load atomic mass table from public dir
  const [atomics, setAtomics] = useState<AtomicMass[]>([]);

  // Component inputs
  const [components, setComponents] = useState<ComponentItem[]>([
    { formula: "CaO", matrix: 30, mw: 0 },
    { formula: "La2O3", matrix: 10, mw: 0 },
    { formula: "H3BO3", matrix: 60, mw: 0 }
  ]);
  const [numComponents, setNumComponents] = useState<number>(3);
  const [desiredBatch, setDesiredBatch] = useState<number>(5);

  // Product inputs
  const [products, setProducts] = useState<ProductItem[]>([
    {
      formula: "B2O3",
      mw: 0,
      gf: null,
      precursorFormula: "H3BO3",
      precursorMoles: 2,
      productMoles: 1
    },
    {
      formula: "La2O3",
      mw: 0,
      gf: null,
      precursorFormula: "La2O3",
      precursorMoles: 1,
      productMoles: 1
    }
  ]);
  const [numProducts, setNumProducts] = useState<number>(2);

  // GF Section
  const [precursorFormula, setPrecursorFormula] = useState("H3BO3");
  const [precursorMoles, setPrecursorMoles] = useState<number>(2);
  const [productFormula, setProductFormula] = useState("B2O3");
  const [productMoles, setProductMoles] = useState<number>(1);
  const [gf, setGf] = useState<number | null>(null);

  // Warning messages
  const [warning, setWarning] = useState<string>("");

  // Load CSV with atomic mass
  useEffect(() => {
    fetch("/Periodic_Table.csv")
      .then((res) => res.text())
      .then((txt) => {
        const lines = txt.trim().split("\n").slice(1); // skip header
        const arr: AtomicMass[] = lines.map((l) => {
          const parts = l.split(",");
          return {
            Symbol: parts[2],
            "Atomic Mass": Number(parts[3]),
            Element: parts[1],
            "Atomic Number": Number(parts[0])
          };
        });
        setAtomics(arr);
      });
  }, []);

  // For default MWs, recalculate after atomics loaded
  useEffect(() => {
    setComponents((prev) =>
      prev.map((c) => ({
        ...c,
        mw: atomics.length ? molecularWeight(c.formula, atomics) || 0 : 0
      }))
    );

    // Also update product MWs
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        mw: atomics.length ? molecularWeight(p.formula, atomics) || 0 : 0
      }))
    );
  }, [atomics]);

  // Add/remove component inputs based on user selection
  useEffect(() => {
    setComponents((prev) => {
      if (numComponents > prev.length) {
        return [
          ...prev,
          ...Array(numComponents - prev.length)
            .fill(null)
            .map(() => ({ formula: "", matrix: 0, mw: 0 })),
        ];
      }
      return prev.slice(0, numComponents);
    });

    // Automatically update number of products to match number of precursors
    setNumProducts(numComponents);
  }, [numComponents]);

  // Add/remove product inputs based on user selection or component changes
  useEffect(() => {
    setProducts((prev) => {
      // Make a copy of previous products
      let updatedProducts = [...prev];

      // If numProducts changed, adjust the array length
      if (numProducts > prev.length) {
        updatedProducts = [
          ...prev,
          ...Array(numProducts - prev.length)
            .fill(null)
            .map(() => ({
              formula: "",
              mw: 0,
              gf: null,
              precursorFormula: "",
              precursorMoles: 1,
              productMoles: 1
            })),
        ];
      } else if (numProducts < prev.length) {
        updatedProducts = prev.slice(0, numProducts);
      }

      // Update precursor formulas based on components
      updatedProducts = updatedProducts.map((prod, index) => {
        if (index < components.length && components[index].formula) {
          // If there's a corresponding component, use its formula as the precursor formula
          if (
            !prod.precursorFormula ||
            !components.some(c => c.formula === prod.precursorFormula)
          ) {
            return {
              ...prod,
              precursorFormula: components[index].formula
            };
          }
        }
        return prod;
      });

      return updatedProducts;
    });
  }, [numProducts, components]);

  // Handler for component input changes
  const handleComponentChange = (i: number, field: "formula" | "matrix") => (
    val: string | number | { target: { value: string } }
  ) => {
    // Handle event objects (from input fields)
    let value: string | number;
    if (val && typeof val === 'object' && 'target' in val && val.target) {
      value = field === "matrix" ? Number(val.target.value) : val.target.value;
    } else {
      value = val as string | number;
    }

    setComponents((prev) => {
      const updated = [...prev];

      // recalculate mw if formula
      if (field === "formula") {
        const mw = molecularWeight(value as string, atomics) || 0;
        updated[i] = { ...updated[i], formula: value as string, mw };

        // Also update the corresponding product's precursor formula
        if (i < products.length) {
          setProducts(prevProducts => {
            const updatedProducts = [...prevProducts];
            updatedProducts[i] = {
              ...updatedProducts[i],
              precursorFormula: value as string
            };
            return updatedProducts;
          });
        }
      } else {
        updated[i] = { ...updated[i], matrix: value as number };
      }

      return updated;
    });
  };

  // Handler for product input changes
  const handleProductChange = (
    i: number,
    field: "formula" | "precursorFormula" | "precursorMoles" | "productMoles"
  ) => (
    val: string | number | { target: { value: string } }
  ) => {
    // Handle event objects (from input fields)
    let value: string | number;
    if (val && typeof val === 'object' && 'target' in val && val.target) {
      value = (field === "precursorMoles" || field === "productMoles")
        ? Number(val.target.value)
        : val.target.value;
    } else {
      value = val as string | number;
    }

    setProducts((prev) => {
      const updated = [...prev];

      if (field === "formula") {
        const mw = molecularWeight(value as string, atomics) || 0;
        updated[i] = { ...updated[i], formula: value as string, mw };
      } else if (field === "precursorFormula") {
        updated[i] = { ...updated[i], precursorFormula: value as string };
      } else if (field === "precursorMoles") {
        updated[i] = { ...updated[i], precursorMoles: value as number };
      } else if (field === "productMoles") {
        updated[i] = { ...updated[i], productMoles: value as number };
      }

      // Calculate GF for this product if all values are present
      if (updated[i].precursorFormula && updated[i].formula) {
        const calculatedGF = calculateGF(
          updated[i].precursorFormula,
          updated[i].formula,
          updated[i].precursorMoles,
          updated[i].productMoles,
          atomics
        );
        updated[i] = { ...updated[i], gf: calculatedGF };
      }

      return updated;
    });
  };

  // Matrix normalization
  const totalMatrix = components.reduce((acc, item) => acc + (Number(item.matrix) || 0), 0);
  useEffect(() => {
    if (Math.abs(totalMatrix - 100) > 0.001 && totalMatrix > 0) {
      setWarning("Matrix values do not sum to 100%. They will be normalized (rescaled).");

      setComponents((prev) => {
        const factor = 100 / totalMatrix;
        return prev.map((c) => ({ ...c, matrix: c.matrix * factor }));
      });
    } else {
      setWarning("");
    }
  }, [totalMatrix]);

  // GF calculation
  useEffect(() => {
    if (!atomics.length) return;

    const calculatedGF = calculateGF(
      precursorFormula,
      productFormula,
      precursorMoles,
      productMoles,
      atomics
    );

    setGf(calculatedGF);
  }, [precursorFormula, productFormula, precursorMoles, productMoles, atomics]);

  // Create a map of precursor formulas to their mole ratios
  const precursorMolesMap = new Map<string, number>();
  products.forEach(p => {
    if (p.precursorFormula) {
      precursorMolesMap.set(p.precursorFormula, p.precursorMoles);
    }
  });

  // Batch table calculations
  // Calculate using the new formula: (Matrix * Molecular Weight * Precursor Moles) / 1000
  const compResults = components.map((c) => {
    // Find matching product for this precursor to get the mole ratio
    const precursorMoles = precursorMolesMap.get(c.formula) || 1; // Default to 1 if no matching product

    return {
      ...c,
      molQty: (c.matrix * c.mw * precursorMoles) / 1000, // Updated formula: (Matrix * MW * Precursor Moles) / 1000
    };
  });

  // Calculate total weight using the new function with moles
  const totalWeight = calculateTotalBatchWeight(components, precursorMolesMap);

  // Calculate weight percentages using the adjusted weights function with moles
  const batchWeights = calculateAdjustedBatchWeights(components, totalWeight, desiredBatch, precursorMolesMap);
  const weightPercents = batchWeights.map(item => item.weight);

  // Calculate product results with GF
  const productResults = products.map((p) => {
    // If this product has a corresponding precursor in the components, use that matrix value
    const precursorComp = components.find(c => c.formula === p.precursorFormula);
    const precursorMatrix = precursorComp ? precursorComp.matrix : 0;

    // Calculate the effective molecular weight with GF applied
    const effectiveMW = p.gf !== null && p.productMoles > 0 && p.precursorMoles > 0
      ? p.mw * p.gf
      : p.mw;

    // Apply GF to the calculation using the updated formula without product moles
    return {
      ...p,
      molQty: (precursorMatrix * effectiveMW) / 1000, // Updated formula: (Matrix * MW_adjusted) / 1000
    };
  });

  // Calculate product total weight and adjusted weights
  const productTotalWeight = productResults.reduce((sum, p) => sum + p.molQty, 0);

  // Create a map of product formulas to their mole values
  const productMolesMap = new Map<string, number>();
  products.forEach(p => {
    if (p.formula) {
      productMolesMap.set(p.formula, p.productMoles);
    }
  });

  // Create a format for the calculateAdjustedBatchWeights function
  const productComponents = productResults.map(p => ({
    formula: p.formula,
    matrix: components.find(c => c.formula === p.precursorFormula)?.matrix || 0,
    mw: p.gf !== null ? p.mw * p.gf : p.mw
  }));

  // Calculate product weight percentages without using product moles
  const productBatchWeights = calculateAdjustedBatchWeights(
    productComponents,
    productTotalWeight,
    desiredBatch
    // No product moles map passed here
  );
  const productWeightPercents = productBatchWeights.map(item => item.weight);

  // Apply GF to precursors based on products
  let gfResults = compResults;
  let gfWeightPercents = weightPercents;
  let gfTotalWeight = totalWeight;

  // Check if we have any valid products with GF
  const hasValidProductsWithGF = products.some(p =>
    p.formula &&
    p.gf !== null &&
    p.precursorFormula && // Must have a precursor formula
    components.some(c => c.formula === p.precursorFormula) // Must match an existing precursor
  );

  if (hasValidProductsWithGF) {
    // Create a map to store precursor formula -> corresponding product data
    const precursorGfMap = new Map<string, {
      gf: number,
      productFormula: string,
      productMW: number,
      productMoles: number
    }>();

    // Fill the map with products' precursor formulas and their calculated GFs
    products.forEach(p => {
      if (p.precursorFormula && p.formula && p.gf !== null) {
        // Only include if the precursor formula exists in the components
        if (components.some(c => c.formula === p.precursorFormula)) {
          precursorGfMap.set(p.precursorFormula, {
            gf: p.gf,
            productFormula: p.formula,
            productMW: p.mw,
            productMoles: p.productMoles
          });
        }
      }
    });

    // Format components for GF calculation using product MW directly (without moles)
    const componentsWithGF = components.map(c => {
      const productInfo = precursorGfMap.get(c.formula);
      return {
        precursor: c.formula,
        matrix: c.matrix,
        molecularWeight: productInfo?.productMW || c.mw, // Use product MW if available
        gf: 1 // Set GF to 1 as we're using product MW directly, not applying GF
      };
    });

    // Calculate total weight with GF using the new function
    gfTotalWeight = calculateTotalWeightWithGF(componentsWithGF);

    // Calculate batch weights with the new function
    const newGfBatchWeights = calculateBatchWeights(componentsWithGF, gfTotalWeight, desiredBatch);

    // Update gfWeightPercents
    gfWeightPercents = newGfBatchWeights.map(item => item.weight);

    // Apply the GF to all precursors that have matching products for display
    gfResults = compResults.map(c => {
      const productInfo = precursorGfMap.get(c.formula);
      const matchingGfWeight = newGfBatchWeights.find(item => item.precursor === c.formula);

      if (productInfo !== undefined) {
        // Use product MW directly, without considering precursor moles
        return {
          ...c,
          mw: productInfo.productMW, // Use product MW directly
          molQty: (c.matrix * productInfo.productMW) / 1000, // Use only product MW, without precursor moles
          productFormula: productInfo.productFormula, // Store the product formula for display
          adjustedWeight: matchingGfWeight?.weight || 0
        };
      }

      // No matching product with GF, keep the precursor as is
      return c;
    });
  }

  // Generate element composition data for charts
  const generateCompositionData = () => {
    const elementMap = new Map<string, number>();

    // Extract elements from all compounds and sum their total contribution
    for (const comp of components) {
      if (!comp.formula || !comp.matrix) continue;

      const elements = extractElements(comp.formula, atomics);
      for (const { element, count } of elements) {
        const current = elementMap.get(element) || 0;
        elementMap.set(element, current + (count * comp.matrix));
      }
    }

    // Convert to percentage
    const total = Array.from(elementMap.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(elementMap.entries()).map(([element, value]) => ({
      element,
      percentage: (value / total) * 100,
      color: getElementColor(element)
    }));
  };

  const elementComposition = generateCompositionData();

  const value = {
    // Data
    atomics,
    components,
    products,

    // Component inputs
    numComponents,
    numProducts,
    desiredBatch,

    // GF Calculator
    precursorFormula,
    precursorMoles,
    productFormula,
    productMoles,
    gf,

    // Results
    compResults,
    weightPercents,
    totalWeight,
    gfResults,
    gfWeightPercents,
    gfTotalWeight,
    productResults,
    productWeightPercents,
    productTotalWeight,
    warning,

    // Visualization data
    elementComposition,

    // Actions
    setNumComponents,
    setNumProducts,
    setDesiredBatch,
    handleComponentChange,
    handleProductChange,
    setPrecursorFormula,
    setPrecursorMoles,
    setProductFormula,
    setProductMoles,
  };

  return <BatchContext.Provider value={value}>{children}</BatchContext.Provider>;
}

export function useBatch() {
  const context = useContext(BatchContext);
  if (context === undefined) {
    throw new Error('useBatch must be used within a BatchProvider');
  }
  return context;
}
