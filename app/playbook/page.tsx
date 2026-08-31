import { PLAYBOOK } from "@/lib/playbook";

export default function PlaybookPage() {
  return (
    <>
      <header className="top">
        <div>
          <div className="kicker">Standing orders</div>
          <h2>Playbook</h2>
          <p className="lede">
            Title, locks, jewelry, season, and bid discipline. The model already knows these. The operator still has
            to walk.
          </p>
        </div>
      </header>
      <div className="play">
        {PLAYBOOK.map((p) => (
          <article key={p.id}>
            <div className="kicker">{p.kicker}</div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <ol>
              {p.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </>
  );
}
