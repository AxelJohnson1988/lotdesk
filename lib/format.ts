export function usd(n: number, digits = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function pct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}

export function pct1(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export function daysLeft(iso: string, now = "2026-08-31T08:48:00-05:00") {
  const end = new Date(iso).getTime();
  const n = new Date(now).getTime();
  const d = Math.round((end - n) / 86400000);
  if (d < 0) return "closed";
  if (d === 0) return "ends today";
  if (d === 1) return "1 day";
  return `${d} days`;
}

export function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
}

export function venueShort(label: string) {
  return label.replace("GovDeals · ", "").replace(" County Surplus", "");
}
