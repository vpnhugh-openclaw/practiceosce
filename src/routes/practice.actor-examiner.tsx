import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section, KV, HiddenReveal } from "@/components/osce/Primitives";
import {
  CandidateStemCard,
  ReadingTimeSkeleton,
  VitalsRevealPanel,
  ExaminationRevealPanel,
  PatientProfileCard,
  ClinicalReasoningPanel,
  ScopeSummary,
  TreatmentPlanCard,
  NonPharmCard,
  SafetyNetCard,
  CaseRedFlags,
} from "@/components/osce/CaseParts";
import { ClipboardCheck, Monitor, UserRound } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/practice/actor-examiner")({
  validateSearch: z.object({
    caseId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Actor / Examiner Mode: Hugh's OSCE Case Generator" }] }),
  component: ActorExaminerModePage,
});

function ActorExaminerModePage() {
  const { caseId: searchCaseId } = Route.useSearch();
  const initialCaseId = searchCaseId && CASE_INDEX[searchCaseId] ? searchCaseId : CASES[0].id;
  const [caseId, setCaseId] = useState(initialCaseId);
  const c = CASE_INDEX[caseId];

  useEffect(() => {
    if (searchCaseId && CASE_INDEX[searchCaseId]) {
      setCaseId(searchCaseId);
    }
  }, [searchCaseId]);

  return (
    <div>
      <PageHeader
        eyebrow="Practice Exam Mode · Actor / Examiner Mode"
        title="Run the station across two devices."
        subtitle="Choose one case, then open the actor screen on one device and the examiner sheet on the other. Both links stay pinned to the same case."
      />

      <div className="handbook-card p-4 mb-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Selected case
          </span>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1 w-full max-w-xl rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            {CASES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm text-muted-foreground">
          {c.category} · {c.condition} · {c.timeMinutes}-minute station
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to="/patient"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Open actor screen</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this on the patient/actor device. It keeps the diagnosis hidden and exposes the
              role-play script for the selected case.
            </p>
          </div>
        </Link>

        <Link
          to="/examiner"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Open examiner screen</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this on the examiner device. It loads the same case with the timer, rubric,
              red-flag checklist, and attempt logging.
            </p>
          </div>
        </Link>
      </div>

      <Section title="Recommended setup" defaultOpen>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">1. Pick the case once</p>
            <p className="mt-1 text-muted-foreground">
              The selected station stays attached to both launch buttons above.
            </p>
          </div>
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">2. Open both views</p>
            <p className="mt-1 text-muted-foreground">
              One device runs the actor script, one device runs the examiner sheet.
            </p>
          </div>
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">3. Keep the case reference handy</p>
            <p className="mt-1 text-muted-foreground">
              Use the full case page only for setup or review, not during the simulated station.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/cases/$caseId"
            params={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <Monitor className="h-4 w-4" /> Open full case reference
          </Link>
          <Link
            to="/practice/solo"
            search={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            Switch to Solo Mode
          </Link>
        </div>
      </Section>

      <FullCaseInformation caseId={caseId} />
    </div>
  );
}

function FullCaseInformation({ caseId }: { caseId: string }) {
  const c = CASE_INDEX[caseId];
  if (!c) return null;
  const p = c.fakePatientScript;

  return (
    <Section title="Full case information (setup & review only)" defaultOpen={false}>
      <div className="space-y-5">
        <CandidateStemCard c={c} />
        <ReadingTimeSkeleton c={c} />

        <div className="grid lg:grid-cols-2 gap-5">
          <PatientProfileCard c={c} />
          <ScopeSummary c={c} />
        </div>

        <Section title="Fake patient script: opening & history">
          <p className="italic mb-3">"{p.openingLine}"</p>
          <p className="text-sm mb-4">
            <span className="font-medium">Main complaint:</span> {p.mainComplaint}
          </p>
          {Object.keys(p.socrates).length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                SOCRATES
              </p>
              {Object.entries(p.socrates).map(([k, v]) => (
                <KV key={k} k={k} v={v} />
              ))}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Hidden: only if asked
              </p>
              {Object.entries(p.hiddenAnswers).map(([k, v]) => (
                <HiddenReveal key={k} label={k}>
                  {v}
                </HiddenReveal>
              ))}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                Background
              </p>
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
          <Section title="Vitals (reveal when requested)">
            <VitalsRevealPanel vitals={c.vitals} />
          </Section>
          <Section title="Examination findings (reveal when performed)">
            <ExaminationRevealPanel findings={c.examinationFindings} />
          </Section>
        </div>

        <CaseRedFlags c={c} />
        <ClinicalReasoningPanel c={c} />
        <TreatmentPlanCard c={c} />
        <NonPharmCard c={c} />
        <SafetyNetCard c={c} />

        <Section title="Examiner marking rubric">
          <div className="space-y-1.5">
            {c.markingRubric.map((r, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto] gap-3 px-3 py-2 rounded-md text-sm ${r.critical ? "bg-destructive/10" : "bg-muted/40"}`}
              >
                <div>
                  <p className="font-medium">
                    {r.domain}{" "}
                    {r.critical && (
                      <span className="text-[10px] uppercase text-destructive ml-1">critical</span>
                    )}
                  </p>
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
              <p className="text-[11px] uppercase tracking-wide text-destructive mb-1">
                Critical fails
              </p>
              <ul className="text-sm space-y-1">
                {c.criticalFails.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                Learning points
              </p>
              <ul className="text-sm space-y-1">
                {c.learningPoints.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <p className="text-xs text-muted-foreground italic">{c.sourceNotes}</p>
      </div>
    </Section>
  );
}
