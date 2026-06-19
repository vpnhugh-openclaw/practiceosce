import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PROTOCOLS } from "@/data/protocols";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";

export const Route = createFileRoute("/safetynet")({
  head: () => ({ meta: [{ title: "Safety-Net Builder: Hugh's OSCE Case Generator" }] }),
  component: SafetyNetPage,
});

function SafetyNetPage() {
  const [id, setId] = useState(PROTOCOLS[0].id);
  const [patientName, setPatientName] = useState("the patient");
  const [refer, setRefer] = useState(false);
  const p = PROTOCOLS.find((x) => x.id === id)!;

  const script = useMemo(() => {
    const flags = p.redFlags.slice(0, 4).join(", ");
    return `Thank you, ${patientName}. To summarise the plan: I've started treatment for ${p.conditionName.toLowerCase()} and given you advice on lifestyle measures.

Please come back sooner: or seek urgent medical care: if you develop any of the following: ${flags}, or any other symptom that concerns you.

I'd like to review you again in ${p.reviewTime.toLowerCase()}.${refer ? ` I'm also going to write to your GP today so they can follow up, because of the features we discussed.` : ""}

Do you have any questions? Can you tell me back in your own words what you'll watch out for?`;
  }, [p, patientName, refer]);

  const gpParagraph = useMemo(
    () =>
      `Dear GP,\n\nI saw ${patientName} today as part of the Queensland pharmacist prescribing service for ${p.conditionName.toLowerCase()}. ${refer ? "I have commenced protocol-aligned management and am referring for your review because: " + p.treatAndReferCriteria.slice(0, 2).join("; ") + "." : "I have commenced protocol-aligned management with safety-net advice."}\n\nI have asked them to return for review in ${p.reviewTime.toLowerCase()}, or sooner for any red-flag features (${p.redFlags.slice(0, 3).join(", ")}).\n\nKind regards,\n[Pharmacist name]`,
    [p, patientName, refer],
  );

  return (
    <div>
      <PageHeader
        eyebrow="Safety-Net Builder"
        title="Generate patient-specific wording."
        subtitle="Pick a condition, tweak the inputs and get a safety-net script and GP referral paragraph aligned with the relevant review-time table."
      />

      <div className="handbook-card p-5 mb-5 grid md:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Condition
          </span>
          <select
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            {PROTOCOLS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.conditionName}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Patient name
          </span>
          <input
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm pt-5">
          <input type="checkbox" checked={refer} onChange={(e) => setRefer(e.target.checked)} /> GP
          referral required
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Patient-friendly safety-net script">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{script}</pre>
        </Section>
        <Section title="GP letter paragraph (ISBAR-aligned)">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{gpParagraph}</pre>
        </Section>
      </div>

      <PageSourcesDrawer
        needsVerification
        verificationNotes={[
          "Red-flag lists and review times are derived from the seeded protocol cards. Confirm against the current Queensland Health pharmacist prescribing protocol for the specific condition before giving the script to a patient.",
        ]}
      />
    </div>
  );
}
