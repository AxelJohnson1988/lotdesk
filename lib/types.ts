export type Venue =
  | "hennepin-sheriff"
  | "minneapolis-pd"
  | "stpaul-pd"
  | "bloomington-pd"
  | "govdeals"
  | "mndot"
  | "dakota-municibid"
  | "anoka-surplus"
  | "gsa"
  | "propertyroom"
  | "paste";

export type Category =
  | "vehicle"
  | "powersport"
  | "phone"
  | "watch"
  | "jewelry"
  | "tools"
  | "equipment"
  | "electronics"
  | "bike"
  | "seasonal"
  | "parts"
  | "other";

export type Path =
  | "flip-local"
  | "online"
  | "wholesale"
  | "part-out"
  | "hold"
  | "pass";

export type Stage = "watch" | "bid" | "won" | "rehab" | "listed" | "sold";

export type Lane = "midwest" | "gsa" | "paste";

export type KillCode =
  | "locked-phone"
  | "watch-risk"
  | "no-title"
  | "license-required"
  | "yield-floor"
  | "title-cloud"
  | "condition";

export type Lot = {
  id: string;
  lane: Lane;
  venue: Venue;
  venueLabel: string;
  lotNo: string;
  title: string;
  category: Category;
  city: string;
  state: string;
  miles: number;
  endsAt: string;
  hammer: number;
  reserve?: number | null;
  bidders?: number | null;
  titleStatus: "clean" | "salvage" | "none" | "unknown" | "bill-of-sale";
  flags: string[];
  notes: string;
  comps: { label: string; price: number }[];
  retail: number;
  imageHint: string;
  sourceUrl?: string;
  inspection?: string[];
};

export type Score = {
  premiumRate: number;
  premium: number;
  taxRate: number;
  tax: number;
  trailer: number;
  rehab: number;
  sellRate: number;
  sellFee: number;
  allIn: number;
  proceeds: number;
  net: number;
  yield: number;
  ceiling: number;
  path: Path;
  pathWhy: string;
  decision: "bid" | "watch" | "pass";
  kills: { code: KillCode; why: string }[];
  waterfall: { label: string; amount: number; note?: string }[];
};

export type ScoredLot = Lot & { score: Score };

export type PipelineItem = {
  lotId: string;
  stage: Stage;
  capital: number;
  note?: string;
};
