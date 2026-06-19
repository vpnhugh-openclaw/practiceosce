import { createFileRoute } from "@tanstack/react-router";
import { EXAMINATION_SKILLS } from "@/data/examinations";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { AbdominalMap } from "@/components/osce/AbdominalMap";

export const Route = createFileRoute("/examination")({
  head: () => ({ meta: [{ title: "Examination Skills — Hugh's OSCE Case Generator" }] }),
  component: ExaminationPage,
});

function ExaminationPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Examination Skills"
        title="OSCE-ready examination checklists."
        subtitle="GALS, respiratory, ENT, abdominal and cardiovascular — what to say, what to do, what it means."
      />

      <Section title="Nine-region abdominal map" defaultOpen>
        <p className="text-sm text-muted-foreground mb-3">
          Localise pain to a region to surface focused differentials and the next exam step.
        </p>
        <AbdominalMap />
      </Section>

      <div className="space-y-4 mt-4">
        {EXAMINATION_SKILLS.map((s) => (
          <Section key={s.id} title={s.name}>
            <p className="text-sm text-muted-foreground mb-3">{s.intro}</p>
            <div className="grid md:grid-cols-2 gap-3">
              {s.sections.map((sec) => (
                <div key={sec.heading} className="rounded-md border border-border bg-parchment/50 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy mb-1.5">{sec.heading}</p>
                  <ul className="text-sm space-y-1">{sec.steps.map((st, i) => <li key={i}>• {st}</li>)}</ul>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  );
}
