import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Timer,
  ShieldCheck,
  ClipboardCheck,
  BookOpenCheck,
  Library,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { CASES } from "@/data/cases";
import { PROTOCOLS } from "@/data/protocols";
import { PageHeader } from "@/components/osce/Primitives";
import { ScopeDecisionBadge } from "@/components/osce/ScopeBadges";
import { useAttempts } from "@/lib/performance";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard: Hugh's OSCE Case Generator" }] }),
  component: Dashboard,
});

function Dashboard() {
  const total = CASES.length;
  const protocols = PROTOCOLS.length;
  const { items: attempts } = useAttempts();
  const scopeBreakdown = CASES.reduce<Record<string, number>>((acc, c) => {
    acc[c.scopeDecision] = (acc[c.scopeDecision] ?? 0) + 1;
    return acc;
  }, {});

  const quick = [
    { to: "/practice/solo", label: "Solo Mode", icon: Timer, hint: "Timed station on one device" },
    {
      to: "/practice/actor-examiner",
      label: "Actor / Examiner Mode",
      icon: ClipboardCheck,
      hint: "Two people, two devices",
    },
    {
      to: "/scope",
      label: "Scope decision drill",
      icon: ShieldCheck,
      hint: "Treat / refer / escalate",
    },
    { to: "/cases", label: "Cases", icon: Library, hint: "Filter and launch seeded stations" },
    {
      to: "/learn",
      label: "Learn / Reference",
      icon: BookOpen,
      hint: "Protocols, red flags and writing tools",
    },
    {
      to: "/performance",
      label: "Performance",
      icon: BarChart3,
      hint: "Review attempt history by mode",
    },
    {
      to: "/protocols",
      label: "Condition protocol cards",
      icon: BookOpenCheck,
      hint: "Quick reference",
    },
  ] as const;

  const recommended = CASES.slice(0, 4);
  const recent = attempts.slice(0, 4);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Practise like exam day."
        subtitle="Start a station quickly, keep your study tools grouped logically, and track solo versus actor-led practice separately."
        actions={
          <>
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground hover:opacity-90"
            >
              <Library className="h-4 w-4" /> Browse cases
            </Link>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <Timer className="h-4 w-4" /> Start practice exam
            </Link>
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Cases available" value={total} />
        <Stat label="Protocols seeded" value={protocols} />
        <Stat label="Treat-and-refer cases" value={scopeBreakdown["treat-and-refer"] ?? 0} />
        <Stat label="Attempts logged" value={attempts.length} />
      </div>

      <h2 className="mb-3 font-display text-xl text-navy">Quick launch</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quick.map(({ to, label, icon: Icon, hint }) => (
          <Link
            key={label}
            to={to}
            className="handbook-card flex items-start gap-3 p-4 transition-colors hover:border-navy/40"
          >
            <Icon className="mt-0.5 h-5 w-5 text-navy" />
            <div>
              <p className="font-medium">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mb-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-navy">Recent attempts</h2>
            <Link to="/performance" className="text-sm font-medium text-navy hover:underline">
              Open performance
            </Link>
          </div>
          <div className="grid gap-3">
            {recent.length ? (
              recent.map((attempt) => (
                <div key={attempt.id} className="handbook-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{attempt.caseTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {attempt.mode === "solo" ? "Solo" : "Actor / Examiner"} · {attempt.pct}% ·{" "}
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/cases/$caseId"
                      params={{ caseId: attempt.caseId }}
                      className="text-sm font-medium text-navy hover:underline"
                    >
                      Review case
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="handbook-card p-4 text-sm text-muted-foreground">
                No attempts logged yet. Start with Solo Mode or Actor / Examiner Mode from Practice
                Exam Mode.
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-navy">Recommended next cases</h2>
            <Link to="/cases" className="text-sm font-medium text-navy hover:underline">
              View all cases
            </Link>
          </div>
          <div className="grid gap-3">
            {recommended.map((c) => (
              <Link
                key={c.id}
                to="/cases/$caseId"
                params={{ caseId: c.id }}
                className="handbook-card p-4 transition-colors hover:border-navy/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.category}
                  </p>
                  <ScopeDecisionBadge status={c.scopeDecision} size="sm" />
                </div>
                <p className="font-medium leading-snug">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.timeMinutes}-min · {c.difficulty}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="handbook-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl text-navy">{value}</p>
    </div>
  );
}
