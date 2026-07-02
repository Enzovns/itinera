// Real, functional deep links into the booking/activity platforms, pre-filtered
// with the traveller's parameters. This is the honest way to be useful without
// their (paid / ToS-restricted) APIs: we show price ESTIMATES, and the button
// opens the real site where the live price lives.

export function bookingUrl(
  city: string,
  opts: { adults?: number; pets?: boolean } = {}
): string {
  const p = new URLSearchParams({
    ss: city,
    group_adults: String(opts.adults ?? 2),
    no_rooms: "1",
    group_children: "0",
  });
  if (opts.pets) p.set("nflt", "hotelfacility=4"); // "Pets allowed" facility filter
  return `https://www.booking.com/searchresults.html?${p.toString()}`;
}

export function airbnbUrl(city: string, opts: { adults?: number } = {}): string {
  const p = new URLSearchParams({ adults: String(opts.adults ?? 2) });
  return `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?${p.toString()}`;
}

export function hostelworldUrl(city: string): string {
  return `https://www.hostelworld.com/search?search_keywords=${encodeURIComponent(
    city
  )}`;
}

export function petSittingUrl(city: string): string {
  // Pet-sitting (free stays in exchange for caring for pets).
  return `https://www.trustedhousesitters.com/house-and-pet-sitting-assignments/?location=${encodeURIComponent(
    city
  )}`;
}

export function getYourGuideUrl(query: string): string {
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
}

export function viatorUrl(query: string): string {
  return `https://www.viator.com/search/${encodeURIComponent(query)}`;
}

export function googleThingsToDo(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function googleFlightsUrl(from: string, to: string): string {
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(
    `vols ${from} ${to}`
  )}`;
}

// ── Vols : comparateurs de prix ──────────────────────────────────────────────

export function skyscannerUrl(from: string, to: string): string {
  // Skyscanner direct search — works without API key (opens pre-filled search).
  const fromEnc = encodeURIComponent(from);
  const toEnc = encodeURIComponent(to);
  return `https://www.skyscanner.fr/transport/vols/${fromEnc}/${toEnc}/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=1&preferDirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;
}

export function skyscannerFlightsUrl(from: string, to: string): string {
  // Short personalised link → direct to flights page.
  const fromEnc = encodeURIComponent(from);
  const toEnc = encodeURIComponent(to);
  return `https://www.skyscanner.fr/transport/vols/f/${fromEnc}/${toEnc}/?adultsv2=1&cabinclass=economy&rtn=1`;
}

export function kayakDirectUrl(from: string, to: string): string {
  return `https://www.kayak.com/flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/-cheapest?sort=price_a`;
}

export function kayakFRUrl(from: string, to: string): string {
  return `https://www.kayak.fr/flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/cheapest?sort=price_a`;
}
