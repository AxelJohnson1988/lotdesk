import { pickOperatorLots } from "@/lib/gsa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.gsa.gov/assets/gsaauctions/v2/auctions?api_key=DEMO_KEY&format=JSON",
      { cache: "no-store", redirect: "follow" },
    );
    if (!res.ok) {
      return Response.json(
        { error: `GSA feed returned ${res.status}` },
        { status: 502 },
      );
    }
    const json = await res.json();
    const rows = Array.isArray(json?.Results) ? json.Results : [];
    const lots = pickOperatorLots(rows, 28);
    return Response.json({
      pulledAt: new Date().toISOString(),
      sourceCount: rows.length,
      lots,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "GSA pull failed" },
      { status: 500 },
    );
  }
}
