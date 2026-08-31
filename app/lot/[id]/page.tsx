"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { scoredMidwest } from "@/lib/midwest";
import { useDeskState } from "@/lib/store";
import { daysLeft, usd, when } from "@/lib/format";
import { briefFor } from "@/lib/playbook";
import type { Stage } from "@/lib/types";

const BOOK = scoredMidwest();
const STAGES: Stage[] = ["watch", "bid", "won", "rehab", "listed", "sold"];

export default function LotPage() {
  const { id } = useParams<{ id: string }>();
  const desk = useDeskState();
  const lot = useMemo(() => [...desk.extra, ...BOOK].find((l) => l.id === id), [desk.extra, id]);

  if (!desk.ready) return <p className="lede">Pulling the card…</p>;
  if (!lot) {
    return (
      <div className="panel">
        <h3>Lot not on the desk</h3>
        <p className="lede">GSA pulls and pastes live in this browser. Go back to Sources if the deep link predates ingest.</p>
        <Link className="btn primary" href="/">
          Return to desk
        </Link>
      </div>
    );
  }

  const brief = briefFor(lot.title, lot.category, lot.flags, lot.score.kills);
  const stage = desk.stageOf(lot.id);

  return (
    <>
      <header className="top">
        <div>
          <div className="kicker">
            {lot.venueLabel} · lot {lot.lotNo} · {daysLeft(lot.endsAt)}
          </div>
          <h2>{lot.title}</h2>
          <p className="lede">{lot.notes}</p>
        </div>
        <div className="stats">
          <div className="stat">
            <b>{(lot.score.yield * 100).toFixed(0)}%</b>
            <span>net yield</span>
          </div>
          <div className="stat">
            <b>{usd(lot.score.ceiling)}</b>
            <span>bid ceiling</span>
          </div>
          <div className="stat">
            <b>{usd(lot.score.net)}</b>
            <span>expected net</span>
          </div>
        </div>
      </header>

      <div className="split">
        <div className="panel">
          <div className="kicker">Fee waterfall</div>
          <h3>What the room actually costs</h3>
          <div className="waterfall">
            {lot.score.waterfall.map((w) => (
              <div className="wf" key={w.label}>
                <div>
                  {w.label}
                  {w.note ? <em>{w.note}</em> : null}
                </div>
                <b>{usd(w.amount)}</b>
              </div>
            ))}
            <div className="wf">
              <div>
                Cash to own
                <em>Before the sell fee</em>
              </div>
              <b>{usd(lot.score.allIn - lot.score.sellFee)}</b>
            </div>
            <div className="wf">
              <div>
                Retail / proceeds
                <em>Comp mid</em>
              </div>
              <b>{usd(lot.retail)}</b>
            </div>
          </div>
          <p style={{ color: "var(--ink-dim)", margin: 0 }}>{lot.score.pathWhy}</p>
        </div>

        <div className="panel">
          <div className="kicker">Resale path</div>
          <h3>{lot.score.path.replace("-", " ")}</h3>
          <div className="row">
            <span>Decision</span>
            <b>{lot.score.decision}</b>
          </div>
          <div className="row">
            <span>Closes</span>
            <b>{when(lot.endsAt)}</b>
          </div>
          <div className="row">
            <span>Haul</span>
            <b>
              {lot.miles} mi · {lot.city}, {lot.state}
            </b>
          </div>
          <div className="row">
            <span>Title</span>
            <b>{lot.titleStatus}</b>
          </div>
          <div className="row">
            <span>Comps</span>
            <b>{lot.comps.length ? lot.comps.map((c) => usd(c.price)).join(" · ") : "model book"}</b>
          </div>
          <div style={{ height: 12 }} />
          <div className="kicker">Move the lot</div>
          <div className="filters" style={{ marginTop: 8 }}>
            {STAGES.map((s) => (
              <button key={s} className={`chip ${stage === s ? "on" : ""}`} onClick={() => desk.setStage(lot, s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="card-actions">
            <button className={`btn star ${desk.stars.includes(lot.id) ? "on" : ""}`} onClick={() => desk.toggleStar(lot.id)}>
              {desk.stars.includes(lot.id) ? "Starred" : "Star"}
            </button>
            {lot.sourceUrl ? (
              <a className="btn" href={lot.sourceUrl} target="_blank" rel="noreferrer">
                Yard page
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="split" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="kicker">Grok note</div>
          <h3>Inspection list</h3>
          <ol>
            {brief.inspect.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
        <div className="panel">
          <div className="kicker">Kill criteria</div>
          <h3>Walk when</h3>
          <ul>
            {brief.kill.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p style={{ color: "var(--ink-dim)" }}>{brief.closer}</p>
        </div>
      </div>
    </>
  );
}
