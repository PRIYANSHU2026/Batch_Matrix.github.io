"use client";

import { useState, useRef, type FC, type InputHTMLAttributes, useEffect } from 'react';
import type { AtomicMass } from '@/types';

interface ElementAutoSuggestProps {
  value: string;
  onChange: (val: string) => void;
  atomics: AtomicMass[];
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

const ElementAutoSuggest: FC<ElementAutoSuggestProps> = ({ value, onChange, atomics, inputProps }) => {
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const val = value || "";
  const trimmed = val.trim();

  // Modified to make suggestions less aggressive - only suggest if a single letter is entered
  const lastToken = trimmed.match(/[A-Z][a-z]*$/)?.[0] ?? "";

  // Only show suggestions if the user is specifically looking for element suggestions
  // by starting with a capital letter
  const showSuggestions = lastToken.length > 0 && /^[A-Z]/.test(lastToken);

  const suggestions = (showSuggestions && atomics.length > 0)
    ? atomics
        .filter(a =>
          a.Symbol.toLowerCase().startsWith(lastToken.toLowerCase()) ||
          a.Element?.toLowerCase().startsWith(lastToken.toLowerCase())
        )
        .slice(0, 10) // max 10 suggestions
    : [];

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlight >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('.element-suggest-item');
      if (items[highlight]) {
        items[highlight].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlight]);

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
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
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
    // Keep focus so user can continue typing
    setHighlight(-1);

    // Don't close the dropdown automatically to allow further element selections
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Hide dropdown if unfocused
  const onBlur = () => {
    // Small delay to allow click on suggestion to register
    setTimeout(() => setFocused(false), 120);
  };

  return (
    <div className="relative w-full">
      <input
        {...inputProps}
        ref={inputRef}
        className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
                    file:border-0 file:bg-transparent file:text-sm file:font-medium
                    placeholder:text-muted-foreground focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    disabled:cursor-not-allowed disabled:opacity-50 ${inputProps?.className || ''}`}
        value={val}
        onFocus={() => setFocused(true)}
        onBlur={onBlur}
        onChange={e => { onChange(e.target.value); setHighlight(-1); }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />

      {focused && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="element-suggest-menu absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md
                     border border-muted bg-popover p-1 text-popover-foreground shadow-md
                     animate-in fade-in-80 zoom-in-95"
        >
          {suggestions.map((sug, i) => (
            <div
              key={sug.Symbol}
              className={`element-suggest-item relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5
                         text-sm outline-none transition-colors
                         ${i === highlight
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'}`}
              onMouseDown={e => { e.preventDefault(); pick(i); }}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="mr-2 font-medium">{sug.Symbol}</span>
              <span className="text-muted-foreground">{sug.Element}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElementAutoSuggest;
