"use client";

import { useMemo } from "react";
import Link from "next/link";
import { scoredMidwest } from "@/lib/midwest";
import { useDeskState } from "@/lib/store";
import { usd } from "@/lib/format";
import type { Stage } from "@/lib/types";

const STAGES: Stage[] = ["watch", "bid", "won", "rehab", "listed", "sold"];
const BOOK = scoredMidwest();

export default function PipelinePage() {
  const desk = useDeskState();
  const lots = useMemo(() => {
    const all = [...desk.extra, ...BOOK];
    const map = new Map(all.map((l) => [l.id, l]));
    return desk.pipe.map((p) => ({ ...p, lot: map.get(p.lotId) })).filter((p) => p.lot);
  }, [desk.extra, desk.pipe]);

  return (
    <>
      <header className="top">
        <div>
          <div className="kicker">Capital</div>
          <h2>Pipeline</h2>
          <p className="lede">
            Watch → bid → won → rehab → listed → sold. Money in won / rehab / listed is capital sitting in the yard.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{usd(desk.capitalInYard)}</b>
            <span>in the yard</span>
          </div>
          <div className="stat">
            <b>{lots.length}</b>
            <span>tickets</span>
          </div>
        </div>
      </header>

      <div className="board">
        {STAGES.map((s) => {
          const col = lots.filter((p) => p.stage === s);
          const cap = col.reduce((a, b) => a + b.capital, 0);
          return (
            <div className="col" key={s}>
              <h4>
                {s} · {usd(cap)}
              </h4>
              {col.map((p) => (
                <Link key={p.lotId} href={`/lot/${p.lotId}`} className="ticket">
                  <b>{p.lot!.title}</b>
                  <div className="cap">{usd(p.capital)} cash out</div>
                </Link>
              ))}
              {col.length === 0 ? <div className="kicker">empty</div> : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
