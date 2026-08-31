import { categorize, estimateRetail, scoreLot } from "./score";
import type { Lot, ScoredLot } from "./types";

type GsaRaw = {
  saleNo: string;
  lotNo: string;
  aucStartDt: string;
  aucEndDt: string;
  itemName: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  auctionStatus?: string;
  highBidAmount?: number | null;
  reserve?: boolean | number | null;
  biddersCount?: number | null;
  lotInfo?: string;
  itemDescURL?: string;
  imageURL?: string;
  agencyName?: string;
};

const NEAR = new Set(["MN", "WI", "IA", "ND", "SD", "IL", "MI"]);
const INTERESTING =
  /truck|vehicle|sedan|suv|van|ford|chevy|chevrolet|dodge|gmc|trailer|generator|toolbox|welder|compressor|plow|mower|tractor|loader|laptop|radio|engine|transmission|forklift|excavator|pickup/i;

function milesFromDesk(state?: string, city?: string) {
  const st = (state || "").trim().toUpperCase();
  const c = (city || "").trim().toLowerCase();
  if (st === "MN") {
    if (/minneapolis|st\.\? paul|bloomington|roseville|richfield/.test(c)) return 12;
    return 45;
  }
  if (st === "WI") return 280;
  if (st === "IA") return 240;
  if (st === "ND") return 250;
  if (st === "SD") return 390;
  if (st === "IL") return 410;
  if (st === "MI") return 520;
  return 780;
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

export function mapGsa(raw: GsaRaw): Lot {
  const state = (raw.propertyState || "").trim().toUpperCase();
  const city = (raw.propertyCity || "").trim();
  const title = raw.itemName || "GSA lot";
  const category = categorize(title);
  const info = stripHtml(raw.lotInfo);
  const flags: string[] = [];
  const blob = `${title} ${info}`.toLowerCase();
  if (/icloud|activation lock|frp/.test(blob)) flags.push("locked");
  if (/no title|untitled/.test(blob)) flags.push("no-title");
  if (/statement of intent|license verification/.test(blob)) flags.push("license-required");
  if (/salvage/.test(blob)) flags.push("salvage");

  const hammer = Number(raw.highBidAmount || 0) || 25;
  const retail = estimateRetail(title, category);

  return {
    id: `gsa-${raw.saleNo}-${raw.lotNo}`.replace(/\s+/g, ""),
    lane: "gsa",
    venue: "gsa",
    venueLabel: raw.agencyName ? `GSA · ${raw.agencyName}` : "GSA federal surplus",
    lotNo: `${raw.saleNo}-${raw.lotNo}`,
    title,
    category,
    city: city || "—",
    state: state || "—",
    miles: milesFromDesk(state, city),
    endsAt: `${raw.aucEndDt}T17:00:00-05:00`,
    hammer,
    reserve: typeof raw.reserve === "number" ? raw.reserve : null,
    bidders: raw.biddersCount ?? null,
    titleStatus: flags.includes("no-title") ? "none" : flags.includes("salvage") ? "salvage" : "unknown",
    flags,
    notes: info || "Federal surplus. No buyer’s premium. Haul is the tax.",
    comps: [],
    retail,
    imageHint: title,
    sourceUrl: raw.itemDescURL || "https://gsaauctions.gov",
  };
}

export function pickGsa(raws: GsaRaw[]): ScoredLot[] {
  const near: GsaRaw[] = [];
  const rest: GsaRaw[] = [];
  for (const r of raws) {
    const st = (r.propertyState || "").trim().toUpperCase();
    const name = r.itemName || "";
    if (NEAR.has(st) || INTERESTING.test(name)) near.push(r);
    else rest.push(r);
  }
  const chosen = [...near, ...rest].slice(0, 36);
  return chosen
    .map((r) => {
      const lot = mapGsa(r);
      return { ...lot, score: scoreLot(lot) };
    })
    .sort((a, b) => b.score.yield - a.score.yield);
}
