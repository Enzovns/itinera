"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Flag from "@/components/Flag";

interface GeoResult {
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string; // region/state
  feature_code?: string; // "AIRPORT", "CITY", "TOWN", etc.
  latitude: number;
  longitude: number;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  onSelect?: (result: GeoResult) => void;
}

// Open-Meteo geocoding — free, no key, CORS-friendly.
async function searchGeo(query: string): Promise<GeoResult[]> {
  if (query.trim().length < 2) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=fr&format=json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: GeoResult[] };
    return json.results ?? [];
  } catch {
    return [];
  }
}

function featureIcon(code?: string): string {
  if (code === "AIRP" || code === "AIRPORT") return "✈️";
  if (code === "CITY" || code === "TOWN" || code === "VILLG") return "🏙️";
  if (code === "MTN" || code === "PK" || code === "HLLS") return "🏔️";
  return "📍";
}

export default function AutocompleteInput({
  value,
  onChange,
  placeholder,
  label,
  required,
  onSelect,
}: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  // Track input position for portal placement
  const [inputRect, setInputRect] = useState<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef(false);

  // Sync external value changes (e.g. form reset).
  useEffect(() => {
    if (!typingRef.current) {
      setQuery(value);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const res = await searchGeo(q);
      setResults(res);
      setLoading(false);
      setOpen(true);
      setHighlighted(-1);
    }, 280);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    typingRef.current = true;
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    runSearch(v);
  }

  function select(result: GeoResult) {
    typingRef.current = false;
    setQuery(result.name);
    onChange(result.name);
    setOpen(false);
    setResults([]);
    setInputRect(null);
    onSelect?.(result);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      select(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleFocus() {
    typingRef.current = false;
    if (inputRef.current) {
      setInputRect(inputRef.current.getBoundingClientRect());
    }
    if (results.length > 0) setOpen(true);
  }

  // Re-track position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    function track() {
      if (inputRef.current) setInputRect(inputRef.current.getBoundingClientRect());
    }
    window.addEventListener("scroll", track, { passive: true });
    window.addEventListener("resize", track);
    return () => {
      window.removeEventListener("scroll", track);
      window.removeEventListener("resize", track);
    };
  }, [open]);

  // Dropdown rendered via portal so it escapes ALL stacking contexts.
  const dropdown = open && results.length > 0 && inputRect ? (
    <ul
      className="fixed rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-300/50"
      style={{
        top: inputRect.bottom + window.scrollY + 4,
        left: inputRect.left + window.scrollX,
        width: inputRect.width,
        zIndex: 9999,
      }}
    >
      {results.map((r, i) => (
        <li key={`${r.latitude}-${r.longitude}-${i}`}>
          <button
            type="button"
            onClick={() => select(r)}
            className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${
              i === highlighted ? "bg-teal-50 text-teal-900" : "hover:bg-slate-50"
            }`}
          >
            <span className="shrink-0 text-base">{featureIcon(r.feature_code)}</span>
            <span className="shrink-0 text-lg leading-none">
              <Flag cc={r.country_code ?? "UN"} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium text-slate-900">{r.name}</span>
              {r.admin1 && (
                <span className="ml-1.5 text-slate-400">, {r.admin1}</span>
              )}
              {r.country && (
                <span className="ml-1 text-slate-400">· {r.country}</span>
              )}
            </span>
            {r.feature_code === "AIRP" || r.feature_code === "AIRPORT" ? (
              <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                Aéroport
              </span>
            ) : null}
          </button>
        </li>
      ))}
      <li className="border-t border-slate-100">
        <p className="px-3 py-1 text-[10px] text-slate-400">
          Géocodage gratuit par Open-Meteo
        </p>
      </li>
    </ul>
  ) : null;

  return (
    <div ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-teal-600">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => { typingRef.current = false; }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 pr-9 text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </span>
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onChange("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-0.5 text-slate-500 hover:bg-slate-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {typeof document !== "undefined" ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
