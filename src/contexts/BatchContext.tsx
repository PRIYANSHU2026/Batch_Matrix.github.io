"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AtomicMass, ComponentItem, ComponentResult, ElementComposition, ProductItem, ProductResult } from '@/types';
import { molecularWeight, calculateGF, extractElements, getElementColor } from '@/lib/chemistry';

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
  }, [numComponents]);

  // Add/remove product inputs based on user selection
  useEffect(() => {
    setProducts((prev) => {
      if (numProducts > prev.length) {
        return [
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
      }
      return prev.slice(0, numProducts);
    });
  }, [numProducts]);

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

  // Batch table calculations
  // Calculate moles for each component based on matrix percentage
  const compResults = components.map((c) => {
    // First determine the number of moles from the matrix percentage
    const moles = c.matrix / 100; // Convert percentage to a decimal fraction

    // Now calculate molQty as moles * molecular weight according to the corrected formula
    return {
      ...c,
      molQty: moles * c.mw, // Number of moles multiplied with Mole weight of precursor
    };
  });

  const totalWeight = compResults.reduce((sum, c) => sum + c.molQty, 0);
  const weightPercents = compResults.map((c) =>
    (totalWeight > 0 ? (c.molQty / totalWeight) * desiredBatch : 0)
  );

  // Calculate product results with GF
  const productResults = products.map((p) => {
    // If this product has a corresponding precursor in the components, use that matrix value
    const precursorComp = components.find(c => c.formula === p.precursorFormula);
    const moles = precursorComp ? precursorComp.matrix / 100 : 0;

    // Apply GF to the calculation if available
    const effectiveMW = p.gf !== null ? p.mw * p.gf : p.mw;

    return {
      ...p,
      molQty: moles * effectiveMW, // Applying GF to the molecular weight
    };
  });

  const productTotalWeight = productResults.reduce((sum, p) => sum + p.molQty, 0);
  const productWeightPercents = productResults.map((p) =>
    (productTotalWeight > 0 ? (p.molQty / productTotalWeight) * desiredBatch : 0)
  );

  // Apply GF to H3BO3 if in list
  let gfResults = compResults;
  let gfWeightPercents = weightPercents;
  let gfTotalWeight = totalWeight;

  if (gf !== null && compResults.find((c) => c.formula === "H3BO3")) {
    gfResults = compResults.map((c) =>
      c.formula === "H3BO3"
        ? {
            ...c,
            mw: c.mw * gf, // Apply GF directly to the molecular weight of the precursor
            molQty: (c.matrix / 100) * (c.mw * gf) // Calculate using: moles * (Mole weight of precursor × GF)
          }
        : c
    );

    gfTotalWeight = gfResults.reduce((sum, c) => sum + c.molQty, 0);
    gfWeightPercents = gfResults.map((c) =>
      (gfTotalWeight > 0 ? (c.molQty / gfTotalWeight) * desiredBatch : 0)
    );
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
