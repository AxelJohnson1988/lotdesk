import { pickGsa } from "@/lib/gsa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://api.gsa.gov/assets/gsaauctions/v2/auctions?api_key=DEMO_KEY&format=JSON", {
      redirect: "follow",
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      return Response.json({ error: `GSA ${res.status}` }, { status: 502 });
    }
    const json = (await res.json()) as { Results?: unknown[] };
    const raw = Array.isArray(json.Results) ? json.Results : [];
    const lots = pickGsa(raw as Parameters<typeof pickGsa>[0]);
    return Response.json({ total: raw.length, lots });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "GSA miss" }, { status: 502 });
  }
}
