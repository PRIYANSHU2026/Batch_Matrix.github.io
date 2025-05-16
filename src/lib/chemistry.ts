import type { AtomicMass } from "@/types";

// Utility: parse chemical formula (e.g. La2O3, CaO)
export function parseFormula(formula: string): [string, number][] {
  const regex = /([A-Z][a-z]*)(\d*)/g;
  const elements: [string, number][] = [];

  // Using String.matchAll() to avoid assignment in loop condition
  const matches = Array.from(formula.matchAll(regex));
  for (const match of matches) {
    const el = match[1];
    const count = match[2] ? Number.parseInt(match[2]) : 1;
    elements.push([el, count]);
  }

  return elements;
}

// Calculate molecular weight given formula, lookup table
export function molecularWeight(formula: string, atomics: AtomicMass[]): number | null {
  const items = parseFormula(formula);
  let total = 0;

  for (const [el, count] of items) {
    const found = atomics.find((a) => a.Symbol === el);
    if (!found) return null;
    total += found["Atomic Mass"] * count;
  }

  return total;
}

// Calculate gravimetric factor (GF)
export function calculateGF(
  precursorFormula: string,
  productFormula: string,
  precursorMoles: number,
  productMoles: number,
  atomics: AtomicMass[]
): number | null {
  const pMW = molecularWeight(precursorFormula, atomics);
  const prMW = molecularWeight(productFormula, atomics);

  if (!pMW || !prMW) {
    return null;
  }

  // Use the corrected formula for GF calculation
  return (pMW * precursorMoles) / (prMW * productMoles);
}

// Extract individual elements from a compound with their quantities
export function extractElements(formula: string, atomics: AtomicMass[]): { element: string; count: number }[] {
  const parsed = parseFormula(formula);
  return parsed.map(([symbol, count]) => {
    const element = atomics.find(a => a.Symbol === symbol);
    return {
      element: element?.Element || symbol,
      count
    };
  });
}

// Generate colors for elements (for charts)
export function getElementColor(element: string): string {
  // Map of common elements to distinct colors
  const colorMap: Record<string, string> = {
    O: "#ff5a5a",   // Red for Oxygen
    H: "#3498db",   // Blue for Hydrogen
    C: "#2ecc71",   // Green for Carbon
    N: "#9b59b6",   // Purple for Nitrogen
    Si: "#e67e22",  // Orange for Silicon
    Al: "#f1c40f",  // Yellow for Aluminum
    Ca: "#1abc9c",  // Turquoise for Calcium
    Na: "#34495e",  // Dark Blue for Sodium
    K: "#8e44ad",   // Purple for Potassium
    Mg: "#d35400",  // Orange for Magnesium
    Fe: "#7f8c8d",  // Gray for Iron
    B: "#16a085",   // Green for Boron
    La: "#2980b9",  // Blue for Lanthanum
  };

  return colorMap[element] || `hsl(${Math.random() * 360}, 70%, 50%)`;
}

/**
 * Calculate total weight of the batch based on new formula
 * Formula: (Matrix * Molecular Weight * Moles) / 1000 for each component, summed
 */
export function calculateTotalBatchWeight(
  components: { matrix: number; mw: number; formula?: string }[],
  productMolesMap?: Map<string, number>
) {
  return components.reduce((total, comp) => {
    // Default to 1 if no moles mapping provided
    const moles = comp.formula && productMolesMap?.get(comp.formula) || 1;
    return total + (comp.matrix * comp.mw * moles) / 1000;
  }, 0);
}

/**
 * Calculate individual weights for desired batch size
 * Formula: (Matrix * Molecular Weight * Moles / 1000) / Total Weight * Desired Batch Weight
 */
export function calculateAdjustedBatchWeights(
  components: { formula: string; matrix: number; mw: number }[],
  totalWeight: number,
  desiredBatch: number,
  productMolesMap?: Map<string, number>
) {
  return components.map(comp => {
    const moles = productMolesMap?.get(comp.formula) || 1;
    return {
      formula: comp.formula,
      weight: ((comp.matrix * comp.mw * moles) / 1000 / totalWeight) * desiredBatch
    };
  });
}

/**
 * Calculate mass percentage of an element in a compound
 */
export function calculateMassPercent(elementCount: number, elementAtomicWeight: number, compoundMolecularWeight: number) {
  return ((elementCount * elementAtomicWeight) / compoundMolecularWeight) * 100;
}
