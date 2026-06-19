import { createFileRoute } from "@tanstack/react-router";
import { PROTOCOLS } from "@/data/protocols";
import { PageHeader, Section, KV } from "@/components/osce/Primitives";
import { ProtocolConfidenceBadge } from "@/components/osce/ScopeBadges";

export const Route = createFileRoute("/protocols")({
  head: () => ({ meta: [{ title: "Condition Protocol Cards: Hugh's OSCE Case Generator" }] }),
  component: ProtocolsPage,
});

function ProtocolsPage() {
  return (
    <div>
      <PageHeader eyebrow="Condition Protocol Cards" title="Quick clinical reference." subtitle="Age limits, in/out-of-scope criteria, red flags, review times and communication frameworks per condition. Always verify the latest Queensland Health clinical practice guideline before prescribing." />
      <div className="space-y-4">
        {PROTOCOLS.map((p) => (
          <Section key={p.id} title={p.conditionName} badge={<ProtocolConfidenceBadge confidence={p.protocolConfidence} />} defaultOpen={false}>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Eligibility</p>
                <KV k="Category" v={p.category} />
                {p.minimumAge && <KV k="Min age" v={p.minimumAge} />}
                {p.maximumAge && <KV k="Max age" v={p.maximumAge} />}
                {p.previousDiagnosisRequired && <KV k="Previous Dx" v="Required" />}
                <KV k="Review" v={p.reviewTime} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">In scope</p>
                <ul className="mb-2">{p.inScopeCriteria.map((s) => <li key={s}>• {s}</li>)}</ul>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Out of scope</p>
                <ul>{p.outOfScopeCriteria.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Treat & refer triggers</p>
                <ul className="mb-2">{p.treatAndReferCriteria.map((s) => <li key={s}>• {s}</li>)}</ul>
                <p className="text-[11px] uppercase tracking-wide text-destructive mb-1">Emergency referral</p>
                <ul>{p.emergencyReferralCriteria.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-destructive mb-1">Red flags</p>
                <ul className="mb-2">{p.redFlags.map((s) => <li key={s}>• {s}</li>)}</ul>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Vaccination prompts</p>
                <ul>{p.vaccinationPrompts.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Non-pharmacological advice</p>
                <ul className="mb-2 columns-2">{p.nonPharmacologicalAdvice.map((s) => <li key={s}>• {s}</li>)}</ul>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Pharmacological options (class only: verify dose)</p>
                <ul className="mb-2">{p.pharmacologicalOptions.map((s) => <li key={s}>• {s}</li>)}</ul>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Common OSCE traps</p>
                <ul>{p.commonTraps.map((s) => <li key={s}>• {s}</li>)}</ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mt-3">Source: {p.protocolSource} · Version: {p.protocolVersion}</p>
          </Section>
        ))}
      </div>
    </div>
  );
}
