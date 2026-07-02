// Approximate exchange rates (EUR base) for Itinera's destination currencies.
// These are close-to-real rates used only to DISPLAY estimates in the local
// currency — the EUR estimate is always the primary figure.
const RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.96,
  JPY: 162,
  THB: 38.5,
  VND: 27000,
  IDR: 17500,
  MYR: 5.1,
  SGD: 1.46,
  KRW: 1460,
  TWD: 35,
  INR: 90,
  LKR: 395,
  NPR: 145,
  MXN: 19.8,
  BRL: 5.8,
  ARS: 1250,
  COP: 4600,
  PEN: 4.1,
  CLP: 1050,
  CZK: 24.8,
  HUF: 395,
  PLN: 4.3,
  SEK: 11.3,
  NOK: 12.0,
  DKK: 7.46,
  ISK: 148,
  HRK: 7.5,
  BAM: 1.95,
  BGN: 1.95,
  TRY: 38,
  MAD: 10.8,
  EGP: 52,
  TZS: 2700,
  ZAR: 19.8,
  KES: 140,
  NAD: 19.8,
  MUR: 49,
  SCR: 15,
  NGN: 1680,
  GEL: 2.9,
  JOD: 0.77,
  AED: 3.97,
  QAR: 3.94,
  AUD: 1.65,
  NZD: 1.8,
  CAD: 1.47,
  CUC: 1.08,
  DOP: 62,
  JMD: 168,
  LAK: 21500,
  KHR: 4450,
  MVR: 16.6,
};

/** Convert a EUR amount to the destination's local currency. */
export function fromEur(eur: number, currency: string): number {
  const rate = RATES[currency];
  if (!rate) return eur;
  return eur * rate;
}

/** Format a number in a given currency. Falls back to EUR formatting. */
export function formatInCurrency(amount: number, currency: string): string {
  const rate = RATES[currency];
  if (!rate) {
    // Unknown currency — just format as EUR.
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Some currencies (e.g. VND, IDR) don't support Intl on all runtimes.
    return `${Math.round(amount * rate)} ${currency}`;
  }
}
