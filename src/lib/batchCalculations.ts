import type { AtomicMass } from "@/types";

/**
 * 1. Molecular Weight Calculation for a compound
 * Calculates molecular weight from an array of elements with their counts and atomic weights
 */
export function calculateMolecularWeight(elements: Array<{ count: number; atomicWeight: number }>): number {
  return elements.reduce((sum, element) =>
    sum + (element.count * element.atomicWeight), 0);
}

/**
 * 2. Mass Percentage of an Atom in a Compound
 * Calculate the mass percentage of an element in a compound
 */
export function calculateMassPercent(
  elementCount: number,
  elementAtomicWeight: number,
  compoundMolecularWeight: number
): number {
  return ((elementCount * elementAtomicWeight) / compoundMolecularWeight) * 100;
}

/**
 * 3. Batch Matrix Calculations
 * Calculate total weight of the batch (T)
 */
export function calculateTotalWeight(
  components: Array<{ matrix: number; molecularWeight: number; precursorMoles: number }>
): number {
  return components.reduce((total, comp) =>
    total + (comp.matrix * comp.molecularWeight * comp.precursorMoles) / 1000, 0);
}

/**
 * 4. Calculate individual weights for desired batch (H grams)
 */
export function calculateAdjustedWeights(
  components: Array<{ formula: string; matrix: number; molecularWeight: number; precursorMoles: number }>,
  totalWeight: number,
  desiredBatch: number
): Array<{ formula: string; weight: number }> {
  return components.map(comp => ({
    formula: comp.formula,
    weight: ((comp.matrix * comp.molecularWeight * comp.precursorMoles) / 1000 / totalWeight) * desiredBatch
  }));
}

/**
 * Helper function to convert chemical formula and atomics data to the element array format
 * needed by calculateMolecularWeight
 */
export function formulaToElementsArray(formula: string, atomics: AtomicMass[]): Array<{ count: number; atomicWeight: number }> | null {
  // Regular expression to match element symbols and their counts
  const regex = /([A-Z][a-z]*)(\d*)/g;
  const elements: Array<{ count: number; atomicWeight: number }> = [];

  // Find all matches
  const matches = Array.from(formula.matchAll(regex));
  for (const match of matches) {
    const symbol = match[1];
    const count = match[2] ? Number.parseInt(match[2]) : 1;

    // Find the atomic weight for this element
    const element = atomics.find(a => a.Symbol === symbol);
    if (!element) return null; // Element not found

    elements.push({
      count,
      atomicWeight: element["Atomic Mass"]
    });
  }

  return elements;
}
