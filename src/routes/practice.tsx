import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { CandidateStemCard, VitalsRevealPanel, ExaminationRevealPanel, ScopeSummary, ClinicalReasoningPanel, TreatmentPlanCard, NonPharmCard, SafetyNetCard } from "@/components/osce/CaseParts";
import { Play, Pause, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "Practice Exam Mode — Hugh's OSCE Case Generator" }] }),
  component: PracticePage,
});

function PracticePage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const c = CASE_INDEX[caseId];
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(c.timeMinutes * 60);
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useState("");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSeconds(c.timeMinutes * 60);
    setReveal(false);
    setRunning(false);
  }, [caseId, c.timeMinutes]);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
      return () => { if (ref.current) clearInterval(ref.current); };
    }
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      <PageHeader eyebrow="Practice Exam Mode" title="Timed OSCE station." subtitle="Pick a case, start the timer and work the station. Reveal the answer at the end." />

      <div className="handbook-card p-4 mb-5 flex items-center gap-3 flex-wrap">
        <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="rounded-md border border-input bg-card px-3 py-2 text-sm flex-1 min-w-[260px]">
          {CASES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <div className="font-mono text-3xl text-navy tabular-nums px-3">{mm}:{ss}</div>
        <button onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-1.5 rounded-md bg-navy text-navy-foreground px-3 py-2 text-sm">
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => { setSeconds(c.timeMinutes * 60); setRunning(false); }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-4">
          <CandidateStemCard c={c} />
          <Section title="Vitals — request and interpret"><VitalsRevealPanel vitals={c.vitals} /></Section>
          <Section title="Examination — verbalise and reveal"><ExaminationRevealPanel findings={c.examinationFindings} /></Section>
        </div>
        <div>
          <Section title="Notes pad" defaultOpen>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-64 rounded-md border border-input bg-card px-3 py-2 text-sm font-mono" placeholder="Plan your station: focused Qs, red flags, scope decision, plan, safety-net…" />
          </Section>
          <div className="mt-4">
            <button onClick={() => setReveal((r) => !r)} className="w-full inline-flex items-center justify-center rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm">
              {reveal ? "Hide answer" : "Reveal answer"}
            </button>
          </div>
        </div>
      </div>

      {reveal && (
        <div className="mt-6 space-y-4">
          <ScopeSummary c={c} />
          <ClinicalReasoningPanel c={c} />
          <TreatmentPlanCard c={c} />
          <NonPharmCard c={c} />
          <SafetyNetCard c={c} />
          <Link to="/cases/$caseId" params={{ caseId: c.id }} className="inline-block text-sm underline">Open full case →</Link>
        </div>
      )}
    </div>
  );
}
