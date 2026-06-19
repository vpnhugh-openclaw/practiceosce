import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { REFERENCES, RELIABILITY_LABEL, RELIABILITY_ORDER } from "@/data/references";
import type { ReferenceArea, ReferenceReliability } from "@/lib/types";
import { ExternalLink, Filter } from "lucide-react";

export const Route = createFileRoute("/references")({
  head: () => ({ meta: [{ title: "References: Hugh's OSCE Case Generator" }] }),
  component: ReferencesPage,
});

const AREAS: ReferenceArea[] = [
  "ENT",
  "GI",
  "Respiratory",
  "MSK",
  "Skin",
  "Women's health",
  "Protocol",
  "Red flags",
  "Examination",
  "Medicines",
  "Patient counselling",
  "OSCE structure",
];

function ReferencesPage() {
  const [area, setArea] = useState<ReferenceArea | "All">("All");
  const [reliability, setReliability] = useState<ReferenceReliability | "All">("All");

  const filtered = useMemo(
    () =>
      REFERENCES.filter(
        (r) =>
          (area === "All" || r.areas.includes(area)) &&
          (reliability === "All" || r.reliability === reliability),
      ).sort(
        (a, b) =>
          RELIABILITY_ORDER.indexOf(a.reliability) - RELIABILITY_ORDER.indexOf(b.reliability),
      ),
    [area, reliability],
  );

  return (
    <div>
      <PageHeader
        eyebrow="References"
        title="Clinical sourcing hub."
        subtitle="Where the protocol rules, red flags, dose classes, and OSCE structures in this app come from. Queensland Health protocols override any other source on prescribing questions."
      />

      <Section title="Source hierarchy used by this app">
        <ol className="text-sm space-y-1.5 list-decimal pl-5">
          <li>
            Current Queensland Health pharmacist prescribing protocols and clinical practice
            guidelines.
          </li>
          <li>Other Australian state pharmacist prescribing protocols where relevant.</li>
          <li>
            Therapeutic Guidelines and the Australian Medicines Handbook for drug-level detail.
          </li>
          <li>National condition guidelines (Asthma Handbook, COPD-X) and RACGP guidance.</li>
          <li>Healthdirect and NPS MedicineWise for patient-facing wording.</li>
          <li>
            Imported OSCE PDFs (Monash, IPA): used for case structure and examination flow only, not
            for prescribing.
          </li>
        </ol>
      </Section>

      <Section title="Filter">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Filter className="h-4 w-4" /> Area
          </span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value as ReferenceArea | "All")}
            className="rounded-md border border-border bg-card px-2 py-1"
          >
            <option value="All">All areas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <span className="inline-flex items-center gap-1 text-muted-foreground">Reliability</span>
          <select
            value={reliability}
            onChange={(e) => setReliability(e.target.value as ReferenceReliability | "All")}
            className="rounded-md border border-border bg-card px-2 py-1"
          >
            <option value="All">All levels</option>
            {RELIABILITY_ORDER.map((r) => (
              <option key={r} value={r}>
                {RELIABILITY_LABEL[r]}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {REFERENCES.length} shown
          </span>
        </div>
      </Section>

      <Section title="References">
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="handbook-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium leading-snug">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.organisation}
                    {r.year ? `, ${r.year}` : ""}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide rounded-sm bg-muted px-1.5 py-0.5 whitespace-nowrap">
                  {RELIABILITY_LABEL[r.reliability]}
                </span>
              </div>
              <p className="text-sm mt-2">
                <span className="text-muted-foreground">Used for: </span>
                {r.usedFor}
              </p>
              {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {r.areas.map((a) => (
                  <span key={a} className="text-[10px] rounded-sm bg-muted px-1.5 py-0.5">
                    {a}
                  </span>
                ))}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  Last checked {r.lastChecked}
                </span>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-navy hover:underline inline-flex items-center gap-0.5"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Disclaimer">
        <p className="text-sm">
          This is a training tool. It is not a substitute for the current Queensland Health clinical
          practice guideline, the relevant state pharmacist prescribing protocol, local legislation,
          professional judgement, or university marking guidance. Where any item is unsupported by a
          current protocol, the app marks it <em>Needs verification before clinical use</em>
          and shows class-level guidance only.
        </p>
      </Section>
    </div>
  );
}
