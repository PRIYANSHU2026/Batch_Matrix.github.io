"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AtomicMass, ComponentItem, ComponentResult, ElementComposition } from '@/types';
import { molecularWeight, calculateGF, extractElements, getElementColor } from '@/lib/chemistry';

interface BatchContextType {
  // Data
  atomics: AtomicMass[];
  components: ComponentItem[];

  // Component inputs
  numComponents: number;
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
  warning: string;

  // Visualization data
  elementComposition: ElementComposition[];

  // Actions
  setNumComponents: (num: number) => void;
  setDesiredBatch: (weight: number) => void;
  handleComponentChange: (i: number, field: "formula" | "matrix") => (val: string | number | { target: { value: string } }) => void;
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
  const compResults = components.map((c) => ({
    ...c,
    molQty: (c.matrix * c.mw) / 1000,
  }));

  const totalWeight = compResults.reduce((sum, c) => sum + c.molQty, 0);
  const weightPercents = compResults.map((c) =>
    (totalWeight > 0 ? (c.molQty / totalWeight) * desiredBatch : 0)
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
            mw: c.mw * gf,
            molQty: (c.mw * gf * c.matrix) / 1000
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

    // Component inputs
    numComponents,
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
    warning,

    // Visualization data
    elementComposition,

    // Actions
    setNumComponents,
    setDesiredBatch,
    handleComponentChange,
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
