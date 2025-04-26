// Data types for atomic mass info
export interface AtomicMass {
  Symbol: string;
  "Atomic Mass": number;
  Element?: string; // add element name for suggestions
  "Atomic Number"?: number;
}

// Data type for an entered component
export interface ComponentItem {
  formula: string;
  matrix: number; // mol %
  mw: number;
}

// Component result with additional calculated properties
export interface ComponentResult extends ComponentItem {
  molQty: number;
  weightPercent?: number;
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
