import type { OSCECase } from "@/lib/types";
import {
  ScopeDecisionBadge,
  ProtocolConfidenceBadge,
  ProtocolCheckWarning,
  RedFlagBox,
} from "./ScopeBadges";
import { Section, KV, HiddenReveal } from "./Primitives";
import { Clock, User, FileText, Activity } from "lucide-react";

export function CandidateStemCard({ c }: { c: OSCECase }) {
  return (
    <div className="handbook-card p-6 bg-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <FileText className="h-3.5 w-3.5" />
        <span>Candidate instructions</span>
        <span className="mx-1">·</span>
        <Clock className="h-3.5 w-3.5" />
        <span>{c.timeMinutes} min station</span>
      </div>
      <h2 className="font-display text-2xl text-navy mb-3">{c.title}</h2>
      <p className="text-foreground leading-relaxed">{c.candidateStem}</p>
    </div>
  );
}

export function ReadingTimeSkeleton({ c }: { c: OSCECase }) {
  const cols: { title: string; rows: string[] }[] = [
    {
      title: "Presenting / Focused / Red flags",
      rows: [
        "Presenting complaint",
        "Focused questions (SOCRATES)",
        "Red flags to screen",
        "Hidden answers",
      ],
    },
    {
      title: "SNAP / Vitals / Examination",
      rows: [
        "SNAP lifestyle",
        "Vitals to request",
        "Examination to perform",
        "Findings to interpret",
      ],
    },
    {
      title: "PMHx / Allergies / Family / Vaccinations",
      rows: [
        "Medical history",
        "Medications & allergies",
        "Pregnancy / breastfeeding",
        "Family & vaccination history",
      ],
    },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cols.map((col) => (
        <div key={col.title} className="handbook-card p-4 bg-parchment/60">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
            {col.title}
          </p>
          <ul className="space-y-1.5">
            {col.rows.map((r) => (
              <li key={r} className="text-sm border-b border-dashed border-border/60 pb-1.5">
                {r}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function VitalsRevealPanel({ vitals }: { vitals: Record<string, string> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {Object.entries(vitals).map(([k, v]) => (
        <HiddenReveal key={k} label={k}>
          <span className="font-mono">{v}</span>
        </HiddenReveal>
      ))}
    </div>
  );
}

export function ExaminationRevealPanel({ findings }: { findings: Record<string, string> }) {
  return (
    <div className="space-y-2">
      {Object.entries(findings).map(([k, v]) => (
        <HiddenReveal key={k} label={k}>
          <span>{v}</span>
        </HiddenReveal>
      ))}
    </div>
  );
}

export function PatientProfileCard({ c }: { c: OSCECase }) {
  return (
    <div className="handbook-card p-5 bg-teal/30">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-teal-foreground mb-3">
        <User className="h-3.5 w-3.5" />
        Patient profile
      </div>
      <KV k="Name" v={c.patientProfile.name} />
      <KV k="Age" v={c.patientProfile.age} />
      <KV k="Gender" v={c.patientProfile.gender} />
      {c.patientProfile.ethnicity && <KV k="Ethnicity" v={c.patientProfile.ethnicity} />}
      {c.patientProfile.occupation && <KV k="Occupation" v={c.patientProfile.occupation} />}
      {c.patientProfile.pregnancy && <KV k="Pregnancy" v={c.patientProfile.pregnancy} />}
    </div>
  );
}

export function ClinicalReasoningPanel({ c }: { c: OSCECase }) {
  return (
    <div className="handbook-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
        <Activity className="h-3.5 w-3.5" />
        Expected clinical reasoning
      </p>
      <p className="text-sm leading-relaxed italic">"{c.clinicalReasoning}"</p>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            Working diagnosis
          </p>
          <p className="text-sm font-medium">{c.expectedDiagnosis}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            Differentials
          </p>
          <ul className="text-sm">
            {c.differentials.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ScopeSummary({ c }: { c: OSCECase }) {
  return (
    <div className="handbook-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <ScopeDecisionBadge status={c.scopeDecision} size="lg" />
        <ProtocolConfidenceBadge confidence={c.protocolConfidence} />
      </div>
      <p className="text-sm leading-relaxed">{c.protocolReasoning}</p>
    </div>
  );
}

export function TreatmentPlanCard({ c }: { c: OSCECase }) {
  return (
    <Section title="Pharmacological plan (class level)">
      <ul className="text-sm space-y-1 mb-4">
        {c.treatmentPlanClass.length === 0 && (
          <li className="text-muted-foreground italic">
            No pharmacological therapy: referral pathway only.
          </li>
        )}
        {c.treatmentPlanClass.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
      <ProtocolCheckWarning>{c.treatmentPlanNotes}</ProtocolCheckWarning>
    </Section>
  );
}

export function NonPharmCard({ c }: { c: OSCECase }) {
  return (
    <Section title="Non-pharmacological plan">
      <ul className="text-sm space-y-1.5">
        {c.nonPharmPlan.map((t) => (
          <li key={t}>• {t}</li>
        ))}
      </ul>
    </Section>
  );
}

export function SafetyNetCard({ c }: { c: OSCECase }) {
  return (
    <Section title="Safety net & follow-up">
      <div className="mb-3 text-sm">
        <span className="font-medium">Review:</span> {c.reviewTime || "Per protocol"}
      </div>
      <ul className="text-sm space-y-1.5 mb-3">
        {c.safetyNet.map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ul>
      {c.referralPlan && (
        <div className="text-sm bg-parchment rounded-md px-3 py-2">
          <span className="font-medium">Referral plan:</span> {c.referralPlan}
        </div>
      )}
    </Section>
  );
}

export function CaseRedFlags({ c }: { c: OSCECase }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <RedFlagBox title="Red flags present in this case" items={c.redFlagsPresent} />
      <RedFlagBox title="Red flags to actively screen" items={c.redFlagsToScreen} />
    </div>
  );
}
