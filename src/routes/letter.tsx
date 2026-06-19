import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";

export const Route = createFileRoute("/letter")({
  head: () => ({ meta: [{ title: "GP Letter Generator: Hugh's OSCE Case Generator" }] }),
  component: LetterPage,
});

const TYPES = ["Summary letter","Urgent referral","Treat-and-refer letter","Emergency handover","Medical certificate"] as const;

function LetterPage() {
  const [type, setType] = useState<typeof TYPES[number]>("Treat-and-refer letter");
  const [name, setName] = useState("Patient name, DOB, contact");
  const [presenting, setPresenting] = useState("Brief presenting complaint and duration");
  const [history, setHistory] = useState("Key positive history and relevant negatives");
  const [vitals, setVitals] = useState("BP, HR, RR, SpO₂, temp");
  const [exam, setExam] = useState("Examination findings");
  const [dx, setDx] = useState("Working diagnosis");
  const [tx, setTx] = useState("Treatment commenced");
  const [reason, setReason] = useState("Reason for referral");
  const [followUp, setFollowUp] = useState("Requested follow-up timeframe");
  const [pharmacist, setPharmacist] = useState("Pharmacist name, AHPRA, pharmacy details");

  const letter = useMemo(() => `Dear GP,

I (Introduction): ${pharmacist}.

S (Situation): ${type} regarding ${name}.

B (Background):
• Presenting: ${presenting}
• History: ${history}
• Vitals: ${vitals}
• Examination: ${exam}

A (Assessment):
• Working diagnosis: ${dx}
• Treatment commenced today: ${tx}

R (Recommendation):
• Reason for referral: ${reason}
• Requested follow-up: ${followUp}

I have provided protocol-aligned safety-net advice. Please contact me with any questions.

Kind regards,
${pharmacist}`, [type, name, presenting, history, vitals, exam, dx, tx, reason, followUp, pharmacist]);

  return (
    <div>
      <PageHeader eyebrow="GP Letter Generator" title="ISBAR-structured letters." subtitle="Fill in the inputs to generate a clear referral or handover letter." />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="handbook-card p-5 space-y-3">
          <Field label="Letter type">
            <select value={type} onChange={(e) => setType(e.target.value as typeof TYPES[number])} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Patient details"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Presenting complaint"><textarea value={presenting} onChange={(e) => setPresenting(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Relevant history"><textarea value={history} onChange={(e) => setHistory(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Vitals"><input value={vitals} onChange={(e) => setVitals(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Examination"><textarea value={exam} onChange={(e) => setExam(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Working diagnosis"><input value={dx} onChange={(e) => setDx(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Treatment given"><input value={tx} onChange={(e) => setTx(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Reason for referral"><textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Follow-up requested"><input value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
          <Field label="Pharmacist / pharmacy"><input value={pharmacist} onChange={(e) => setPharmacist(e.target.value)} className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm" /></Field>
        </div>
        <Section title="Generated letter">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{letter}</pre>
          <button onClick={() => navigator.clipboard.writeText(letter)} className="mt-3 rounded-md bg-navy text-navy-foreground px-3 py-2 text-sm">Copy to clipboard</button>
        </Section>
      </div>
      <PageSourcesDrawer
        label="Letter framework"
        sources={[
          { id: "isbar", title: "ISBAR clinical handover framework (ACSQHC)", reliability: "clinical-guideline", url: "https://www.safetyandquality.gov.au/our-work/clinical-communications/clinical-handover" },
        ]}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
