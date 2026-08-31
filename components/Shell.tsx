"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Desk", idx: "01" },
  { href: "/sources", label: "Sources", idx: "02" },
  { href: "/pipeline", label: "Pipeline", idx: "03" },
  { href: "/playbook", label: "Playbook", idx: "04" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="app">
      <aside className="rail">
        <div className="brand">
          <div className="brand-mark">55401 · night shift</div>
          <h1>Lotdesk</h1>
          <p>Minneapolis auction desk. Score the lot. Leave when it breaks 28%.</p>
        </div>
        <nav>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
              {l.label}
              <span className="idx">{l.idx}</span>
            </Link>
          ))}
        </nav>
        <div className="rail-foot">
          HENNEPIN / RAMSEY / DAKOTA
          <br />
          ANOKA · MnDOT · GSA
          <br />
          PREMIUM STACKED · HAUL TAXED
          <br />
          FLOOR 28% NET
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
