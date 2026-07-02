"use client";

import { useEffect, useState } from "react";
import type { Destination } from "@/lib/types";
import { SectionHead } from "@/components/sejour/Lodging";

interface CountryFacts {
  currency?: string;
  languages?: string;
  callingCode?: string;
  driveSide?: string;
  capital?: string;
}

// Real country data from REST Countries (free, no key, CORS-friendly).
// Times out gracefully so a slow/unreachable API never leaves the UI hanging.
async function fetchCountryFacts(cc: string): Promise<CountryFacts | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(
      `https://restcountries.com/v3.1/alpha/${cc}?fields=currencies,languages,idd,car,capital`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const c = Array.isArray(json) ? json[0] : json;
    if (!c) return null;
    const cur = c.currencies ? Object.values(c.currencies)[0] : undefined;
    const idd = c.idd?.root
      ? `${c.idd.root}${c.idd.suffixes?.[0] ?? ""}`
      : undefined;
    return {
      currency:
        cur && typeof cur === "object"
          ? `${(cur as { name?: string }).name ?? ""} ${
              (cur as { symbol?: string }).symbol
                ? `(${(cur as { symbol?: string }).symbol})`
                : ""
            }`.trim()
          : undefined,
      languages: c.languages
        ? (Object.values(c.languages) as string[]).join(", ")
        : undefined,
      callingCode: idd,
      driveSide:
        c.car?.side === "right"
          ? "à droite"
          : c.car?.side === "left"
            ? "à gauche"
            : undefined,
      capital: Array.isArray(c.capital) ? c.capital[0] : undefined,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

const TIPS = [
  {
    icon: "📶",
    title: "Carte SIM / eSIM",
    body: "Une eSIM (Airalo, Holafly) s'active avant le départ. Pour un long séjour, comparez avec une SIM locale prépayée, souvent moins chère au Go.",
  },
  {
    icon: "🛡️",
    title: "Assurance voyage",
    body: "Vérifiez d'abord votre carte premium (assurance + assistance si le billet est payé avec). Sinon, frais médicaux ≥ 100 000 € hors UE.",
  },
  {
    icon: "🏧",
    title: "Retirer des espèces",
    body: "DAB bancaire, jamais le change d'aéroport. Refusez la « conversion dans votre monnaie » (DCC). Carte sans frais : Revolut, Wise.",
  },
  {
    icon: "📱",
    title: "Applis utiles",
    body: "Cartes hors-ligne, Google Translate (mode photo), Citymapper/Moovit pour les transports, XE pour le taux du jour.",
  },
];

export default function PracticalInfo({
  destination,
}: {
  destination: Destination;
}) {
  const [facts, setFacts] = useState<CountryFacts | null>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetchCountryFacts(destination.cc).then((f) => {
      if (!active) return;
      setFacts(f);
      setState(f ? "done" : "error");
    });
    return () => {
      active = false;
    };
  }, [destination.cc]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
      <SectionHead
        icon="🧳"
        title="Infos pratiques"
        subtitle="Repères pays (données réelles) et conseils pour s'organiser sur place."
      />

      {/* Real country facts */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        {state === "loading" && (
          <p className="text-sm text-slate-400">Chargement des repères pays…</p>
        )}
        {state === "error" && (
          <p className="text-sm text-slate-400">
            Repères pays indisponibles pour le moment.
          </p>
        )}
        {state === "done" && facts && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="Capitale" value={facts.capital} />
            <Fact label="Monnaie" value={facts.currency} />
            <Fact label="Langue(s)" value={facts.languages} />
            <Fact label="Indicatif" value={facts.callingCode} />
            <Fact label="Conduite" value={facts.driveSide} />
            <Fact label="Devise (code)" value={destination.currency} />
          </dl>
        )}
      </div>

      {/* Curated tips */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {t.icon}
              </span>
              <h3 className="font-semibold text-slate-900">{t.title}</h3>
            </div>
            <p className="mt-1.5 text-sm text-slate-600">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800">
        {value && value.trim() ? value : "—"}
      </dd>
    </div>
  );
}
