import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section, HiddenReveal, KV } from "@/components/osce/Primitives";
import {
  CandidateStemCard,
  ClinicalReasoningPanel,
  NonPharmCard,
  PatientProfileCard,
  SafetyNetCard,
  ScopeSummary,
  TreatmentPlanCard,
} from "@/components/osce/CaseParts";
import { CountdownTimer } from "@/components/osce/CountdownTimer";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";
import { QAChecklist } from "@/components/osce/QAChecklist";
import { logAttempt } from "@/lib/performance";
import { validateCase } from "@/lib/validation";
import { Check, ClipboardCheck, Save, ShieldAlert } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/practice/solo")({
  validateSearch: z.object({
    caseId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Solo Mode: Hugh's OSCE Case Generator" }] }),
  component: SoloPracticePage,
});

type Mark = "not" | "partial" | "done";

function SoloPracticePage() {
  const { caseId: searchCaseId } = Route.useSearch();
  const initialCaseId = searchCaseId && CASE_INDEX[searchCaseId] ? searchCaseId : CASES[0].id;
  const [caseId, setCaseId] = useState(initialCaseId);
  const c = CASE_INDEX[caseId];
  const [notes, setNotes] = useState("");
  const [useAnyway, setUseAnyway] = useState(false);
  const [examReveal, setExamReveal] = useState(false);
  const [finalised, setFinalised] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [crit, setCrit] = useState<Record<number, boolean>>({});
  const [rfTicks, setRfTicks] = useState<Record<number, boolean>>({});
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (searchCaseId && CASE_INDEX[searchCaseId]) {
      setCaseId(searchCaseId);
    }
  }, [searchCaseId]);

  useEffect(() => {
    setUseAnyway(false);
    setExamReveal(false);
    setFinalised(false);
    setFeedback("");
    setMarks({});
    setCrit({});
    setRfTicks({});
    setLogged(false);
  }, [caseId]);

  const defaultMins = c.defaultTimeMinutes ?? c.timeMinutes ?? 20;
  const report = useMemo(() => validateCase(c), [c]);
  const blocked = report.unsafeForTimedPractice && !useAnyway;
  const redFlagList = (c.redFlagsToScreen?.length ? c.redFlagsToScreen : c.redFlagsPresent) ?? [];
  const missedRedFlags = redFlagList.filter((_, i) => !rfTicks[i]);
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
  const p = c.fakePatientScript;

  return (
    <div>
      <PageHeader
        eyebrow="Practice Exam Mode · Solo Mode"
        title="20-minute self-run station."
        subtitle="One person, one device. Work from the student brief, reveal history areas as you ask for them, unfold the examination section when you are ready, then score yourself against the examiner checklist."
        actions={
          <Link
            to="/practice"
            search={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <ClipboardCheck className="h-4 w-4" /> Back to mode picker
          </Link>
        }
      />

      <div className="handbook-card p-4 mb-4 flex items-center gap-3 flex-wrap">
        <select
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm flex-1 min-w-[260px]"
        >
          {CASES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      {blocked ? (
        <div className="handbook-card p-5 mt-2 border-red-300 bg-red-50">
          <p className="inline-flex items-center gap-2 font-display text-lg text-red-900">
            <ShieldAlert className="h-5 w-5" /> Unsafe for timed practice
          </p>
          <p className="text-sm text-red-900 mt-1">
            The Content QA validator flagged a critical issue on this case. It is blocked from timed
            practice to avoid teaching unsafe patterns.
          </p>
          <ul className="text-xs text-red-900 mt-2 list-disc pl-5 space-y-0.5">
            {report.results
              .filter((r) => r.level === "fail" && r.critical)
              .map((r) => (
                <li key={r.id}>
                  {r.label}
                  {r.detail ? `: ${r.detail}` : ""}
                </li>
              ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setUseAnyway(true)}
              className="rounded-md bg-red-700 text-white px-3 py-2 text-sm"
            >
              Use anyway (editing / debugging only)
            </button>
            <Link to="/qa" className="rounded-md border border-border bg-card px-3 py-2 text-sm">
              Open Content QA
            </Link>
          </div>
        </div>
      ) : (
        <>
          {useAnyway && (
            <div className="text-xs text-red-900 bg-red-50 border border-red-200 rounded px-3 py-2 mt-2">
              Override active: this case has a critical QA failure. Do not use the model answer as
              clinical guidance.
            </div>
          )}

          <CountdownTimer
            defaultMinutes={defaultMins}
            onComplete={() => setFinalised(true)}
            label="Solo Mode countdown"
            allowCustom={false}
          />

          <div className="grid xl:grid-cols-[1fr_340px] gap-5 mt-5">
            <div className="space-y-4">
              <CandidateStemCard c={c} />

              <Section title="Patient profile" defaultOpen>
                <PatientProfileCard c={c} />
              </Section>

              <Section title="Reveal history areas as you ask them" defaultOpen>
                <div className="space-y-2">
                  <HiddenReveal label="Opening line">
                    <p className="italic">"{p.openingLine}"</p>
                  </HiddenReveal>
                  <HiddenReveal label="Main complaint">
                    <p>{p.mainComplaint}</p>
                  </HiddenReveal>
                  <HiddenReveal label="What the patient volunteers">
                    <ul className="space-y-1 text-sm">
                      {p.volunteer.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </HiddenReveal>
                  <HiddenReveal label="SOCRATES responses">
                    <div>
                      {Object.entries(p.socrates).map(([k, v]) => (
                        <KV key={k} k={k} v={v} />
                      ))}
                    </div>
                  </HiddenReveal>
                  <HiddenReveal label="Only if asked">
                    <div className="space-y-2">
                      {p.onlyIfAsked.map((item) => (
                        <p key={item} className="text-sm">
                          • {item}
                        </p>
                      ))}
                      {Object.entries(p.hiddenAnswers).map(([k, v]) => (
                        <KV key={k} k={k} v={v} />
                      ))}
                    </div>
                  </HiddenReveal>
                  <HiddenReveal label="Background history">
                    <div>
                      <KV k="PMHx" v={p.medicalHistory} />
                      <KV k="Medications" v={p.medications} />
                      <KV k="Allergies" v={p.allergies} />
                      <KV k="Preg/BF" v={p.pregnancyBreastfeeding} />
                      <KV k="Family" v={p.familyHistory} />
                      <KV k="Vaccinations" v={p.vaccinationHistory} />
                      <KV k="Smoking" v={p.smoking} />
                      <KV k="Nutrition" v={p.nutrition} />
                      <KV k="Alcohol" v={p.alcohol} />
                      <KV k="Activity" v={p.physicalActivity} />
                      <KV k="Sleep/mood" v={p.sleepMood} />
                      <KV k="Social" v={p.socialContext} />
                      <KV k="Emotional impact" v={p.emotionalImpact} />
                      <KV k="Day-to-day impact" v={p.dayToDayImpact} />
                    </div>
                  </HiddenReveal>
                </div>
              </Section>

              <Section title="FOLD HERE — examination findings" defaultOpen>
                {!examReveal ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      When you have finished history-taking and want to simulate asking for vitals
                      or performing the examination, reveal this section.
                    </p>
                    <button
                      onClick={() => setExamReveal(true)}
                      className="inline-flex items-center gap-2 rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm"
                    >
                      Reveal vitals and examination findings
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                        Vitals
                      </p>
                      {Object.entries(c.vitals).map(([k, v]) => (
                        <KV key={k} k={k} v={<span className="font-mono">{v}</span>} />
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                        Examination findings
                      </p>
                      {Object.entries(c.examinationFindings).map(([k, v]) => (
                        <KV key={k} k={k} v={v} />
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            </div>

            <div className="space-y-4">
              <Section title="Notes pad" defaultOpen>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-72 rounded-md border border-input bg-card px-3 py-2 text-sm font-mono"
                  placeholder="Focused questions, red flags, scope decision, treatment plan, safety-net..."
                />
              </Section>

              <Section title="Finish and self-assess" defaultOpen>
                <p className="text-sm text-muted-foreground mb-3">
                  When you reach the end of the station or the timer hits 0:00, open the same
                  checklist the examiner would use and mark what you actually covered.
                </p>
                <button
                  onClick={() => setFinalised(true)}
                  className="w-full inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm"
                >
                  Finish station and self-assess
                </button>
              </Section>

              <div className="mt-4">
                <QAChecklist case={c} />
              </div>
            </div>
          </div>

          {finalised && (
            <div className="mt-6 space-y-4">
              <Section title="Self-assessment: red flag screening" defaultOpen>
                <ul className="space-y-1.5">
                  {redFlagList.map((rf, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm px-2 py-1 rounded bg-muted/20"
                    >
                      <input
                        type="checkbox"
                        checked={rfTicks[i] ?? false}
                        onChange={(e) => setRfTicks((s) => ({ ...s, [i]: e.target.checked }))}
                        className="mt-1"
                      />
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
                {missedRedFlags.length > 0 && (
                  <p className="mt-2 text-xs text-destructive font-medium">
                    Missed red flags: {missedRedFlags.length} of {redFlagList.length}
                  </p>
                )}
              </Section>

              <Section title="Self-assessment: marking rubric" defaultOpen>
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
                              <span className="text-[10px] uppercase text-destructive ml-1">
                                critical
                              </span>
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

              <Section title="Self-assessment: critical fails" defaultOpen>
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

              <Section title="Solo reflection" defaultOpen>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-32 rounded-md border border-input bg-card px-3 py-2 text-sm"
                  placeholder="What you did well, what you missed, and what to revisit before the next station..."
                />
              </Section>

              <Section title="Model answer and reference" defaultOpen>
                <div className="space-y-4">
                  <ScopeSummary c={c} />
                  <ClinicalReasoningPanel c={c} />
                  <TreatmentPlanCard c={c} />
                  <NonPharmCard c={c} />
                  <SafetyNetCard c={c} />
                </div>
              </Section>

              <div className="handbook-card p-5 sticky bottom-4 bg-navy text-navy-foreground flex items-center justify-between gap-4 flex-wrap no-print">
                <div>
                  <p className="text-[11px] uppercase tracking-wide opacity-70">Solo result</p>
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
                      const missedRedFlagNotes = missedRedFlags.map(
                        (rf) => `Red flag not screened: ${rf}`,
                      );
                      logAttempt({
                        mode: "solo",
                        caseId: c.id,
                        caseTitle: c.title,
                        category: c.category,
                        condition: c.condition,
                        scopeExpected: c.scopeDecision,
                        earned: score.earned,
                        max: score.max,
                        pct,
                        result: result as
                          | "Pass"
                          | "Borderline"
                          | "Fail"
                          | "Fail (critical fail triggered)",
                        criticalFail: anyCrit,
                        missedRubric: [...missedRubric, ...missedRedFlagNotes],
                        notes: feedback || notes,
                      });
                      setLogged(true);
                      setTimeout(() => setLogged(false), 2200);
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-card text-foreground px-3 py-2 text-sm"
                  >
                    {logged ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {logged ? "Logged" : "Log solo attempt"}
                  </button>
                  <Link
                    to="/performance"
                    className="text-xs underline opacity-90 hover:opacity-100"
                  >
                    View performance →
                  </Link>
                </div>
              </div>

              <PageSourcesDrawer
                sources={c.sourceTags}
                needsVerification={c.needsVerification}
                verificationNotes={c.verificationNotes}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
