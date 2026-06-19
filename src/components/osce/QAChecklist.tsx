import { useMemo, useState } from "react";
import { ChevronDown, AlertTriangle, ShieldAlert, ShieldCheck, ListChecks } from "lucide-react";
import type { OSCECase } from "@/lib/types";
import { validateCase, LEVEL_CLASS, LEVEL_LABEL, type CheckLevel } from "@/lib/validation";

interface Props {
  case: OSCECase;
  /** Default closed; opens to show the full per-check grid. */
  defaultOpen?: boolean;
  /** Compact summary chip only (no full grid). */
  compact?: boolean;
}

const ORDER: CheckLevel[] = ["fail", "warning", "needs-verification", "pass"];

/**
 * Per-case Content QA panel: shows every check with pass/warning/fail/needs-verification.
 * Use in Examiner view and Case detail. Hidden by default in Student Brief and Fake
 * Patient view to avoid clutter; only the critical-failure block surfaces there.
 */
export function QAChecklist({ case: c, defaultOpen = false, compact = false }: Props) {
  const report = useMemo(() => validateCase(c), [c]);
  const [open, setOpen] = useState(defaultOpen);

  const summary = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${LEVEL_CLASS[report.overall]}`}
    >
      {report.overall === "fail" ? (
        <ShieldAlert className="h-3.5 w-3.5" />
      ) : report.overall === "pass" ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}
      QA: {LEVEL_LABEL[report.overall]}
      <span className="opacity-75">
        {report.passCount}✓ · {report.warningCount}!· {report.failCount}✗
        {report.needsVerificationCount > 0 && ` · ${report.needsVerificationCount}?`}
      </span>
    </span>
  );

  if (compact) return summary;

  return (
    <div className="rounded-md border border-border bg-card no-print">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <ListChecks className="h-4 w-4 text-navy" />
          Content QA
          {summary}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          {report.unsafeForTimedPractice && (
            <p className="text-xs text-red-900 bg-red-100 border border-red-300 rounded px-2 py-1.5">
              <strong>Unsafe for timed practice.</strong> Critical check failed: case can only be
              opened in editing/debug mode.
            </p>
          )}
          {ORDER.flatMap((lvl) =>
            report.results
              .filter((r) => r.level === lvl)
              .map((r) => (
                <div
                  key={r.id}
                  className={`text-xs rounded border px-2 py-1.5 ${LEVEL_CLASS[r.level]}`}
                >
                  <p className="font-medium">
                    [{LEVEL_LABEL[r.level]}] {r.label}
                    {r.critical && r.level === "fail" && (
                      <span className="ml-1 uppercase text-[10px]">critical</span>
                    )}
                  </p>
                  {r.detail && <p className="opacity-80 mt-0.5">{r.detail}</p>}
                </div>
              )),
          )}
        </div>
      )}
    </div>
  );
}
