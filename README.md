# Lotdesk

Minneapolis auction desk. Scores public lots the way an operator would — not a scraper farm.

Three ingest lanes:

- **Midwest wire** — Hennepin Sheriff, Minneapolis / St. Paul / Bloomington PD, GovDeals city & MnDOT, Dakota Municibid, Anoka surplus. Dates are frozen.
- **Live GSA** — public federal surplus feed. No buyer’s premium. Haul is the tax.
- **Paste** — drop a PropertyRoom / GovDeals / sheriff listing with comps; it gets a ceiling immediately.

Every lot runs hammer + premium + tax + trailer + rehab + sell fee. If it does not still clear **28% net**, it is a pass.
