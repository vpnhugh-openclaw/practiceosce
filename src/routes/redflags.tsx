import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ACRONYMS, RED_FLAGS } from "@/data/redflags";
import { PageHeader, Section } from "@/components/osce/Primitives";

export const Route = createFileRoute("/redflags")({
  head: () => ({ meta: [{ title: "Red Flag Library — Hugh's OSCE Case Generator" }] }),
  component: RedFlagsPage,
});

function RedFlagsPage() {
  const [q, setQ] = useState("");
  const filtered = RED_FLAGS.filter((r) =>
    [r.flag, r.suggests, r.action, ...(r.appliesTo ?? []), r.acronym ?? ""].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader eyebrow="Red Flag Library" title="Acronyms, alarms, and what to say." subtitle="Searchable red flags drawn from Queensland-protocol-aligned pharmacist prescribing OSCE practice." />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search red flags, conditions, acronyms…"
        className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm mb-6"
      />

      <Section title="Communication acronyms" defaultOpen>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACRONYMS.map((a) => (
            <div key={a.name} className="rounded-md border border-border p-3 bg-parchment/60">
              <p className="font-display text-lg text-navy">{a.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{a.domain}</p>
              <ul className="text-sm space-y-0.5">
                {a.items.map((i, idx) => <li key={idx}><span className="font-mono text-navy">{i.letter}</span> — {i.flag}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <div className="mt-6 space-y-2">
        {filtered.map((r, i) => (
          <div key={i} className="handbook-card p-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {r.acronym && <span className="text-[10px] uppercase tracking-wide bg-navy text-navy-foreground px-1.5 py-0.5 rounded">{r.acronym}</span>}
              <p className="font-medium">{r.flag}</p>
            </div>
            <p className="text-xs text-muted-foreground">Applies to: {r.appliesTo.join(", ")}</p>
            <p className="text-sm mt-1"><strong>Suggests:</strong> {r.suggests}</p>
            <p className="text-sm"><strong>Action:</strong> {r.action}</p>
            {r.oscePhrase && <p className="text-sm italic mt-1 text-muted-foreground">"{r.oscePhrase}"</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
