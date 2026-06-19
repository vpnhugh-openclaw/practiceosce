import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES } from "@/data/cases";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { validateCase, LEVEL_CLASS, LEVEL_LABEL, type CheckLevel } from "@/lib/validation";
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/qa")({
  head: () => ({ meta: [{ title: "Content QA: Hugh's OSCE Case Generator" }] }),
  component: QAPage,
});

const LEVELS: CheckLevel[] = ["fail", "warning", "needs-verification", "pass"];

function QAPage() {
  const [filter, setFilter] = useState<CheckLevel | "all" | "unsafe">("all");

  const reports = useMemo(() => CASES.map((c) => ({ c, r: validateCase(c) })), []);
  const totals = useMemo(() => {
    const t = { pass: 0, warning: 0, fail: 0, "needs-verification": 0, unsafe: 0 };
    reports.forEach(({ r }) => {
      t[r.overall] += 1;
      if (r.unsafeForTimedPractice) t.unsafe += 1;
    });
    return t;
  }, [reports]);

  const filtered = reports.filter(({ r }) => {
    if (filter === "all") return true;
    if (filter === "unsafe") return r.unsafeForTimedPractice;
    return r.overall === filter;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Content QA"
        title="Validator results across all cases."
        subtitle="Every case is run through the clinical guardrail validator. Unsafe cases are blocked from timed practice unless explicitly overridden."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Total" value={CASES.length} />
        <Stat label="Pass" value={totals.pass} tone="pass" />
        <Stat label="Warning" value={totals.warning} tone="warning" />
        <Stat label="Fail" value={totals.fail} tone="fail" />
        <Stat label="Unsafe for timed practice" value={totals.unsafe} tone="fail" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">Filter:</span>
        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {LEVELS.map((l) => (
          <FilterChip key={l} label={LEVEL_LABEL[l]} active={filter === l} onClick={() => setFilter(l)} />
        ))}
        <FilterChip label="Unsafe only" active={filter === "unsafe"} onClick={() => setFilter("unsafe")} />
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} shown</span>
      </div>

      <Section title="Cases">
        <div className="space-y-2">
          {filtered.map(({ c, r }) => (
            <div key={c.id} className="handbook-card p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <Link to="/cases/$caseId" params={{ caseId: c.id }} className="font-medium text-navy hover:underline">
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.category} · {c.condition} · scope: {c.scopeDecision}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {r.unsafeForTimedPractice && (
                    <span className="inline-flex items-center gap-1 rounded border border-red-300 bg-red-100 text-red-900 text-[11px] px-2 py-0.5">
                      <ShieldAlert className="h-3 w-3" /> Unsafe
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded border text-[11px] px-2 py-0.5 ${LEVEL_CLASS[r.overall]}`}>
                    {r.overall === "fail" ? <ShieldAlert className="h-3 w-3" /> :
                      r.overall === "pass" ? <ShieldCheck className="h-3 w-3" /> :
                      <AlertTriangle className="h-3 w-3" />}
                    {LEVEL_LABEL[r.overall]}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {r.passCount}✓ {r.warningCount}! {r.failCount}✗
                    {r.needsVerificationCount > 0 && ` ${r.needsVerificationCount}?`}
                  </span>
                </div>
              </div>
              {r.overall !== "pass" && (
                <ul className="mt-2 space-y-1">
                  {r.results
                    .filter((x) => x.level !== "pass")
                    .map((x) => (
                      <li key={x.id} className={`text-[11px] rounded border px-2 py-1 ${LEVEL_CLASS[x.level]}`}>
                        <span className="font-medium">[{LEVEL_LABEL[x.level]}]</span> {x.label}
                        {x.detail && <span className="opacity-80">: {x.detail}</span>}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "pass" | "warning" | "fail" }) {
  const cls =
    tone === "pass" ? "text-emerald-700" :
    tone === "warning" ? "text-amber-700" :
    tone === "fail" ? "text-red-700" :
    "text-navy";
  return (
    <div className="handbook-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display text-3xl mt-1 ${cls}`}>{value}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-md border ${active ? "bg-navy text-navy-foreground border-navy" : "bg-card border-border hover:bg-muted"}`}
    >
      {label}
    </button>
  );
}
