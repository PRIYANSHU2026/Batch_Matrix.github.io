// Data types for atomic mass info
export interface AtomicMass {
  Symbol: string;
  "Atomic Mass": number;
  Element?: string; // add element name for suggestions
  "Atomic Number"?: number;
}

// Data type for an entered component
export interface ComponentItem {
  formula: string;         // Precursor formula
  matrix: number;          // mol %
  mw: number;              // Precursor MW
  productFormula: string;  // Product formula (can be same as precursor)
  productMW: number;       // Product MW
  precursorMoles: number;  // Number of moles of precursor
  productMoles: number;    // Number of moles of product
  gf: number | null;       // Calculated GF for this precursor-product pair
}

// Component result with additional calculated properties
export interface ComponentResult extends ComponentItem {
  molQty: number;
  weightPercent?: number;
  productMolQty?: number; // For product calculations
}

// Chart data types
export interface ElementComposition {
  element: string;
  percentage: number;
  color?: string;
}

export interface Plot3DPoint {
  x: number;
  y: number;
  z: number;
  label?: string;
  size?: number;
  color?: string;
}
