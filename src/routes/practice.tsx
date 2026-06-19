import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section } from "@/components/osce/Primitives";
import {
  CandidateStemCard,
  VitalsRevealPanel,
  ExaminationRevealPanel,
  ScopeSummary,
  ClinicalReasoningPanel,
  TreatmentPlanCard,
  NonPharmCard,
  SafetyNetCard,
} from "@/components/osce/CaseParts";
import { CountdownTimer } from "@/components/osce/CountdownTimer";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";
import { QAChecklist } from "@/components/osce/QAChecklist";
import { validateCase } from "@/lib/validation";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/practice")({
  head: () => ({ meta: [{ title: "20-minute Real OSCE Practice: Hugh's OSCE Case Generator" }] }),
  component: PracticePage,
});

function PracticePage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const c = CASE_INDEX[caseId];
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useState("");
  const [useAnyway, setUseAnyway] = useState(false);

  useEffect(() => {
    setReveal(false);
    setUseAnyway(false);
  }, [caseId]);

  const defaultMins = c.defaultTimeMinutes ?? c.timeMinutes ?? 20;
  const report = useMemo(() => validateCase(c), [c]);
  const blocked = report.unsafeForTimedPractice && !useAnyway;


  return (
    <div>
      <PageHeader
        eyebrow="Real OSCE Practice"
        title="20-minute timed station."
        subtitle="Default and recommended OSCE station time is 20 minutes. The countdown is sticky: start it, work the case, then reveal the model answer."
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm no-print"
          >
            Print / Save PDF
          </button>
        }
      />

      <div className="handbook-card p-4 mb-4 flex items-center gap-3 flex-wrap">
        <select
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          className="rounded-md border border-input bg-card px-3 py-2 text-sm flex-1 min-w-[260px]"
        >
          {CASES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <CountdownTimer defaultMinutes={defaultMins} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 mt-5">
        <div className="space-y-4">
          <CandidateStemCard c={c} />
          <Section title="Vitals: request and interpret">
            <VitalsRevealPanel vitals={c.vitals} />
          </Section>
          <Section title="Examination: verbalise and reveal">
            <ExaminationRevealPanel findings={c.examinationFindings} />
          </Section>
        </div>
        <div>
          <Section title="Notes pad" defaultOpen>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-64 rounded-md border border-input bg-card px-3 py-2 text-sm font-mono"
              placeholder="Plan your station: focused Qs, red flags, scope decision, plan, safety-net…"
            />
          </Section>
          <div className="mt-4">
            <button
              onClick={() => setReveal((r) => !r)}
              className="w-full inline-flex items-center justify-center rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm"
            >
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
          <Link to="/cases/$caseId" params={{ caseId: c.id }} className="inline-block text-sm underline">
            Open full case →
          </Link>
          <PageSourcesDrawer
            sources={c.sourceTags}
            needsVerification={c.needsVerification}
            verificationNotes={c.verificationNotes}
          />
        </div>
      )}
    </div>
  );
}
