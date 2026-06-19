import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/osce/Primitives";

export const Route = createFileRoute("/references")({
  head: () => ({ meta: [{ title: "References — Hugh's OSCE Case Generator" }] }),
  component: ReferencesPage,
});

function ReferencesPage() {
  return (
    <div>
      <PageHeader eyebrow="References" title="Protocol sources." subtitle="Source hierarchy used by this app." />
      <Section title="Source hierarchy">
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>Current Queensland Health pharmacist prescribing protocols and clinical practice guidelines (highest authority).</li>
          <li><em>OSCE Prep Info – June 2026.pdf</em> (Monash) — primary source for the expanded ENT, GI and Respiratory case bank, roleplayer structures, examination findings, vitals, examiner key, differentials, red flags, scope boundaries and OSCE technique. Clinical case content and OSCE station structures were expanded from this document. Always verify prescribing decisions against current local pharmacist prescribing protocols.</li>
          <li><em>IPA Practice Exams.pdf</em> — used for case structure, examination skills and communication framework prompts. Treatment details cross-checked against Queensland Health protocol.</li>
          <li>Previously uploaded Hugh's OSCE Prep Site material and user-shared prescribing notes.</li>
        </ol>
      </Section>
      <Section title="Disclaimer">
        <p className="text-sm">
          This is a training tool. It must not be used as a substitute for checking the current Queensland Health clinical practice guideline, local legislation, professional judgement or university marking guidance. Where the IPA exam material gives a treatment that conflicts with a current Queensland Health protocol, the Queensland Health protocol overrides. If there is uncertainty about a current protocol position, this app deliberately shows class-level guidance only and flags <em>Needs protocol review</em>.
        </p>
      </Section>
    </div>
  );
}
