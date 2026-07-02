import type { GeoPoint } from "./types";

// Open-Meteo geocoding — free, no API key, CORS-friendly. Used server-side in
// the route handler to resolve a free-text city name to coordinates.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Country name (hyphen-free, normalised) → capital / most-searched city.
// Used as fallback when the user types a country name directly.
const COUNTRY_FALLBACK: Record<string, string> = {
  // Europe
  france: "Paris",
  belge: "Bruxelles",
  belgique: "Bruxelles",
  suisse: "Zurich",
  portugal: "Lisbonne",
  espagne: "Barcelone",
  italie: "Rome",
  allemagne: "Berlin",
  royaumeuni: "Londres",
  royaume: "Londres",
  angleterre: "Londres",
  paysbas: "Amsterdam",
  pologne: "Varsovie",
  sued: "Stockholm",
  norvege: "Oslo",
  danemark: "Copenhague",
  finlande: "Helsinki",
  autriche: "Vienne",
  grece: "Athènes",
  turquie: "Istanbul",
  russie: "Moscou",
  ukraine: "Kiev",
  islande: "Reykjavik",
  croatie: "Split",
  hongrie: "Budapest",
  tchequie: "Prague",
  bulgarie: "Sofia",
  roumanie: "Bucarest",
  slovaquie: "Bratislava",
  slovenie: "Ljubljana",
  lituanie: "Vilnius",
  lettonie: "Riga",
  estonie: "Tallinn",
  irlande: "Dublin",
  luxembourg: "Luxembourg",
  montenegro: "Kotor",
  bosnie: "Sarajevo",
  herzegovine: "Sarajevo",
  // Afrique
  maroc: "Marrakech",
  algerie: "Alger",
  algrie: "Alger",
  tunisie: "Tunis",
  egypte: "Le Caire",
  senegal: "Dakar",
  afriquesud: "Le Cap",
  keny: "Nairobi",
  tanzanie: "Zanzibar",
  namibie: "Windhoek",
  reunion: "La Reunion",
  seychelles: "Mahe",
  maurice: "Ile Maurice",
  // Moyen-Orient
  liban: "Beyrouth",
  israel: "Tel Aviv",
  emirats: "Doubaï",
  qatar: "Doha",
  jordanie: "Amman",
  georgie: "Tbilissi",
  grouzie: "Tbilissi",
  // Amériques
  usa: "New York",
  etatsunis: "New York",
  canada: "Toronto",
  mexique: "Mexico",
  cuba: "La Havane",
  republiquedominicaine: "Punta Cana",
  jamaque: "Montego Bay",
  bresil: "Rio de Janeiro",
  argentine: "Buenos Aires",
  colombie: "Bogota",
  perou: "Lima",
  equateur: "Quito",
  chile: "Santiago",
  // Asie
  japon: "Tokyo",
  chine: "Pekin",
  inde: "Delhi",
  thailande: "Bangkok",
  indonesie: "Bali",
  malaisie: "Kuala Lumpur",
  singapour: "Singapour",
  vietnam: "Hanoi",
  philippines: "Manille",
  taiwan: "Taipei",
  laos: "Luang Prabang",
  cambodge: "Siem Reap",
  srilanka: "Sri Lanka",
  nepal: "Katmandou",
  coree: "Seoul",
  coreesud: "Seoul",
  maldives: "Maldives",
  goa: "Goa",
  // Océanie
  australie: "Sydney",
  nouvellezelande: "Auckland",
};

// Normalise a country name for lookup: lowercase, accents stripped,
// spaces/hyphens collapsed to single space, trimmed.
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s-]+/g, " ")
    .trim();
}

export async function geocodeCity(query: string): Promise<GeoPoint | null> {
  const q = query.trim();
  if (!q) return null;

  // 1. Try direct city search.
  const cityResult = await geocodeCityDirect(q);
  if (cityResult) return cityResult;

  // 2. Fallback: resolve country name to its capital city.
  const norm = normalise(q);
  const capital = COUNTRY_FALLBACK[norm];
  if (capital) {
    const fallbackResult = await geocodeCityDirect(capital);
    if (fallbackResult) {
      // Show the user's typed name, but with proper casing.
      return {
        ...fallbackResult,
        name: q.charAt(0).toUpperCase() + q.slice(1),
      };
    }
  }

  return null;
}

async function geocodeCityDirect(q: string): Promise<GeoPoint | null> {
  const url = `${GEO_URL}?name=${encodeURIComponent(q)}&count=1&language=fr&format=json`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{
        name: string;
        country?: string;
        country_code?: string;
        latitude: number;
        longitude: number;
      }>;
    };
    const hit = data.results?.[0];
    if (!hit) return null;
    return {
      name: hit.name,
      country: hit.country,
      cc: hit.country_code,
      lat: hit.latitude,
      lon: hit.longitude,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
