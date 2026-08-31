import { briefFor } from "@/lib/playbook";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    title?: string;
    category?: string;
    flags?: string[];
    kills?: { why: string }[];
  };
  const brief = briefFor(body.title || "Lot", body.category || "other", body.flags || [], body.kills || []);
  return Response.json(brief);
}
