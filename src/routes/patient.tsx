import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section, KV } from "@/components/osce/Primitives";
import { PatientProfileCard } from "@/components/osce/CaseParts";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";
import { z } from "zod";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/patient")({
  validateSearch: z.object({
    caseId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Fake Patient Mode: Hugh's OSCE Case Generator" }] }),
  component: PatientPage,
});

function PatientPage() {
  const { caseId: searchCaseId } = Route.useSearch();
  const initialCaseId = searchCaseId && CASE_INDEX[searchCaseId] ? searchCaseId : CASES[0].id;
  const [caseId, setCaseId] = useState(initialCaseId);

  useEffect(() => {
    if (searchCaseId && CASE_INDEX[searchCaseId]) {
      setCaseId(searchCaseId);
    }
  }, [searchCaseId]);

  const c = CASE_INDEX[caseId];
  const p = c.fakePatientScript;

  return (
    <div>
      <PageHeader
        eyebrow="Practice Exam Mode · Actor / Examiner Mode"
        title="Actor's script."
        subtitle="Give this view to your study partner. They can role-play the patient with the full patient sheet while the candidate works from the student brief."
        actions={
          <Link
            to="/practice/actor-examiner"
            search={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <ClipboardCheck className="h-4 w-4" /> Back to setup
          </Link>
        }
      />

      <select
        value={caseId}
        onChange={(e) => setCaseId(e.target.value)}
        className="rounded-md border border-input bg-card px-3 py-2 text-sm mb-5 w-full max-w-md"
      >
        {CASES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <PatientProfileCard c={c} />
        <div className="space-y-4">
          <Section title="Opening line">
            <p className="italic text-lg">"{p.openingLine}"</p>
          </Section>
          <Section title="What to volunteer">
            <ul className="text-sm space-y-1">
              {p.volunteer.map((v) => (
                <li key={v}>• {v}</li>
              ))}
            </ul>
          </Section>
          <Section title="Only if asked">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Prompts to hold back unless asked
                </p>
                <ul className="text-sm space-y-1">
                  {p.onlyIfAsked.map((v) => (
                    <li key={v}>• {v}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Full hidden details
                </p>
                {Object.entries(p.hiddenAnswers).map(([k, v]) => (
                  <KV key={k} k={k} v={v} />
                ))}
              </div>
            </div>
          </Section>
          <Section title="Full background">
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
            <KV k="Day-to-day" v={p.dayToDayImpact} />
          </Section>
          {p.challengePrompts.length > 0 && (
            <Section title="Challenge prompts for the candidate">
              <ul className="text-sm space-y-1">
                {p.challengePrompts.map((v) => (
                  <li key={v}>• "{v}"</li>
                ))}
              </ul>
            </Section>
          )}
          <PageSourcesDrawer
            sources={c.sourceTags}
            needsVerification={c.needsVerification}
            verificationNotes={c.verificationNotes}
            label="Where this script came from"
          />
        </div>
      </div>
    </div>
  );
}
