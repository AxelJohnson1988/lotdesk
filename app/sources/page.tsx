"use client";

import { useState } from "react";
import { parsePaste } from "@/lib/paste";
import { useDeskState } from "@/lib/store";
import type { ScoredLot } from "@/lib/types";

const WIRES = [
  ["Hennepin Sheriff", "Seized vehicles, jewelry, phones. 10% premium. Title in the file or it isn't."],
  ["Minneapolis / St. Paul / Bloomington PD", "Property-room glass and fleet leftovers. Lock screens kill the model."],
  ["GovDeals · City & MnDOT", "12.5% stacked. Heavy iron needs a lowboy. They will not load for you."],
  ["Dakota Municibid / Anoka surplus", "Tools and seasonal. August snowblowers are a hold."],
];

export default function SourcesPage() {
  const desk = useDeskState();
  const [status, setStatus] = useState("");
  const [text, setText] = useState(
    "PropertyRoom lot 5521\nCurrent bid $85\niPhone 13 iCloud locked, Minneapolis 4 mi\nComp unlocked $240",
  );
  const [last, setLast] = useState<ScoredLot | null>(null);
  const [busy, setBusy] = useState(false);

  async function pullGsa() {
    setBusy(true);
    setStatus("Calling the public GSA feed…");
    try {
      const res = await fetch("/api/gsa");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GSA miss");
      desk.addLots(data.lots);
      setStatus(`${data.lots.length} federal lots scored · ${data.total} in the live file`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "GSA miss");
    } finally {
      setBusy(false);
    }
  }

  function onPaste() {
    const lot = parsePaste(text);
    desk.addLots([lot]);
    setLast(lot);
    setStatus(`Pasted ${lot.title} · ceiling ${Math.round(lot.score.ceiling)}`);
  }

  return (
    <>
      <header className="top">
        <div>
          <div className="kicker">Ingest</div>
          <h2>Sources</h2>
          <p className="lede">
            Police and municipal yards do not publish a usable public API. The desk runs three lanes: the Midwest
            wire (seeded), live GSA, and anything you paste from a yard page.
          </p>
        </div>
      </header>

      <div className="split">
        <div className="panel">
          <div className="kicker">Lane 02</div>
          <h3>Live GSA</h3>
          <p className="lede">
            Public federal surplus. No buyer&apos;s premium. Haul is the tax. Nearby states and iron get scored first.
          </p>
          <button className="btn primary" disabled={busy} onClick={pullGsa}>
            {busy ? "Pulling…" : "Pull federal surplus"}
          </button>
          {status ? <p className="toast">{status}</p> : null}
        </div>
        <div className="panel">
          <div className="kicker">Lane 01</div>
          <h3>Midwest wire</h3>
          <ul>
            {WIRES.map(([n, d]) => (
              <li key={n}>
                <b>{n}.</b> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="kicker">Lane 03</div>
        <h3>Paste a listing</h3>
        <p className="lede">
          Drop a PropertyRoom / GovDeals / sheriff title with a current bid and comps. The desk writes a ceiling
          immediately.
        </p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div className="card-actions" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={onPaste}>
            Score paste
          </button>
        </div>
        {last ? (
          <p className="lede">
            Decision <b>{last.score.decision}</b> · path {last.score.path} · yield{" "}
            {(last.score.yield * 100).toFixed(0)}% · {last.score.pathWhy}
          </p>
        ) : null}
      </div>
    </>
  );
}
