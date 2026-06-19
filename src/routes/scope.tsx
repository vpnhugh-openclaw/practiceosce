import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PROTOCOLS } from "@/data/protocols";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { ScopeDecisionBadge, ProtocolCheckWarning } from "@/components/osce/ScopeBadges";
import type { ScopeStatus } from "@/lib/types";

export const Route = createFileRoute("/scope")({
  head: () => ({ meta: [{ title: "Scope Checker: Hugh's OSCE Case Generator" }] }),
  component: ScopePage,
});

function ScopePage() {
  const [conditionId, setConditionId] = useState(PROTOCOLS[0].id);
  const [age, setAge] = useState(30);
  const [pregnancy, setPregnancy] = useState(false);
  const [immunocompromised, setImmunocompromised] = useState(false);
  const [redFlag, setRedFlag] = useState(false);
  const [emotionalImpact, setEmotionalImpact] = useState(false);
  const [previousDx, setPreviousDx] = useState(false);

  const p = PROTOCOLS.find((x) => x.id === conditionId)!;

  const result = useMemo<{ status: ScopeStatus; reason: string; phrase: string }>(() => {
    if (redFlag)
      return {
        status: "emergency",
        reason:
          "A red flag for this condition is present: refer urgently per Queensland Health protocol.",
        phrase: "I'm concerned about a red flag and I'd like to arrange urgent referral.",
      };
    if (p.minimumAge && age < p.minimumAge)
      return {
        status: "refer-only",
        reason: `Below protocol minimum age (${p.minimumAge}).`,
        phrase:
          "This is outside what I can manage as a pharmacist prescriber: let's arrange a GP review.",
      };
    if (p.maximumAge && age > p.maximumAge)
      return {
        status: "refer-only",
        reason: `Above protocol maximum age (${p.maximumAge}).`,
        phrase: "I'll arrange a GP review as this is outside my prescribing scope.",
      };
    if (pregnancy && !p.id.includes("contracept"))
      return {
        status: "refer-only",
        reason:
          "Pregnancy / breastfeeding: refer for a pregnancy-compatible plan unless protocol explicitly covers.",
        phrase: "Because you're pregnant I'd like your GP to choose the safest treatment.",
      };
    if (immunocompromised)
      return {
        status: "refer-only",
        reason: "Immunocompromise typically excludes pharmacist prescribing scope.",
        phrase: "Given your immune system needs extra care, GP review is the safest plan.",
      };
    if (p.previousDiagnosisRequired && !previousDx)
      return {
        status: "refer-only",
        reason: "Previous diagnosis required for this protocol; refer for assessment.",
        phrase: "Because this is a new diagnosis, your GP needs to assess first.",
      };
    if (emotionalImpact)
      return {
        status: "treat-and-refer",
        reason: "Marked emotional / functional impact triggers treat-and-refer per protocol.",
        phrase:
          "I'll start treatment today and also refer you to your GP because this is really affecting you.",
      };
    return {
      status: "in-scope",
      reason:
        "Within scope based on inputs: proceed with protocol-consistent management and safety-net.",
      phrase: "This is within what I can manage today. Let me explain the plan.",
    };
  }, [age, pregnancy, immunocompromised, redFlag, emotionalImpact, previousDx, p]);

  return (
    <div>
      <PageHeader
        eyebrow="Scope Checker"
        title="Quick scope decision."
        subtitle="Enter the key risk inputs to get a protocol-aligned scope decision and suggested OSCE wording."
      />

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div className="handbook-card p-5 space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Condition
            </span>
            <select
              value={conditionId}
              onChange={(e) => setConditionId(e.target.value)}
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
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Age</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
            />
          </label>
          <Toggle label="Pregnant / breastfeeding" v={pregnancy} on={setPregnancy} />
          <Toggle label="Immunocompromised" v={immunocompromised} on={setImmunocompromised} />
          <Toggle label="Red flag present for this condition" v={redFlag} on={setRedFlag} />
          <Toggle
            label="Marked emotional / functional impact"
            v={emotionalImpact}
            on={setEmotionalImpact}
          />
          {p.previousDiagnosisRequired && (
            <Toggle label="Previous diagnosis on file" v={previousDx} on={setPreviousDx} />
          )}
        </div>

        <div className="space-y-4">
          <div className="handbook-card p-5">
            <ScopeDecisionBadge status={result.status} size="lg" />
            <p className="mt-3 text-sm leading-relaxed">{result.reason}</p>
            <p className="mt-3 text-sm italic bg-parchment rounded-md px-3 py-2">
              "{result.phrase}"
            </p>
          </div>
          <ProtocolCheckWarning />
          <Section title="Protocol summary: key criteria">
            <div className="text-sm space-y-2">
              <p>
                <strong>Treat-and-refer triggers:</strong> {p.treatAndReferCriteria.join("; ")}
              </p>
              <p>
                <strong>Emergency:</strong> {p.emergencyReferralCriteria.join("; ")}
              </p>
              <p>
                <strong>Out of scope:</strong> {p.outOfScopeCriteria.join("; ")}
              </p>
              <p>
                <strong>Review:</strong> {p.reviewTime}
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (b: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} /> {label}
    </label>
  );
}
