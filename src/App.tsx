import type React from "react";
import { useEffect, useState, useRef } from "react";
import "./index.css";

// Data type for atomic mass info
interface AtomicMass {
  Symbol: string;
  "Atomic Mass": number;
  Element?: string; // add element name for suggestions
}

// Data type for an entered component
interface ComponentItem {
  formula: string;
  matrix: number; // mol %
  mw: number;
}

// Utility: parse chemical formula (e.g. La2O3, CaO)
function parseFormula(formula: string): [string, number][] {
  const regex = /([A-Z][a-z]*)(\d*)/g;
  const elements: [string, number][] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(formula)) !== null) {
    const el = match[1];
    const count = match[2] ? Number.parseInt(match[2]) : 1;
    elements.push([el, count]);
  }
  return elements;
}

// Calculate molecular weight given formula, lookup table
function molecularWeight(formula: string, atomics: AtomicMass[]): number | null {
  const items = parseFormula(formula);
  let total = 0;
  for (const [el, count] of items) {
    const found = atomics.find((a) => a.Symbol === el);
    if (!found) return null;
    total += found["Atomic Mass"] * count;
  }
  return total;
}

// Element auto-suggest component
const ElementAutoSuggest: React.FC<{
  value: string,
  onChange: (val: string) => void,
  atomics: AtomicMass[],
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}> = ({ value, onChange, atomics, inputProps }) => {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const val = value || "";
  const trimmed = val.trim();
  const lastToken = trimmed.match(/[A-Z][a-z]*$/)?.[0] ?? "";
  const suggestions = (lastToken.length > 0 && atomics.length > 0)
    ? atomics
        .filter(a =>
          a.Symbol.toLowerCase().includes(lastToken.toLowerCase()) ||
          (a.Element && a.Element.toLowerCase().includes(lastToken.toLowerCase()))
        )
        .slice(0, 14) // max 14
    : [];

  // Handle keyboard navigation in dropdown
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      setHighlight(h => Math.min(h + 1, suggestions.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlight(h => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      pick(highlight);
    }
  };
  const pick = (idx: number) => {
    if (!suggestions[idx]) return;
    // Replace just the last (possibly partial) symbol, not the whole input
    let newVal = val;
    if (lastToken) {
      // Replace lastToken (e.g. "L" in "La2O3")
      newVal = val.replace(/[A-Z][a-z]*$/, suggestions[idx].Symbol);
    } else {
      newVal = suggestions[idx].Symbol;
    }
    onChange(newVal);
    setFocused(false);
    setHighlight(-1);
  };
  // Hide dropdown if unfocused and not over menu
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => setFocused(false), 120); // allow click
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        {...inputProps}
        value={val}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
        onChange={e => { onChange(e.target.value); setHighlight(-1); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {focused && suggestions.length > 0 && (
        <div className="glass-suggest-menu" ref={listRef}>
          {suggestions.map((sug, i) => (
            <div
              key={sug.Symbol}
              className={"glass-suggest-item" + (i === highlight ? " glass-suggest-active" : "")}
              onMouseDown={e => { e.preventDefault(); pick(i); }}
              onMouseEnter={() => setHighlight(i)}
            >
              <b>{sug.Symbol}</b> 4; {sug.Element}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main app
const App: React.FC = () => {
  // Load atomic mass table from public dir (with element name)
  const [atomics, setAtomics] = useState<AtomicMass[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([{
    formula: "CaO", matrix: 30,
    mw: 0
  }, { formula: "La2O3", matrix: 10, mw: 0 }, { formula: "H3BO3", matrix: 60, mw: 0 }]);
  const [numComponents, setNumComponents] = useState<number>(3);
  const [desiredBatch, setDesiredBatch] = useState<number>(5);
  // GF Section
  const [precursorFormula, setPrecursorFormula] = useState("H3BO3");
  const [precursorMoles, setPrecursorMoles] = useState<number>(2);
  const [productFormula, setProductFormula] = useState("B2O3");
  const [productMoles, setProductMoles] = useState<number>(1);
  const [gf, setGf] = useState<number | null>(null);
  // Error/warning
  const [warning, setWarning] = useState<string>("");

  // Load CSV with atomic mass
  useEffect(() => {
    fetch("/Periodic_Table.csv")
      .then((res) => res.text())
      .then((txt) => {
        const lines = txt.trim().split("\n").slice(1); // skip header
        const arr: AtomicMass[] = lines.map((l) => {
          const parts = l.split(",");
          return { Symbol: parts[2], "Atomic Mass": Number(parts[3]), Element: parts[1] };
        });
        setAtomics(arr);
      });
  }, []);

  // For default MWs, recalc after atomics loaded
  useEffect(() => {
    setComponents((prev) =>
      prev.map((c) => ({ ...c, mw: atomics.length ? molecularWeight(c.formula, atomics) || 0 : 0 }))
    );
    // eslint-disable-next-line
  }, [atomics]);

  // Add/remove component inputs based on user selection
  useEffect(() => {
    setComponents((prev) => {
      if (numComponents > prev.length) {
        return [
          ...prev,
          ...Array(numComponents - prev.length).fill(null).map(() => ({ formula: "", matrix: 0, mw: 0 })),
        ];
      }
      return prev.slice(0, numComponents);
    });
  }, [numComponents]);

  // Handler for component input changes
  const handleComponentChange = (i: number, field: "formula" | "matrix") => (val: any) => {
    const value = field === "matrix" ? Number(val.target ? val.target.value : val) : val;
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
      setWarning("Matrix values do not sum to 100%. They will be normalized (rescaled)." );
      setComponents((prev) => {
        const factor = 100 / totalMatrix;
        return prev.map((c) => ({ ...c, matrix: c.matrix * factor }));
      });
    } else {
      setWarning("");
    }
    // eslint-disable-next-line
  }, [totalMatrix]);

  // GF calculation
  useEffect(() => {
    if (!atomics.length) return;
    const pMW = molecularWeight(precursorFormula, atomics);
    const prMW = molecularWeight(productFormula, atomics);
    if (!pMW || !prMW) {
      setGf(null);
    } else {
      setGf((precursorMoles * pMW) / (productMoles * prMW));
    }
  }, [precursorFormula, productFormula, precursorMoles, productMoles, atomics]);

  // Batch table calculations
  const compResults = components.map((c) => ({
    ...c,
    molQty: (c.matrix * c.mw) / 1000,
  }));
  const totalWeight = compResults.reduce((sum, c) => sum + c.molQty, 0);
  const weightPercents = compResults.map((c) => (totalWeight > 0 ? (c.molQty / totalWeight) * desiredBatch : 0));

  // Special: apply GF to H3BO3 if in list
  let gfResults = compResults;
  let gfWeightPercents = weightPercents;
  let gfTotalWeight = totalWeight;
  if (gf !== null && compResults.find((c) => c.formula === "H3BO3")) {
    gfResults = compResults.map((c) =>
      c.formula === "H3BO3"
        ? { ...c, mw: c.mw * gf, molQty: (c.mw * gf * c.matrix) / 1000 }
        : c
    );
    gfTotalWeight = gfResults.reduce((sum, c) => sum + c.molQty, 0);
    gfWeightPercents = gfResults.map((c) => (gfTotalWeight > 0 ? (c.molQty / gfTotalWeight) * desiredBatch : 0));
  }

  // --- Render ---
  return (
    <div className="glass-root">
      <aside className="glass-sidebar">
        <h2>Batch Input</h2>
        <label>Number of Components: <input type="number" min={1} max={10} value={numComponents} onChange={e=>setNumComponents(Number(e.target.value))} /></label>
        {components.map((comp, i) => (
          <div className="glass-comp-card" key={i}>
            <span>Component {i+1}</span>
            <ElementAutoSuggest
              value={comp.formula}
              atomics={atomics}
              onChange={str => handleComponentChange(i,"formula")(str)}
              inputProps={{placeholder:"Formula", style:{width:'100%'}}}
            />
            <input type="number" placeholder="Matrix (%)" value={comp.matrix} min={0} max={100} step={0.01} onChange={handleComponentChange(i,"matrix")} />
            <span className="glass-mw">MW: {comp.mw ? comp.mw.toFixed(3) : "-"}</span>
          </div>
        ))}
        <label>Desired Batch Weight (g): <input type="number" min={0.1} max={10000} value={desiredBatch} onChange={e=>setDesiredBatch(Number(e.target.value))} /></label>
        {warning && <div className="glass-warning">⚠ {warning}</div>}
      </aside>

      {/* ...rest unchanged... */}
      {/* main glass-main and batch logic same as before */}
      <main className="glass-main">
          <header className="glass-title">
            <h1>Glass Manufacturing Batch Composition Calculator</h1>
            <span className="glass-industrial">🧪🔬</span>
          </header>

          <section className="glass-section glass-gf-section">
            <h2>Gravimetric Factor Calculation</h2>
            <div className="glass-gf-inputs">
              <div>
                <label>Precursor Formula:
                  <input value={precursorFormula} onChange={e=>setPrecursorFormula(e.target.value)} /></label>
                <label>Precursor Moles:<input type="number" min={1} value={precursorMoles} onChange={e=>setPrecursorMoles(Number(e.target.value))} /></label>
              </div>
              <div>
                <label>Product Formula:
                  <input value={productFormula} onChange={e=>setProductFormula(e.target.value)} /></label>
                <label>Product Moles:<input type="number" min={1} value={productMoles} onChange={e=>setProductMoles(Number(e.target.value))} /></label>
              </div>
            </div>
            {gf !== null ? (
              <div className="glass-gf-result">
                <b>GF = {gf.toFixed(6)}</b>
              </div>
            ) : <div className="glass-warning">Cannot compute GF for given formulas.</div>}
            <div className="glass-gf-tablecard">
              <table>
                <thead><tr><th>Parameter</th><th>Formula</th><th>Molecular Weight</th><th>Moles</th><th>GF</th></tr></thead>
                <tbody>
                  <tr>
                    <td>Precursor</td>
                    <td>{precursorFormula}</td>
                    <td>{molecularWeight(precursorFormula, atomics)?.toFixed(4) || "-"}</td>
                    <td>{precursorMoles}</td>
                    <td>{gf !== null ? gf.toFixed(6) : "-"}</td>
                  </tr>
                  <tr>
                    <td>Product</td>
                    <td>{productFormula}</td>
                    <td>{molecularWeight(productFormula, atomics)?.toFixed(4) || "-"}</td>
                    <td>{productMoles}</td>
                    <td/>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-section glass-batch-section">
            <h2>Batch Matrix Calculation</h2>
            <div className="glass-batch-tablecard">
              <table>
                <thead>
                  <tr><th>Chemical</th><th>MW</th><th>Matrix (%)</th><th>Mol Qty</th><th>Batch wt (g)</th></tr>
                </thead>
                <tbody>
                  {components.map((c,i)=>(
                    <tr key={i}>
                      <td>{c.formula}</td>
                      <td>{c.mw ? c.mw.toFixed(3):"-"}</td>
                      <td>{c.matrix.toFixed(3)}</td>
                      <td>{compResults[i].molQty.toFixed(4)}</td>
                      <td>{weightPercents[i].toFixed(4)}</td>
                    </tr>
                  ))}
                  <tr className="glass-total-row">
                    <td>Net wt</td><td/>
                    <td>{components.reduce((a,c)=>a+Number(c.matrix),0).toFixed(3)}</td>
                    <td>{totalWeight.toFixed(4)}</td>
                    <td>{desiredBatch.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {gf !== null && compResults.find((c) => c.formula === "H3BO3") && (
          <section className="glass-section glass-gf-applied-section">
            <h2>Batch Matrix with GF Applied (H3BO3)</h2>
            <div className="glass-batch-tablecard">
              <table>
                <thead>
                  <tr><th>Chemical</th><th>MW*GF</th><th>Matrix (%)</th><th>Mol Qty</th><th>Batch wt (g)</th></tr>
                </thead>
                <tbody>
                  {gfResults.map((c,i)=>(
                    <tr key={i}>
                      <td>{c.formula}</td>
                      <td>{c.mw ? c.mw.toFixed(3):"-"}</td>
                      <td>{c.matrix.toFixed(3)}</td>
                      <td>{c.molQty.toFixed(4)}</td>
                      <td>{gfWeightPercents[i].toFixed(4)}</td>
                    </tr>
                  ))}
                  <tr className="glass-total-row">
                    <td>Net wt</td><td/>
                    <td>{gfResults.reduce((a,c)=>a+Number(c.matrix),0).toFixed(3)}</td>
                    <td>{gfTotalWeight.toFixed(4)}</td>
                    <td>{desiredBatch.toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          )}
        </main>
    </div>
  );
};

export default App;
