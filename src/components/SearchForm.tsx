"use client";

import { useState } from "react";
import type {
  DiscoverRequest,
  TouristicWish,
  Vibe,
  WeatherWish,
} from "@/lib/types";
import { MONTHS_FR, VIBE_EMOJI, VIBE_LABELS } from "@/lib/format";
import AutocompleteInput from "@/components/AutocompleteInput";

// Popular departure cities shown as quick-select chips.
const POPULAR_CITIES = [
  { label: "Paris", query: "Paris" },
  { label: "Bruxelles", query: "Bruxelles" },
  { label: "Lyon", query: "Lyon" },
  { label: "Genève", query: "Geneve" },
  { label: "Montréal", query: "Montreal" },
  { label: "Marrakech", query: "Marrakech" },
  { label: "Barcelone", query: "Barcelone" },
  { label: "Londres", query: "Londres" },
  { label: "Berlin", query: "Berlin" },
  { label: "New York", query: "New York" },
];

const WEATHER_OPTIONS: { value: WeatherWish; label: string; icon: string }[] = [
  { value: "chaud", label: "Chaud", icon: "☀️" },
  { value: "doux", label: "Doux", icon: "🌤️" },
  { value: "tempere", label: "Tempéré", icon: "⛅" },
  { value: "frais", label: "Frais", icon: "🍂" },
  { value: "froid", label: "Froid / neige", icon: "❄️" },
  { value: "peu_importe", label: "Peu importe", icon: "🌍" },
];

const TOURISTIC_OPTIONS: { value: TouristicWish; label: string; icon: string }[] =
  [
    { value: "calme", label: "Hors des foules", icon: "🧘" },
    { value: "equilibre", label: "Équilibré", icon: "⚖️" },
    { value: "anime", label: "Animé", icon: "🎡" },
    { value: "peu_importe", label: "Peu importe", icon: "🌍" },
  ];

const ALL_VIBES = Object.keys(VIBE_LABELS) as Vibe[];

interface Props {
  onSearch: (req: DiscoverRequest) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [stops, setStops] = useState(1);
  const [month, setMonth] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [weather, setWeather] = useState<WeatherWish>("peu_importe");
  const [touristic, setTouristic] = useState<TouristicWish>("peu_importe");
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [travelers, setTravelers] = useState(1);

  const hasArrival = destinationQuery.trim().length > 0;

  function toggleVibe(v: Vibe) {
    setVibes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!originQuery.trim()) return;
    onSearch({
      originQuery: originQuery.trim(),
      destinationQuery: hasArrival ? destinationQuery.trim() : undefined,
      stops: hasArrival ? stops : undefined,
      filters: {
        month: month === "" ? undefined : month,
        budgetMax: budgetMax === "" ? undefined : budgetMax,
        weather,
        touristic,
        vibes: vibes.length ? vibes : undefined,
        travelers,
      },
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 p-6 sm:p-8 space-y-7"
    >
      {/* Cities */}
      <div className="space-y-3">
        {/* Popular departure cities */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">
            Villes populaires
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CITIES.map((c) => (
              <button
                key={c.query}
                type="button"
                onClick={() => setOriginQuery(c.query)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AutocompleteInput
            value={originQuery}
            onChange={setOriginQuery}
            placeholder="ex. Bruxelles, CDG, France…"
            label="Ville de départ"
            required
          />
          <AutocompleteInput
            value={destinationQuery}
            onChange={setDestinationQuery}
            placeholder="ex. Tokyo, NRT, Japon…"
            label="Ville d'arrivée"
          />
        </div>
      </div>

      {/* Stops (only when arrival set) */}
      {hasArrival && (
        <div className="animate-fade-up">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Escales sur le trajet
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStops(n)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                  stops === n
                    ? "bg-teal-600 text-white shadow"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {n} escale{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Itinera proposera les meilleures villes-étapes « sur la route »,
            selon vos filtres.
          </p>
        </div>
      )}

      {/* When + budget + travelers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Quand ?">
          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={inputClass}
          >
            <option value="">Indifférent</option>
            {MONTHS_FR.map((m, i) => (
              <option key={m} value={i + 1}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget vol max (A/R, €)">
          <input
            type="number"
            min={0}
            step={50}
            value={budgetMax}
            onChange={(e) =>
              setBudgetMax(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="ex. 400"
            className={inputClass}
          />
        </Field>
        <Field label="Voyageurs">
          <input
            type="number"
            min={1}
            max={12}
            value={travelers}
            onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Weather */}
      <Group label="Météo souhaitée sur place">
        {WEATHER_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            active={weather === o.value}
            onClick={() => setWeather(o.value)}
          >
            <span aria-hidden>{o.icon}</span> {o.label}
          </Chip>
        ))}
      </Group>

      {/* Touristic */}
      <Group label="Ambiance">
        {TOURISTIC_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            active={touristic === o.value}
            onClick={() => setTouristic(o.value)}
          >
            <span aria-hidden>{o.icon}</span> {o.label}
          </Chip>
        ))}
      </Group>

      {/* Vibes */}
      <Group label="Envies (plusieurs possibles)">
        {ALL_VIBES.map((v) => (
          <Chip key={v} active={vibes.includes(v)} onClick={() => toggleVibe(v)}>
            <span aria-hidden>{VIBE_EMOJI[v]}</span> {VIBE_LABELS[v]}
          </Chip>
        ))}
      </Group>

      <button
        type="submit"
        disabled={loading || !originQuery.trim()}
        className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:from-teal-600 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Recherche en cours…" : "Trouver mes destinations →"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-teal-600"> *</span>}
        {hint && (
          <span className="ml-1 font-normal text-slate-400">· {hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
        active
          ? "bg-teal-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
