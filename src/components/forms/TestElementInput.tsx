"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ElementAutoSuggest from './ElementAutoSuggest';
import type { AtomicMass } from '@/types';

export default function TestElementInput() {
  const [value, setValue] = useState<string>('');
  const [atomics, setAtomics] = useState<AtomicMass[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Load atomic data
  useEffect(() => {
    fetch("/Periodic_Table.csv")
      .then(res => res.text())
      .then(txt => {
        const lines = txt.trim().split('\n').slice(1); // skip header
        const arr: AtomicMass[] = lines.map(l => {
          const parts = l.split(',');
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-purple-600/5">
        <CardTitle>Element Input Cursor Test</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type a chemical formula</label>
            <p className="text-xs text-muted-foreground">Start with a capital letter (e.g. try typing "CaO", "La2O3", etc)</p>
            <ElementAutoSuggest
              value={value}
              onChange={(val) => {
                setValue(val);
              }}
              atomics={atomics}
              inputProps={{
                placeholder: "Type a formula (e.g. CaO, La2O3)",
                onSelect: (e) => {
                  const input = e.currentTarget as HTMLInputElement;
                  setCursorPosition(input.selectionStart);
                }
              }}
            />
          </div>

          <div className="space-y-2 p-3 bg-slate-100 dark:bg-slate-800 rounded">
            <div className="text-sm font-medium">Debug Info</div>
            <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
              <div>Current Value:</div>
              <div className="font-mono">{value || "(empty)"}</div>

              <div>Value Length:</div>
              <div className="font-mono">{value.length}</div>

              <div>Last Cursor Position:</div>
              <div className="font-mono">{cursorPosition !== null ? cursorPosition : "N/A"}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
