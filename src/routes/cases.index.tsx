import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES } from "@/data/cases";
import { PageHeader } from "@/components/osce/Primitives";
import { ScopeDecisionBadge } from "@/components/osce/ScopeBadges";

export const Route = createFileRoute("/cases/")({
  head: () => ({ meta: [{ title: "Case Bank — Hugh's OSCE Case Generator" }] }),
  component: CaseBank,
});

function CaseBank() {
  return (
    <div>
      <PageHeader eyebrow="Case Bank" title="All seeded OSCE cases." subtitle="Worked cases adapted from IPA Practice Exams. Every case carries a scope decision, red flags, examiner answers and a marking rubric." />
      <div className="grid md:grid-cols-2 gap-3">
        {CASES.map((c) => (
          <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }} className="handbook-card p-4 hover:border-navy/40">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.category} · {c.timeMinutes} min · {c.difficulty}</p>
              <ScopeDecisionBadge status={c.scopeDecision} size="sm" />
            </div>
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.caseType.join(" · ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
