"use client";

import Link from "next/link";
import type { RankedDestination } from "@/lib/types";
import { euro, monthName, VIBE_EMOJI } from "@/lib/format";
import { formatInCurrency } from "@/lib/currency";
import Flag from "@/components/Flag";

interface Props {
  rank: RankedDestination;
  index: number;
  month?: number;
  originName?: string;
  travelers?: number;
}

export default function ResultCard({
  rank,
  index,
  month,
  originName,
  travelers,
}: Props) {
  const { destination: d, flight, costPerDay, costVsOrigin } = rank;

  const params = new URLSearchParams();
  if (originName) params.set("from", originName);
  if (month) params.set("month", String(month));
  if (travelers) params.set("travelers", String(travelers));
  const sejourHref = `/sejour/${d.id}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  return (
    <article
      className="animate-fade-up flex flex-col rounded-2xl bg-white p-5 shadow-md shadow-slate-200/50 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold leading-tight text-slate-900">
            <Flag cc={d.cc} />
            {d.city}
          </h3>
          <p className="text-sm text-slate-500">{d.country}</p>
        </div>
        <ScoreBadge score={rank.score} />
      </div>

      <p className="mt-2 text-sm text-slate-600">{d.blurb}</p>

      {/* Weather + flight */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat
          label={month ? `Météo en ${monthName(month)}` : "Météo (été)"}
          value={`${rank.weatherTempC}°C`}
          sub={weatherWord(rank.weatherCategory)}
        />
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">Vol A/R</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              estim.
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {euro(flight.roundTrip)}
          </p>
          <p className="text-xs text-slate-400">
            ≈ {formatInCurrency(flight.roundTrip, d.currency)} en {d.currency}
          </p>
          <p className="text-xs text-slate-500">
            {flight.distanceKm.toLocaleString("fr-FR")} km · aller {euro(flight.oneWay)}
          </p>
        </div>
      </div>

      {/* Cost of living */}
      <div className="mt-3 rounded-xl border border-slate-100 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Coût de la vie / jour
          </span>
          {costVsOrigin !== undefined && <CostRatio ratio={costVsOrigin} />}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <Budget label="Routard" value={costPerDay.budget} currency={d.currency} />
          <Budget label="Confort" value={costPerDay.mid} currency={d.currency} highlight />
          <Budget label="Premium" value={costPerDay.comfort} currency={d.currency} />
        </div>
      </div>

      {/* Reasons */}
      {rank.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rank.reasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-1.5 text-xs text-slate-600"
            >
              <span className="mt-0.5 text-teal-500" aria-hidden>
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      )}

      {/* Footer: vibes + buy advice */}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-1">
          {d.vibes.map((v) => (
            <span
              key={v}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {VIBE_EMOJI[v]} {v}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500">
          <span aria-hidden>🕑</span>
          {flight.bestTimeToBuy}
        </p>
        <Link
          href={sejourHref}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Préparer le séjour <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

function weatherWord(cat: string): string {
  const map: Record<string, string> = {
    chaud: "Chaud",
    doux: "Doux",
    tempere: "Tempéré",
    frais: "Frais",
    froid: "Froid",
    peu_importe: "—",
  };
  return map[cat] ?? cat;
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-teal-100 text-teal-700"
      : score >= 55
        ? "bg-cyan-100 text-cyan-700"
        : "bg-slate-100 text-slate-600";
  return (
    <div
      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${tone}`}
      title="Score de pertinence selon vos filtres"
    >
      <span className="text-base font-extrabold leading-none">{score}</span>
      <span className="text-[9px] font-medium uppercase">match</span>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Budget({
  label,
  value,
  currency,
  highlight,
}: {
  label: string;
  value: number;
  currency: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-1 py-1.5 ${
        highlight ? "bg-teal-50 ring-1 ring-teal-100" : ""
      }`}
    >
      <p className="text-sm font-bold text-slate-800">{euro(value)}</p>
      <p className="text-[10px] text-slate-400">
        ≈ {formatInCurrency(value, currency)}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CostRatio({ ratio }: { ratio: number }) {
  const pct = Math.round((ratio - 1) * 100);
  if (Math.abs(pct) < 3) {
    return (
      <span className="text-xs font-semibold text-slate-500">
        ≈ comme au départ
      </span>
    );
  }
  const cheaper = pct < 0;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        cheaper ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
      }`}
      title="Coût de la vie comparé à votre ville de départ"
    >
      {cheaper ? "−" : "+"}
      {Math.abs(pct)}% vs départ
    </span>
  );
}
