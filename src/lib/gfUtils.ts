// Utility functions for gravimetric factor calculations

/**
 * 1. Gravimetric Factor (GF) Calculation
 * Calculates the gravimetric factor from precursor to product
 */
export function calculateGravimetricFactor(
  precursorMW: number,
  precursorMoles: number,
  productMW: number,
  productMoles: number
): number {
  return (precursorMW * precursorMoles) / (productMW * productMoles);
}

/**
 * 2. Adjusted Component Weight with GF
 * Calculates the component weight with gravimetric factor applied
 */
export function calculateComponentWeight(
  matrix: number,
  componentMW: number,
  gf: number
): number {
  return (gf * matrix * componentMW) / 1000;
}

/**
 * 3. Total Sample Weight (T) Including GF
 * Calculates the total weight of all components with GF applied
 */
export function calculateTotalWeightWithGF(
  components: Array<{ matrix: number; molecularWeight: number; gf: number }>
): number {
  return components.reduce(
    (total, comp) => total + calculateComponentWeight(comp.matrix, comp.molecularWeight, comp.gf),
    0
  );
}

/**
 * 4. Adjusted Weights for Desired Batch
 * Calculates the weight of each component in the desired batch
 */
export function calculateBatchWeights(
  components: Array<{ precursor: string; matrix: number; molecularWeight: number; gf: number }>,
  totalWeight: number,
  desiredBatch: number
): Array<{ precursor: string; weight: number }> {
  return components.map(comp => ({
    precursor: comp.precursor,
    weight: (calculateComponentWeight(comp.matrix, comp.molecularWeight, comp.gf) / totalWeight) * desiredBatch
  }));
}
