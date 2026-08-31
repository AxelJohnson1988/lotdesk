import type { Category, KillCode, Lot, Path, Score, Venue } from "./types";

export const YIELD_FLOOR = 0.28;
export const MN_TAX = 0.08025;
export const DESK_CITY = "Minneapolis";

const PREMIUM: Record<Venue, number> = {
  "hennepin-sheriff": 0.1,
  "minneapolis-pd": 0.1,
  "stpaul-pd": 0.1,
  "bloomington-pd": 0.1,
  govdeals: 0.125,
  mndot: 0.125,
  "dakota-municibid": 0.1,
  "anoka-surplus": 0.1,
  gsa: 0,
  propertyroom: 0.15,
  paste: 0.125,
};

function haul(miles: number): number {
  if (miles <= 18) return 65;
  if (miles <= 45) return 120;
  if (miles <= 90) return 185;
  if (miles <= 220) return 310;
  return 310 + Math.round((miles - 220) * 0.85);
}

function rehabFor(lot: Lot): number {
  const extra = lot.flags.includes("needs-work") ? 1.45 : 1;
  const base: Record<Category, number> = {
    vehicle: 950,
    powersport: 420,
    phone: 35,
    watch: 40,
    jewelry: 25,
    tools: 55,
    equipment: 180,
    electronics: 70,
    bike: 75,
    seasonal: 140,
    parts: 40,
    other: 80,
  };
  return Math.round(base[lot.category] * extra);
}

function defaultPath(lot: Lot): { path: Path; sellRate: number; why: string } {
  if (lot.category === "vehicle" && lot.titleStatus === "salvage") {
    return { path: "part-out", sellRate: 0, why: "Salvage paper — part-out beats a rebuilt flip in this yard." };
  }
  if (lot.category === "vehicle" || lot.category === "powersport") {
    return { path: "flip-local", sellRate: 0, why: "Metro cash buyer, no marketplace cut, title in hand." };
  }
  if (lot.category === "seasonal") {
    return { path: "hold", sellRate: 0, why: "Hold the season — dump in November and you work for the yard." };
  }
  if (lot.category === "jewelry" || lot.category === "watch") {
    return { path: "online", sellRate: 0.132, why: "Local pawn is a floor. Authenticated online is the real bid." };
  }
  if (lot.category === "tools" || lot.category === "equipment") {
    return { path: "flip-local", sellRate: 0, why: "Craigslist / Facebook in the Cities clears tools same week." };
  }
  if (lot.category === "electronics" || lot.category === "phone") {
    return { path: "wholesale", sellRate: 0, why: "Swappa lots and Midtown phone desks. Don't eBay a gray unit." };
  }
  return { path: "online", sellRate: 0.132, why: "Thin local demand — ship it." };
}

function kills(lot: Lot): { code: KillCode; why: string }[] {
  const out: { code: KillCode; why: string }[] = [];
  const blob = `${lot.title} ${lot.notes} ${lot.flags.join(" ")}`.toLowerCase();

  if (lot.category === "phone" && (lot.flags.includes("locked") || /icloud|frp|activation lock|blacklisted/.test(blob))) {
    out.push({ code: "locked-phone", why: "Activation lock / FRP. Paperweight unless the yard proves a release." });
  }
  if (
    lot.category === "watch" &&
    (lot.flags.includes("auth-risk") || /replica|homage|untested|fashion|quartz homage/.test(blob))
  ) {
    out.push({ code: "watch-risk", why: "Unauthenticated or fashion-risk. Don't dress a $40 homage as a Rolex lot." });
  }
  if (
    (lot.category === "powersport" || lot.category === "bike" || /motorcycle|atv|snowmobile|dirtbike/.test(blob)) &&
    (lot.titleStatus === "none" || lot.flags.includes("no-title"))
  ) {
    out.push({ code: "no-title", why: "No-title bike / sled. MN DVS will not bless this. Parts only, usually a pass." });
  }
  if (lot.flags.includes("license-required") || /statement of intent|dea |medical license/.test(blob)) {
    out.push({ code: "license-required", why: "License or statement-of-intent lot. Not a flea-market flip." });
  }
  if (lot.titleStatus === "salvage" && lot.category === "vehicle" && lot.flags.includes("flood")) {
    out.push({ code: "title-cloud", why: "Flood salvage. Part-out only if the drivetrain is proven dry — it isn't." });
  }
  return out;
}

export function scoreLot(lot: Lot): Score {
  const premiumRate = PREMIUM[lot.venue];
  const premium = round2(lot.hammer * premiumRate);
  const taxable = lot.hammer + premium;
  const taxRate = lot.venue === "gsa" ? 0 : MN_TAX;
  const tax = round2(taxable * taxRate);
  const trailer = haul(lot.miles);
  const rehab = rehabFor(lot);
  const chosen = defaultPath(lot);
  let path = chosen.path;
  let sellRate = chosen.sellRate;
  let pathWhy = chosen.why;

  const killList = kills(lot);
  if (killList.length) {
    path = "pass";
    sellRate = 0;
    pathWhy = killList[0].why;
  }

  const sellFee = round2(lot.retail * sellRate);
  const allIn = round2(lot.hammer + premium + tax + trailer + rehab + sellFee);
  const proceeds = lot.retail;
  const cashOut = lot.hammer + premium + tax + trailer + rehab;
  const yieldOnCash = cashOut > 0 ? (proceeds - sellFee - cashOut) / cashOut : 0;

  const ceiling = bidCeiling({
    retail: lot.retail,
    sellRate,
    premiumRate,
    taxRate,
    trailer,
    rehab,
  });

  if (path !== "pass" && yieldOnCash < YIELD_FLOOR) {
    killList.push({
      code: "yield-floor",
      why: `Stacks to ${(yieldOnCash * 100).toFixed(1)}% net. Floor is 28%. Pass or wait for a dead room.`,
    });
    path = "pass";
    pathWhy = killList[killList.length - 1].why;
  }

  let decision: Score["decision"] = "pass";
  if (path !== "pass" && yieldOnCash >= 0.38 && lot.hammer <= ceiling) decision = "bid";
  else if (path !== "pass" && yieldOnCash >= YIELD_FLOOR) decision = "watch";

  const waterfall: Score["waterfall"] = [
    { label: "Hammer", amount: lot.hammer, note: "Current / likely bid" },
    { label: "Buyer's premium", amount: premium, note: `${(premiumRate * 100).toFixed(1)}% · ${lot.venueLabel}` },
    { label: "Tax", amount: tax, note: lot.venue === "gsa" ? "GSA — no register tax; haul is the tax" : "8.025% Minneapolis stack" },
    { label: "Trailer / haul", amount: trailer, note: `${lot.miles} mi from 55401` },
    { label: "Rehab", amount: rehab, note: lot.category },
    { label: "Sell fee", amount: sellFee, note: path === "online" ? "13.2% marketplace + ship buffer" : "Cash / wholesale — no cut" },
  ];

  return {
    premiumRate,
    premium,
    taxRate,
    tax,
    trailer,
    rehab,
    sellRate,
    sellFee,
    allIn,
    proceeds,
    net: round2(proceeds - sellFee - cashOut),
    yield: yieldOnCash,
    ceiling: Math.max(0, Math.floor(ceiling)),
    path,
    pathWhy,
    decision,
    kills: killList,
    waterfall,
  };
}

export function bidCeiling(args: {
  retail: number;
  sellRate: number;
  premiumRate: number;
  taxRate: number;
  trailer: number;
  rehab: number;
}): number {
  const proceeds = args.retail * (1 - args.sellRate);
  const target = proceeds / (1 + YIELD_FLOOR);
  const fixed = args.trailer + args.rehab;
  const denom = (1 + args.premiumRate) * (1 + args.taxRate);
  if (denom <= 0) return 0;
  return (target - fixed) / denom;
}

export function estimateRetail(title: string, category: Category, comps?: { price: number }[]): number {
  if (comps && comps.length) {
    const sorted = [...comps.map((c) => c.price)].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)];
    return mid;
  }
  const t = title.toLowerCase();
  if (/f-?150|silverado|ram 1500|sierra/.test(t)) return 9800;
  if (/tahoe|suburban|expedition/.test(t)) return 7200;
  if (/impala|taurus|fusion|camry|accord/.test(t)) return 3200;
  if (/generator/.test(t)) return 650;
  if (/snow|plow|blower/.test(t)) return 480;
  if (/dewalt|milwaukee|makita/.test(t)) return 220;
  if (/iphone|samsung galaxy/.test(t)) return 140;
  if (/rolex|omega|tudor/.test(t)) return 4200;
  if (category === "vehicle") return 4500;
  if (category === "tools") return 180;
  return 250;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function categorize(title: string): Category {
  const t = title.toLowerCase();
  if (/iphone|galaxy|pixel|phone|ipad/.test(t)) return "phone";
  if (/rolex|omega|seiko|watch|timepiece/.test(t)) return "watch";
  if (/ring|necklace|bracelet|gold |diamond|jewelry/.test(t)) return "jewelry";
  if (/motorcycle|atv|snowmobile|scooter|dirtbike/.test(t)) return "powersport";
  if (/bike|bicycle/.test(t)) return "bike";
  if (/truck|sedan|suv|van|pickup|chevrolet|ford |dodge|gmc |vin /.test(t)) return "vehicle";
  if (/snow|plow|blower|mower|leaf/.test(t)) return "seasonal";
  if (/wrench|dewalt|milwaukee|toolbox|compressor|welder/.test(t)) return "tools";
  if (/generator|trailer|tractor|loader|forklift/.test(t)) return "equipment";
  if (/laptop|monitor|printer|server|radio/.test(t)) return "electronics";
  if (/tire|rim|alternator|transmission|engine /.test(t)) return "parts";
  return "other";
}
