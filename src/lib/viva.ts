// Viva helpers: guarantees every case exposes at least 5 viva-style Q&A blocks.
import type { OSCECase, VivaQA } from "./types";

function genericViva(c: OSCECase): VivaQA[] {
  return [
    {
      question: `What is your working diagnosis for this patient and what are your top differentials?`,
      modelAnswer: `Working diagnosis: ${c.expectedDiagnosis}. Differentials to consider: ${c.differentials.join(", ") || "broader category review"}. Reasoning: ${c.clinicalReasoning}`,
    },
    {
      question: `What red flags would change your management in this presentation?`,
      modelAnswer: `Actively screen for: ${(c.redFlagsToScreen || []).join("; ") || "condition-specific alarms"}. Present in this case: ${(c.redFlagsPresent || []).join("; ") || "none identified"}. Any red flag shifts scope toward urgent or emergency referral.`,
    },
    {
      question: `Justify your scope decision against the Queensland Health pharmacist prescribing protocol.`,
      modelAnswer: `Scope: ${c.scopeDecision}. ${c.protocolReasoning} Confirm against the current protocol: this app does not substitute for the live document.`,
    },
    {
      question: `Outline your safety-net and the timeframe for review.`,
      modelAnswer: `Review: ${c.reviewTime || "per protocol"}. Safety-net: ${(c.safetyNet || []).join("; ") || "return if symptoms worsen, fail to improve, or new red flags develop."}`,
    },
    {
      question: `What non-pharmacological advice would you give and how would you check the patient understood it?`,
      modelAnswer: `${(c.nonPharmPlan || []).join("; ") || "Tailored lifestyle and trigger advice."} Use teach-back: ask the patient to restate the plan and the warning signs in their own words.`,
    },
  ];
}

export function getViva(c: OSCECase): VivaQA[] {
  const base = c.viva ?? [];
  if (base.length >= 5) return base.slice(0, 5);
  const filler = genericViva(c).filter(
    (q) => !base.find((b) => b.question === q.question)
  );
  return [...base, ...filler].slice(0, 5);
}
