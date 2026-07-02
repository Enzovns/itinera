import Link from "next/link";
import type { Destination } from "@/lib/types";
import Flag from "@/components/Flag";
import Lodging from "@/components/sejour/Lodging";
import Activities from "@/components/sejour/Activities";
import PracticalInfo from "@/components/sejour/PracticalInfo";
import { monthlyTemp } from "@/lib/climate";
import { dailyBudget } from "@/lib/costOfLiving";
import { euro, monthName, MONTHS_FR, VIBE_EMOJI } from "@/lib/format";
import { googleFlightsUrl, skyscannerUrl, kayakFRUrl } from "@/lib/deeplinks";

export default function SejourView({
  destination,
  from,
  month,
  travelers,
}: {
  destination: Destination;
  from?: string;
  month?: number;
  travelers: number;
}) {
  const temp = month ? monthlyTemp(destination, month) : null;
  const cost = dailyBudget(destination);
  const best = destination.bestMonths
    .map((m) => MONTHS_FR[m - 1])
    .slice(0, 4)
    .join(", ");

  return (
    <main className="flex-1 pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 text-white">
        <div className="mx-auto max-w-4xl px-5 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-50 hover:text-white"
          >
            ← Retour aux destinations
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Flag cc={destination.cc} className="!bg-white/20 !text-white !ring-white/30" />
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {destination.city}
            </h1>
            <span className="text-teal-100">{destination.country}</span>
          </div>
          <p className="mt-2 max-w-2xl text-teal-50">{destination.blurb}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {destination.vibes.map((v) => (
              <span
                key={v}
                className="rounded-full bg-white/15 px-3 py-1 text-sm"
              >
                {VIBE_EMOJI[v]} {v}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-6 px-5 pt-6">
        {/* Quick facts */}
        <div className="grid gap-3 sm:grid-cols-4">
          <FactCard
            label={month ? `Météo en ${monthName(month)}` : "Climat"}
            value={temp !== null ? `${temp}°C` : destination.archetype}
          />
          <FactCard label="Budget/jour (confort)" value={euro(cost.mid)} />
          <FactCard label="Meilleurs mois" value={best} small />
          <FactCard
            label="Coût de la vie"
            value={`Index ${destination.costIndex}/100`}
          />
        </div>

        {from && (
          <div className="flex flex-wrap gap-2">
            <a
              href={googleFlightsUrl(from, destination.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              ✈️ Google Flights ↗
            </a>
            <a
              href={skyscannerUrl(from, destination.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Skyscanner ↗
            </a>
            <a
              href={kayakFRUrl(from, destination.city)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Kayak ↗
            </a>
          </div>
        )}

        <Lodging destination={destination} initialTravelers={travelers} />
        <Activities destination={destination} />
        <PracticalInfo destination={destination} />

        <p className="text-center text-xs text-slate-400">
          Prix logements &amp; activités : estimations ajustées au coût local, pas
          des tarifs live. Repères pays : REST Countries (réel). Réservation sur
          les plateformes liées.
        </p>
      </div>
    </main>
  );
}

function FactCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 font-bold text-slate-900 ${
          small ? "text-sm capitalize" : "text-xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
