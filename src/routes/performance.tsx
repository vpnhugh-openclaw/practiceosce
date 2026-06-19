import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { useAttempts } from "@/lib/performance";
import { useMemo } from "react";
import { Trash2, Timer } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "My Performance — Hugh's OSCE Case Generator" }] }),
  component: PerformancePage,
});

function PerformancePage() {
  const { items, reset } = useAttempts();

  const stats = useMemo(() => {
    if (!items.length) return null;
    const total = items.length;
    const passes = items.filter((a) => a.result === "Pass").length;
    const fails = items.filter((a) => a.result.startsWith("Fail")).length;
    const critFails = items.filter((a) => a.criticalFail).length;
    const avgPct = Math.round(items.reduce((s, a) => s + a.pct, 0) / total);

    const byCategory: Record<string, { n: number; sum: number }> = {};
    items.forEach((a) => {
      byCategory[a.category] = byCategory[a.category] ?? { n: 0, sum: 0 };
      byCategory[a.category].n += 1;
      byCategory[a.category].sum += a.pct;
    });

    const weakest = Object.entries(byCategory)
      .map(([k, v]) => ({ category: k, avg: Math.round(v.sum / v.n), n: v.n }))
      .sort((a, b) => a.avg - b.avg);

    const missed: Record<string, number> = {};
    items.forEach((a) => a.missedRubric.forEach((m) => (missed[m] = (missed[m] ?? 0) + 1)));
    const missedTop = Object.entries(missed)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { total, passes, fails, critFails, avgPct, weakest, missedTop };
  }, [items]);

  return (
    <div>
      <PageHeader
        eyebrow="My Performance"
        title="Your local OSCE attempt history."
        subtitle="Attempts are saved on this device only. Finalise a station in Examiner Mode to record a result here."
        actions={
          items.length > 0 && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md border border-destructive/40 text-destructive bg-card px-3 py-2 text-sm"
            >
              <Trash2 className="h-4 w-4" /> Clear history
            </button>
          )
        }
      />

      {!stats && (
        <div className="handbook-card p-8 text-center">
          <p className="font-display text-xl text-navy mb-2">No attempts yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Go to Examiner Mode, mark a case, then press <em>Log attempt</em>.
          </p>
          <Link
            to="/examiner"
            className="inline-flex items-center gap-2 rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm"
          >
            <Timer className="h-4 w-4" /> Open Examiner Mode
          </Link>
        </div>
      )}

      {stats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <Stat label="Attempts" value={stats.total} />
            <Stat label="Average %" value={`${stats.avgPct}%`} />
            <Stat label="Passes" value={stats.passes} />
            <Stat label="Fails" value={stats.fails} />
            <Stat label="Critical fails" value={stats.critFails} tone="destructive" />
          </div>

          <Section title="Weakest categories">
            <div className="space-y-2">
              {stats.weakest.map((w) => (
                <div key={w.category} className="flex items-center gap-3">
                  <p className="text-sm w-40">{w.category}</p>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-navy"
                      style={{ width: `${Math.max(4, w.avg)}%` }}
                    />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground w-20 text-right">
                    {w.avg}% · n={w.n}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Most-missed rubric items">
            {stats.missedTop.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing recorded as missed yet.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {stats.missedTop.map(([item, count]) => (
                  <li key={item} className="flex justify-between gap-3">
                    <span>• {item}</span>
                    <span className="text-xs font-mono text-muted-foreground">×{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Recent attempts">
            <div className="space-y-2">
              {items.slice(0, 25).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-muted/30 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{a.caseTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString()} · {a.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm">{a.pct}%</p>
                    <p
                      className={`text-[11px] ${
                        a.criticalFail
                          ? "text-destructive"
                          : a.result === "Pass"
                          ? "text-emerald-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      {a.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "destructive";
}) {
  return (
    <div className="handbook-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`font-display text-2xl mt-1 ${
          tone === "destructive" ? "text-destructive" : "text-navy"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
