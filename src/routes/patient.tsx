import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section, KV, HiddenReveal } from "@/components/osce/Primitives";
import { PatientProfileCard } from "@/components/osce/CaseParts";

export const Route = createFileRoute("/patient")({
  head: () => ({ meta: [{ title: "Fake Patient Mode: Hugh's OSCE Case Generator" }] }),
  component: PatientPage,
});

function PatientPage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const c = CASE_INDEX[caseId];
  const p = c.fakePatientScript;

  return (
    <div>
      <PageHeader eyebrow="Fake Patient Mode" title="Actor's script." subtitle="Give this view to your study partner. They can role-play the patient without knowing the diagnosis." />

      <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className="rounded-md border border-input bg-card px-3 py-2 text-sm mb-5 w-full max-w-md">
        {CASES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
      </select>

      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <PatientProfileCard c={c} />
        <div className="space-y-4">
          <Section title="Opening line">
            <p className="italic text-lg">"{p.openingLine}"</p>
          </Section>
          <Section title="What to volunteer">
            <ul className="text-sm space-y-1">{p.volunteer.map((v) => <li key={v}>• {v}</li>)}</ul>
          </Section>
          <Section title="Only if asked">
            <div className="space-y-2">
              {p.onlyIfAsked.map((v) => <HiddenReveal key={v} label={v}>:</HiddenReveal>)}
              {Object.entries(p.hiddenAnswers).map(([k, v]) => <HiddenReveal key={k} label={k}>{v}</HiddenReveal>)}
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
              <ul className="text-sm space-y-1">{p.challengePrompts.map((v) => <li key={v}>• "{v}"</li>)}</ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
