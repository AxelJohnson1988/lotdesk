import { categorize, estimateRetail, scoreLot } from "./score";
import type { Lot, ScoredLot, Venue } from "./types";

function num(s: string) {
  const m = s.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

export function parsePaste(text: string): ScoredLot {
  const raw = text.trim();
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const blob = raw.toLowerCase();

  let venue: Venue = "paste";
  let venueLabel = "Pasted lot";
  if (/propertyroom/.test(blob)) {
    venue = "propertyroom";
    venueLabel = "PropertyRoom";
  } else if (/govdeals/.test(blob)) {
    venue = "govdeals";
    venueLabel = "GovDeals";
  } else if (/municibid/.test(blob)) {
    venue = "dakota-municibid";
    venueLabel = "Municibid";
  } else if (/sheriff|hennepin/.test(blob)) {
    venue = "hennepin-sheriff";
    venueLabel = "Sheriff paste";
  } else if (/gsa/.test(blob)) {
    venue = "gsa";
    venueLabel = "GSA paste";
  }

  const title =
    lines.find((l) => l.length > 12 && !/^https?:/.test(l) && !/current bid|buyer's|lot #/i.test(l)) ||
    "Pasted lot";

  const bidLine = raw.match(/(current bid|high bid|price|bid)\s*[:#$]?\s*\$?\s*([\d,]+(\.\d+)?)/i);
  const hammer = bidLine ? num(bidLine[2]) : num(raw.match(/\$[\d,]+/)?.[0] || "50") || 50;

  const compMatches = [...raw.matchAll(/comp[s]?\s*[:#-]?\s*\$?\s*([\d,]+)/gi)];
  const comps = compMatches.map((m, i) => ({ label: `Comp ${i + 1}`, price: num(m[1]) }));
  const extra = [...raw.matchAll(/\$([\d,]+)(?:\s*(retail|sold|ask|fb|ebay))?/gi)]
    .map((m) => num(m[1]))
    .filter((n) => n > hammer * 0.8 && n !== hammer)
    .slice(0, 3)
    .map((price, i) => ({ label: `Listed ${i + 1}`, price }));

  const category = categorize(title);
  const allComps = comps.length ? comps : extra;
  const retail = estimateRetail(title, category, allComps.length ? allComps : undefined);

  const flags: string[] = [];
  if (/icloud|locked|frp|activation/.test(blob)) flags.push("locked");
  if (/replica|homage|unauthenticated/.test(blob)) flags.push("auth-risk");
  if (/no title|untitled|no-title/.test(blob)) flags.push("no-title");

  let titleStatus: Lot["titleStatus"] = "unknown";
  if (/clean title/.test(blob)) titleStatus = "clean";
  if (/salvage/.test(blob)) titleStatus = "salvage";
  if (flags.includes("no-title")) titleStatus = "none";

  const milesM = raw.match(/(\d+)\s*mi/);
  const miles = milesM ? Number(milesM[1]) : venue === "gsa" ? 400 : 18;

  const lot: Lot = {
    id: `paste-${Date.now()}`,
    lane: "paste",
    venue,
    venueLabel,
    lotNo: (raw.match(/lot\s*#?\s*([A-Z0-9-]+)/i)?.[1] || "PASTE").slice(0, 16),
    title: title.slice(0, 140),
    category,
    city: /minneapolis/.test(blob) ? "Minneapolis" : "Unknown",
    state: "MN",
    miles,
    endsAt: "2026-09-06T17:00:00-05:00",
    hammer,
    titleStatus,
    flags,
    notes: raw.slice(0, 500),
    comps: allComps.slice(0, 4),
    retail,
    imageHint: title,
  };

  return { ...lot, score: scoreLot(lot) };
}
