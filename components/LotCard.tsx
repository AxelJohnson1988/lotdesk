"use client";

import Link from "next/link";
import type { ScoredLot } from "@/lib/types";
import { daysLeft, usd, venueShort } from "@/lib/format";

export function LotCard({
  lot,
  starred,
  onStar,
  onWatch,
}: {
  lot: ScoredLot;
  starred?: boolean;
  onStar?: () => void;
  onWatch?: () => void;
}) {
  const y = lot.score.yield;
  const yClass = lot.score.path === "pass" || y < 0.28 ? "pass" : y >= 0.38 ? "" : "watch";
  return (
    <article className="card">
      <div className="card-head">
        <div style={{ minWidth: 0 }}>
          <div className="kicker">
            {venueShort(lot.venueLabel)} · {lot.lotNo} · {daysLeft(lot.endsAt)}
          </div>
          <h3>{lot.title}</h3>
        </div>
        <div className={`yield ${yClass}`}>{(y * 100).toFixed(0)}%</div>
      </div>
      <div className="meta">
        <span className={`pill ${lot.score.decision}`}>{lot.score.decision}</span>
        <span className="pill">{lot.score.path.replace("-", " ")}</span>
        <span className="pill">
          {lot.city}, {lot.state}
        </span>
        {lot.score.kills.slice(0, 1).map((k) => (
          <span key={k.code} className="pill kill">
            {k.code.replace("-", " ")}
          </span>
        ))}
      </div>
      <div className="row">
        <span>Hammer</span>
        <b>{usd(lot.hammer)}</b>
      </div>
      <div className="row">
        <span>Ceiling</span>
        <b>{usd(lot.score.ceiling)}</b>
      </div>
      <div className="row">
        <span>All-in / retail</span>
        <b>
          {usd(lot.score.allIn - lot.score.sellFee)} · {usd(lot.retail)}
        </b>
      </div>
      <div className="card-actions">
        <Link className="btn primary" href={`/lot/${lot.id}`}>
          Open card
        </Link>
        <button className={`btn star ${starred ? "on" : ""}`} onClick={onStar} type="button">
          {starred ? "Starred" : "Star"}
        </button>
        <button className="btn" onClick={onWatch} type="button">
          Watch
        </button>
      </div>
    </article>
  );
}
