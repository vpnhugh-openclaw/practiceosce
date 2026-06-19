import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CASE_INDEX } from "@/data/cases";
import type { OSCECase } from "@/lib/types";
import { PageHeader, Section, KV, HiddenReveal } from "@/components/osce/Primitives";
import {
  CandidateStemCard, ReadingTimeSkeleton, VitalsRevealPanel, ExaminationRevealPanel,
  PatientProfileCard, ClinicalReasoningPanel, ScopeSummary, TreatmentPlanCard,
  NonPharmCard, SafetyNetCard, CaseRedFlags,
} from "@/components/osce/CaseParts";
import { Printer, UserRound, ClipboardCheck, Timer } from "lucide-react";

export const Route = createFileRoute("/cases/$caseId")({
  head: ({ params }) => {
    const c = CASE_INDEX[params.caseId];
    return { meta: [{ title: c ? `${c.title}: Case` : "Case" }] };
  },
  component: CasePage,
  notFoundComponent: () => (
    <div className="py-10 text-center">
      <p className="font-display text-2xl text-navy">Case not found</p>
      <Link to="/cases" className="text-sm underline mt-3 inline-block">Back to case bank</Link>
    </div>
  ),
  loader: ({ params }): OSCECase => {
    const c = CASE_INDEX[params.caseId];
    if (!c) throw notFound();
    return c;
  },
});

function CasePage() {
  const c = Route.useLoaderData() as OSCECase;
  const p = c.fakePatientScript;

  return (
    <div>
      <PageHeader
        eyebrow={`${c.category} · ${c.condition}`}
        title={c.title}
        subtitle={`${c.timeMinutes}-minute station · ${c.difficulty} · ${c.caseType.join(" · ")}`}
        actions={
          <>
            <Link to="/practice" className="inline-flex items-center gap-2 rounded-md bg-navy text-navy-foreground px-3 py-2 text-sm"><Timer className="h-4 w-4" /> Practice</Link>
            <Link to="/patient" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><UserRound className="h-4 w-4" /> Patient view</Link>
            <Link to="/examiner" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"><ClipboardCheck className="h-4 w-4" /> Examiner</Link>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm no-print"><Printer className="h-4 w-4" /> Print</button>
          </>
        }
      />

      <div className="space-y-5">
        <CandidateStemCard c={c} />
        <ReadingTimeSkeleton c={c} />

        <div className="grid lg:grid-cols-2 gap-5">
          <PatientProfileCard c={c} />
          <ScopeSummary c={c} />
        </div>

        <Section title="Fake patient script: opening & history">
          <p className="italic mb-3">"{p.openingLine}"</p>
          <p className="text-sm mb-4"><span className="font-medium">Main complaint:</span> {p.mainComplaint}</p>
          {Object.keys(p.socrates).length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">SOCRATES</p>
              {Object.entries(p.socrates).map(([k, v]) => <KV key={k} k={k} v={v} />)}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Hidden: only if asked</p>
              {Object.entries(p.hiddenAnswers).map(([k, v]) => (
                <HiddenReveal key={k} label={k}>{v}</HiddenReveal>
              ))}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Background</p>
              <KV k="PMHx" v={p.medicalHistory} />
              <KV k="Medications" v={p.medications} />
              <KV k="Allergies" v={p.allergies} />
              <KV k="Preg/BF" v={p.pregnancyBreastfeeding} />
              <KV k="Family" v={p.familyHistory} />
              <KV k="Vaccinations" v={p.vaccinationHistory} />
              <KV k="Smoking" v={p.smoking} />
              <KV k="Alcohol" v={p.alcohol} />
              <KV k="Activity" v={p.physicalActivity} />
              <KV k="Sleep/mood" v={p.sleepMood} />
              <KV k="Emotional impact" v={p.emotionalImpact} />
              <KV k="Day-to-day impact" v={p.dayToDayImpact} />
            </div>
          </div>
        </Section>

        <div className="grid lg:grid-cols-2 gap-5">
          <Section title="Vitals (reveal when requested)"><VitalsRevealPanel vitals={c.vitals} /></Section>
          <Section title="Examination findings (reveal when performed)"><ExaminationRevealPanel findings={c.examinationFindings} /></Section>
        </div>

        <CaseRedFlags c={c} />
        <ClinicalReasoningPanel c={c} />
        <TreatmentPlanCard c={c} />
        <NonPharmCard c={c} />
        <SafetyNetCard c={c} />

        <div className="print-foldline" />

        <Section title="Examiner marking rubric">
          <div className="space-y-1.5">
            {c.markingRubric.map((r, i) => (
              <div key={i} className={`grid grid-cols-[1fr_auto] gap-3 px-3 py-2 rounded-md text-sm ${r.critical ? "bg-destructive/10" : "bg-muted/40"}`}>
                <div>
                  <p className="font-medium">{r.domain} {r.critical && <span className="text-[10px] uppercase text-destructive ml-1">critical</span>}</p>
                  <p className="text-xs text-muted-foreground">{r.item}</p>
                </div>
                <p className="text-xs font-mono self-center">/{r.maxMarks}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Critical fails & learning points">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-destructive mb-1">Critical fails</p>
              <ul className="text-sm space-y-1">{c.criticalFails.map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Learning points</p>
              <ul className="text-sm space-y-1">{c.learningPoints.map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
          </div>
        </Section>

        <p className="text-xs text-muted-foreground italic">{c.sourceNotes}</p>
      </div>
    </div>
  );
}
