import type { DailyBudget, Destination } from "./types";

// On-the-ground daily budget (food, local transport, a few activities — flight
// and lodging excluded), derived from the cost-of-living index (base 100 = NYC).
export function dailyBudget(dest: Destination): DailyBudget {
  const k = dest.costIndex / 100;
  return {
    budget: Math.round(30 * k + 12),
    mid: Math.round(80 * k + 22),
    comfort: Math.round(175 * k + 45),
  };
}

/** Ratio of destination vs origin cost of living (1 = same, <1 = cheaper). */
export function costRatio(
  dest: Destination,
  originCostIndex?: number
): number | undefined {
  if (!originCostIndex) return undefined;
  return Math.round((dest.costIndex / originCostIndex) * 100) / 100;
}

// Rough country-level cost-of-living index for resolving the DEPARTURE city
// when it isn't one of our catalogued destinations. base 100 = NYC.
const COUNTRY_COST_INDEX: Record<string, number> = {
  BE: 72, FR: 74, NL: 80, DE: 70, LU: 82, CH: 122, GB: 84, IE: 80,
  ES: 55, PT: 52, IT: 62, GR: 52, AT: 72, PL: 45, CZ: 52, HU: 46,
  HR: 50, RO: 42, BG: 40, SE: 82, NO: 95, DK: 90, FI: 80, IS: 95,
  EE: 56, LV: 50, BA: 38, ME: 46,
  US: 95, CA: 75, MX: 42, BR: 42, AR: 38, CO: 38, PE: 40, CL: 50, EC: 38,
  CU: 38, DO: 50, JM: 52,
  MA: 38, EG: 30, ZA: 42, KE: 40, TZ: 42, TN: 35, AE: 75, TR: 38,
  GE: 32, JO: 42, NA: 42, RE: 60, SC: 78,
  TH: 40, VN: 36, ID: 38, MY: 42, SG: 88, JP: 68, KR: 68, IN: 32,
  LK: 35, NP: 30, AU: 84, NZ: 80, PH: 38, MU: 58, MV: 92,
  TW: 48, LA: 32, KH: 38,
};

export function countryCostIndex(cc?: string): number | undefined {
  if (!cc) return undefined;
  return COUNTRY_COST_INDEX[cc.toUpperCase()];
}
