import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section } from "@/components/osce/Primitives";
import {
  CandidateStemCard,
  ScopeSummary,
  ClinicalReasoningPanel,
  TreatmentPlanCard,
  NonPharmCard,
  SafetyNetCard,
  CaseRedFlags,
} from "@/components/osce/CaseParts";
import { CountdownTimer } from "@/components/osce/CountdownTimer";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";
import { QAChecklist } from "@/components/osce/QAChecklist";
import { logAttempt } from "@/lib/performance";
import { Printer, Save, Check } from "lucide-react";

export const Route = createFileRoute("/examiner")({
  head: () => ({ meta: [{ title: "Examiner Mode: 20-minute Real OSCE: Hugh's OSCE Case Generator" }] }),
  component: ExaminerPage,
});

type Mark = "not" | "partial" | "done";

function ExaminerPage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const c = CASE_INDEX[caseId];
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [crit, setCrit] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [finalised, setFinalised] = useState(false);
  const [logged, setLogged] = useState(false);

  const score = useMemo(() => {
    let earned = 0;
    let max = 0;
    c.markingRubric.forEach((r, i) => {
      max += r.maxMarks;
      const m = marks[i] ?? "not";
      earned += m === "done" ? r.maxMarks : m === "partial" ? r.maxMarks / 2 : 0;
    });
    return { earned, max };
  }, [marks, c]);

  const anyCrit = Object.values(crit).some(Boolean);
  const pct = score.max ? Math.round((score.earned / score.max) * 100) : 0;
  const result = anyCrit
    ? "Fail (critical fail triggered)"
    : pct >= 70
    ? "Pass"
    : pct >= 55
    ? "Borderline"
    : "Fail";

  const handleTimeUp = () => {
    setFinalised(true);
  };

  const defaultMins = c.defaultTimeMinutes ?? c.timeMinutes ?? 20;

  return (
    <div>
      <PageHeader
        eyebrow="Examiner Mode"
        title="Mark a 20-minute OSCE station."
        subtitle="Sticky 20-minute countdown above the rubric. Score and comment live; the timer prompts you to finalise at 0:00."
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm no-print"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        }
      />

      <select
        value={caseId}
        onChange={(e) => {
          setCaseId(e.target.value);
          setMarks({});
          setCrit({});
          setFinalised(false);
        }}
        className="rounded-md border border-input bg-card px-3 py-2 text-sm mb-4 w-full max-w-md"
      >
        {CASES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <CountdownTimer defaultMinutes={defaultMins} onComplete={handleTimeUp} />

      <div className="mt-3"><QAChecklist case={c} /></div>


      {finalised && (
        <div className="handbook-card mt-3 p-4 bg-amber-50 border-amber-300 text-amber-900">
          <p className="font-medium text-sm">Time complete: finalise your score and written feedback below before submitting.</p>
        </div>
      )}

      <div className="space-y-4 mt-5">
        <CandidateStemCard c={c} />
        <CaseRedFlags c={c} />

        <div className="print-foldline" />
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground -mt-2 mb-2">
          ……………… FOLD HERE: EXAMINATION FINDINGS ………………
        </p>

        <ScopeSummary c={c} />
        <ClinicalReasoningPanel c={c} />
        <TreatmentPlanCard c={c} />
        <NonPharmCard c={c} />
        <SafetyNetCard c={c} />

        <Section title="Marking rubric (live)" defaultOpen>
          <div className="space-y-1.5">
            {c.markingRubric.map((r, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-md ${r.critical ? "bg-destructive/10" : "bg-muted/30"}`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-medium text-sm">
                      {r.domain}{" "}
                      {r.critical && (
                        <span className="text-[10px] uppercase text-destructive ml-1">critical</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.item}</p>
                  </div>
                  <div className="flex gap-1">
                    {(["not", "partial", "done"] as Mark[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMarks((s) => ({ ...s, [i]: m }))}
                        className={`px-2 py-1 rounded text-[11px] border ${
                          marks[i] === m
                            ? "bg-navy text-navy-foreground border-navy"
                            : "border-border bg-card"
                        }`}
                      >
                        {m === "not" ? "Not done" : m === "partial" ? "Partial" : "Done well"}
                      </button>
                    ))}
                    <span className="text-xs font-mono self-center ml-2">/{r.maxMarks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Critical fails (tick if triggered)" defaultOpen>
          <ul className="space-y-2">
            {c.criticalFails.map((f, i) => (
              <li key={i}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={crit[i] ?? false}
                    onChange={(e) => setCrit((s) => ({ ...s, [i]: e.target.checked }))}
                  />
                  {f}
                </label>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Examiner comments / written feedback" defaultOpen>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-32 rounded-md border border-input bg-card px-3 py-2 text-sm"
            placeholder="Strengths, areas for development, specific clinical reasoning points…"
          />
        </Section>

        <div className="handbook-card p-5 sticky bottom-4 bg-navy text-navy-foreground flex items-center justify-between gap-4 flex-wrap no-print">
          <div>
            <p className="text-[11px] uppercase tracking-wide opacity-70">Result</p>
            <p className="font-display text-2xl">{result}</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="font-mono text-2xl">
              {score.earned.toFixed(1)} / {score.max} ({pct}%)
            </div>
            <button
              onClick={() => {
                const missedRubric = c.markingRubric
                  .map((r, i) => ({ r, m: marks[i] ?? "not" }))
                  .filter(({ m }) => m !== "done")
                  .map(({ r }) => `${r.domain}: ${r.item}`);
                logAttempt({
                  caseId: c.id,
                  caseTitle: c.title,
                  category: c.category,
                  condition: c.condition,
                  scopeExpected: c.scopeDecision,
                  earned: score.earned,
                  max: score.max,
                  pct,
                  result: result as "Pass" | "Borderline" | "Fail" | "Fail (critical fail triggered)",
                  criticalFail: anyCrit,
                  missedRubric,
                  notes: feedback,
                });
                setLogged(true);
                setTimeout(() => setLogged(false), 2200);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-card text-foreground px-3 py-2 text-sm"
            >
              {logged ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {logged ? "Logged" : "Log attempt"}
            </button>
            <Link
              to="/performance"
              className="text-xs underline opacity-90 hover:opacity-100"
            >
              View history →
            </Link>
          </div>
        </div>

        <PageSourcesDrawer
          sources={c.sourceTags}
          needsVerification={c.needsVerification}
          verificationNotes={c.verificationNotes}
        />
      </div>
    </div>
  );
}
