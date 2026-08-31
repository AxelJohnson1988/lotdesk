"use client";

import { useMemo, useState } from "react";
import { LotCard } from "@/components/LotCard";
import { scoredMidwest } from "@/lib/midwest";
import { useDeskState } from "@/lib/store";
import { usd } from "@/lib/format";
import type { Lane } from "@/lib/types";

const BOOK = scoredMidwest();

export default function DeskPage() {
  const desk = useDeskState();
  const [lane, setLane] = useState<"all" | Lane | "starred">("all");
  const [onlyLive, setOnlyLive] = useState(false);

  const lots = useMemo(() => {
    const all = [...desk.extra, ...BOOK];
    const ids = new Set<string>();
    const uniq = all.filter((l) => (ids.has(l.id) ? false : (ids.add(l.id), true)));
    return uniq.sort((a, b) => b.score.yield - a.score.yield);
  }, [desk.extra]);

  const shown = lots.filter((l) => {
    if (lane === "starred") return desk.stars.includes(l.id);
    if (lane !== "all" && l.lane !== lane) return false;
    if (onlyLive && l.score.decision === "pass") return false;
    return true;
  });

  const bidable = lots.filter((l) => l.score.decision === "bid").length;
  const watchable = lots.filter((l) => l.score.decision === "watch").length;

  return (
    <>
      <header className="top">
        <div>
          <div className="kicker">Operator blotter · 31 Aug 2026</div>
          <h2>Desk</h2>
          <p className="lede">
            Lots ranked by yield after hammer, premium, tax, trailer, rehab, and the sell fee.
            If it does not still clear 28% net, it is a pass.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{shown.length}</b>
            <span>on blotter</span>
          </div>
          <div className="stat">
            <b>{bidable}</b>
            <span>bid</span>
          </div>
          <div className="stat">
            <b>{watchable}</b>
            <span>watch</span>
          </div>
          <div className="stat">
            <b>{usd(desk.capitalInYard)}</b>
            <span>in the yard</span>
          </div>
        </div>
      </header>

      <div className="filters">
        {(
          [
            ["all", "All lanes"],
            ["midwest", "Midwest wire"],
            ["gsa", "Live GSA"],
            ["paste", "Pasted"],
            ["starred", "Starred"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} className={`chip ${lane === k ? "on" : ""}`} onClick={() => setLane(k)}>
            {label}
          </button>
        ))}
        <button className={`chip ${onlyLive ? "on" : ""}`} onClick={() => setOnlyLive((v) => !v)}>
          Hide passes
        </button>
      </div>

      <div className="grid">
        {shown.map((lot) => (
          <LotCard
            key={lot.id}
            lot={lot}
            starred={desk.stars.includes(lot.id)}
            onStar={() => desk.toggleStar(lot.id)}
            onWatch={() => desk.setStage(lot, "watch")}
          />
        ))}
      </div>
    </>
  );
}
