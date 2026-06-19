import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES } from "@/data/cases";
import { PROTOCOLS } from "@/data/protocols";
import { PageHeader } from "@/components/osce/Primitives";
import { ScopeDecisionBadge } from "@/components/osce/ScopeBadges";
import { Timer, Flag, ShieldCheck, AlertTriangle, Shuffle, BookOpenCheck, Wand2, MessageCircleQuestion } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Hugh's OSCE Case Generator" }] }),
  component: Dashboard,
});

function Dashboard() {
  const total = CASES.length;
  const protocols = PROTOCOLS.length;
  const scopeBreakdown = CASES.reduce<Record<string, number>>((acc, c) => {
    acc[c.scopeDecision] = (acc[c.scopeDecision] ?? 0) + 1;
    return acc;
  }, {});

  const quick = [
    { to: "/practice", label: "20-minute Real OSCE Practice", icon: Timer, hint: "Default timed station" },
    { to: "/practice", label: "Red flag sprint", icon: Flag, hint: "Identify alarms fast" },
    { to: "/scope", label: "Scope decision drill", icon: ShieldCheck, hint: "Treat / refer / escalate" },
    { to: "/generate", label: "Queensland protocol trap", icon: AlertTriangle, hint: "Catch the protocol gotchas" },
    { to: "/generate", label: "Random mixed case", icon: Shuffle, hint: "Surprise me" },
    { to: "/protocols", label: "Condition protocol cards", icon: BookOpenCheck, hint: "Quick reference" },
  ] as const;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Practise like exam day."
        subtitle="Generate realistic Queensland-style pharmacist prescribing OSCE cases with fake patient scripts, examiner sheets, hidden answers, marking rubrics and safety-net prompts."
        actions={
          <>
            <Link to="/generate" className="inline-flex items-center gap-2 rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm font-medium hover:opacity-90">
              <Wand2 className="h-4 w-4" /> Generate a case
            </Link>
            <Link to="/practice" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
              <Timer className="h-4 w-4" /> Start practice exam
            </Link>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Cases available" value={total} />
        <Stat label="Protocols seeded" value={protocols} />
        <Stat label="Treat-and-refer cases" value={scopeBreakdown["treat-and-refer"] ?? 0} />
        <Stat label="Emergency-referral cases" value={scopeBreakdown["emergency"] ?? 0} />
      </div>

      <h2 className="font-display text-xl text-navy mb-3">Quick launch</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {quick.map(({ to, label, icon: Icon, hint }) => (
          <Link key={label} to={to} className="handbook-card p-4 hover:border-navy/40 transition-colors flex items-start gap-3">
            <Icon className="h-5 w-5 text-navy mt-0.5" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-xl text-navy mb-3">Case bank preview</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {CASES.slice(0, 6).map((c) => (
          <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }} className="handbook-card p-4 hover:border-navy/40 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.category}</p>
              <ScopeDecisionBadge status={c.scopeDecision} size="sm" />
            </div>
            <p className="font-medium leading-snug">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.timeMinutes}-min · {c.difficulty}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="handbook-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-3xl text-navy mt-1">{value}</p>
    </div>
  );
}
