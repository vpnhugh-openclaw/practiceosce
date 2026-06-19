/**
 * Case enrichment layer.
 *
 * Applies derived defaults to every OSCECase before it reaches the UI:
 *   - referralClassification    (mapped from scopeDecision + clinical severity)
 *   - viva                       (5 case-specific Q&A blocks if none authored)
 *   - sbar                       (SBAR scaffold for any referral case)
 *   - sourceTags                 (category-based defaults if none authored)
 *   - vitals                     (normal vitals for low-acuity cases that omitted them)
 *   - treatmentPlanClass         (placeholder for refer-only / emergency)
 *   - verificationNotes          (carries the "verify against current protocol" line)
 *
 * The enrichment is purely additive: existing case content is never overwritten.
 * This lets us repair all 51 cases in one pass without touching each literal.
 */

import type {
  OSCECase,
  ReferralClassification,
  SourceTag,
  VivaQA,
  ConditionCategory,
} from "@/lib/types";

// ---------- Referral classification ----------

const HYPOXIA_RE = /(spo|sat|oxygen)[^0-9]*([0-8]\d|9[01])\b/i;
const URGENT_TERMS = [
  "severe dehydration", "haematemes", "hematemes", "melaena", "melena",
  "haemoptys", "hemoptys", "stridor", "cyanos", "silent chest",
  "anaphylax", "drowsy", "unconscious", "uncons",
  "suspected mastoiditis", "mastoiditis", "facial nerve",
  "septic", "sepsis", "rigid abdomen", "peritonit",
];
const EMERGENCY_TERMS = [
  "chest pain", "crushing", "acs", "myocardial",
  "anaphylax", "silent chest", "cyanos", "stridor at rest",
  "unconscious", "uncons", "rigid abdomen", "peritonit",
  "haematemes", "hematemes", "massive bleed",
];

function corpusOf(c: OSCECase): string {
  return [
    c.candidateStem, c.condition, c.expectedDiagnosis,
    c.clinicalReasoning, c.protocolReasoning, c.referralPlan,
    ...(c.redFlagsPresent ?? []),
    ...(c.criticalFails ?? []),
    ...Object.values(c.vitals ?? {}),
    ...Object.values(c.examinationFindings ?? {}),
  ].join(" ").toLowerCase();
}

function deriveReferralClassification(c: OSCECase): ReferralClassification {
  if (c.referralClassification) return c.referralClassification;
  const corpus = corpusOf(c);
  const presentRF = (c.redFlagsPresent ?? []).join(" ").toLowerCase();
  const hypoxic = HYPOXIA_RE.test(corpus);
  const hasEmergency = hypoxic
    || EMERGENCY_TERMS.some((t) => corpus.includes(t))
    || EMERGENCY_TERMS.some((t) => presentRF.includes(t));
  const hasUrgent = URGENT_TERMS.some((t) => corpus.includes(t))
    || URGENT_TERMS.some((t) => presentRF.includes(t))
    || (c.scopeDecision === "refer-only" && (c.redFlagsPresent ?? []).length > 0);

  if (c.scopeDecision === "emergency" || hasEmergency) return "emergency-referral";
  if (c.scopeDecision === "refer-only") return hasUrgent ? "urgent-referral" : "refer-only";
  if (c.scopeDecision === "treat-and-refer") return hasUrgent ? "urgent-referral" : "treat-and-refer";
  if (c.scopeDecision === "in-scope") return "pharmacist-manageable";
  return "treat-and-refer";
}

function isReferralClass(rc: ReferralClassification): boolean {
  return rc !== "pharmacist-manageable";
}

// ---------- Case-specific viva ----------

function deriveViva(c: OSCECase, rc: ReferralClassification): VivaQA[] {
  if ((c.viva?.length ?? 0) >= 5) return c.viva!;
  const dx = c.expectedDiagnosis || c.condition;
  const diffs = c.differentials.length ? c.differentials.join(", ") : "broader category review";
  const present = (c.redFlagsPresent ?? []).join("; ") || "none identified";
  const screen = (c.redFlagsToScreen ?? []).join("; ") || "condition-specific alarms";
  const tx = c.treatmentPlanClass.length ? c.treatmentPlanClass.join("; ") : "no autonomous prescribing in this case";
  const nonPharm = (c.nonPharmPlan ?? []).join("; ") || "tailored lifestyle and trigger advice";
  const sn = (c.safetyNet ?? []).join("; ") || "return if symptoms worsen or new red flags develop";
  const pregBF = c.fakePatientScript?.pregnancyBreastfeeding || "not relevant in this case";
  const allergies = c.fakePatientScript?.allergies || "NKDA";

  const referralLine =
    rc === "emergency-referral" ? "Emergency referral: ED or ambulance depending on severity."
    : rc === "urgent-referral" ? "Urgent referral: same-day GP or ED."
    : rc === "refer-only" ? "Refer only: no autonomous prescribing in this scope."
    : rc === "treat-and-refer" ? "Treat the in-scope component and refer the remainder."
    : "Pharmacist-manageable under the relevant Queensland Health protocol.";

  const custom: VivaQA[] = [
    {
      question: `For ${c.patientProfile.name || "this patient"} with ${c.condition}, what is your working diagnosis and your top differentials?`,
      modelAnswer: `Working diagnosis: ${dx}. Differentials: ${diffs}. Reasoning: ${c.clinicalReasoning || "match presentation against the protocol's in-scope criteria."}`,
    },
    {
      question: `Which red flags would change your scope decision in this case, and which are present?`,
      modelAnswer: `Present in this case: ${present}. Actively screen for: ${screen}. Any positive shifts to urgent or emergency referral. Verify against the current pharmacist prescribing protocol before use.`,
    },
    {
      question: `Justify your referral classification (${rc}) against the protocol and the clinical picture.`,
      modelAnswer: `${referralLine} Protocol reasoning: ${c.protocolReasoning || "match the case against in-scope vs out-of-scope criteria."} Allergy status: ${allergies}. Pregnancy/breastfeeding: ${pregBF}.`,
    },
    {
      question: `What is your management plan (pharmacological class and non-pharmacological advice) and what would you NOT do?`,
      modelAnswer: `Pharmacological (class only): ${tx}. Non-pharmacological: ${nonPharm}. Avoid: prescribing outside protocol scope, missing red flags, dosing without verifying against the current Queensland Health protocol.`,
    },
    {
      question: `Outline your safety-net, review time, and how you would hand over if referring.`,
      modelAnswer: `Review: ${c.reviewTime || "per protocol"}. Safety-net: ${sn}. Handover: SBAR to the GP or ED with presenting complaint, relevant history, red-flag screen, examination findings, and the urgency of review requested.`,
    },
  ];
  // Preserve any author-written viva first, fill up to 5.
  const existing = c.viva ?? [];
  const merged = [...existing];
  for (const q of custom) {
    if (merged.length >= 5) break;
    if (!merged.find((m) => m.question === q.question)) merged.push(q);
  }
  return merged.slice(0, 5);
}

// ---------- SBAR ----------

function deriveSbar(c: OSCECase, rc: ReferralClassification): OSCECase["sbar"] {
  if (c.sbar?.situation || c.sbar?.assessment || c.sbar?.recommendation) return c.sbar;
  if (!isReferralClass(rc)) return c.sbar;
  const pt = c.patientProfile;
  const pregBF = c.fakePatientScript?.pregnancyBreastfeeding;
  const pregNote = pregBF && /pregnan|breastfeed|lactat|trimester/i.test(pregBF) ? ` ${pregBF}.` : "";
  const urgencyLine =
    rc === "emergency-referral"
      ? "Emergency referral required. Advise immediate ED review or ambulance depending on severity."
      : rc === "urgent-referral"
        ? "Urgent referral requested: same-day GP or ED review."
        : rc === "refer-only"
          ? "Refer for GP assessment. No prescribing performed in pharmacy."
          : "GP review requested for the out-of-scope component; in-scope care provided in pharmacy.";

  return {
    situation: `${pt.name || "Patient"}, ${pt.age}${pt.gender ? "y " + pt.gender : "y"}, presents with ${c.condition}. Reason for referral: ${c.referralPlan || urgencyLine}`,
    background: `PMHx: ${c.fakePatientScript?.medicalHistory || "nil significant"}. Medicines: ${c.fakePatientScript?.medications || "nil regular"}. Allergies: ${c.fakePatientScript?.allergies || "NKDA"}.${pregNote} Social: ${c.fakePatientScript?.socialContext || "n/a"}.`,
    assessment: `Findings: ${Object.entries(c.examinationFindings ?? {}).map(([k, v]) => `${k}: ${v}`).join("; ") || "see notes"}. Vitals: ${Object.entries(c.vitals ?? {}).map(([k, v]) => `${k} ${v}`).join(", ") || "not recorded"}. Red flags present: ${(c.redFlagsPresent ?? []).join("; ") || "none"}. Likely: ${c.expectedDiagnosis}. Differentials: ${c.differentials.join(", ") || "see case"}.`,
    recommendation: urgencyLine,
  };
}

// ---------- Source tags ----------

const DEFAULT_SOURCE_BY_CATEGORY: Record<ConditionCategory, SourceTag[]> = {
  Respiratory: [
    { id: "qh-resp", title: "Queensland Health pharmacist prescribing protocol (respiratory)", reliability: "government-protocol", locator: "Source imported, page reference pending." },
    { id: "aah", title: "Australian Asthma Handbook", reliability: "clinical-guideline" },
    { id: "copdx", title: "COPD-X Guidelines", reliability: "clinical-guideline" },
  ],
  ENT: [
    { id: "qh-ent", title: "Queensland Health pharmacist prescribing protocol (ENT)", reliability: "government-protocol", locator: "Source imported, page reference pending." },
    { id: "tg-ent", title: "Therapeutic Guidelines: ENT", reliability: "clinical-guideline" },
  ],
  Gastrointestinal: [
    { id: "qh-gi", title: "Queensland Health pharmacist prescribing protocol (GI)", reliability: "government-protocol", locator: "Source imported, page reference pending." },
    { id: "tg-gi", title: "Therapeutic Guidelines: Gastrointestinal", reliability: "clinical-guideline" },
  ],
  Dermatology: [
    { id: "qh-derm", title: "Queensland Health pharmacist prescribing protocol (skin)", reliability: "government-protocol", locator: "Source imported, page reference pending." },
    { id: "tg-derm", title: "Therapeutic Guidelines: Dermatology", reliability: "clinical-guideline" },
  ],
  Cardiovascular: [
    { id: "racgp-cv", title: "RACGP cardiovascular guidance", reliability: "clinical-guideline" },
  ],
  "Women's health": [
    { id: "qh-uti", title: "Queensland Health pharmacist prescribing protocol (UTI)", reliability: "government-protocol", locator: "Source imported, page reference pending." },
    { id: "tg-wh", title: "Therapeutic Guidelines: Women's health", reliability: "clinical-guideline" },
  ],
  Musculoskeletal: [
    { id: "tg-msk", title: "Therapeutic Guidelines: Musculoskeletal", reliability: "clinical-guideline" },
  ],
  "Weight management": [
    { id: "racgp-obesity", title: "RACGP obesity management", reliability: "clinical-guideline" },
  ],
  "Smoking cessation": [
    { id: "racgp-smoking", title: "RACGP smoking cessation guidelines", reliability: "clinical-guideline" },
    { id: "quitline", title: "Quitline / Department of Health", reliability: "patient-education" },
  ],
  "Oral health": [
    { id: "tg-oral", title: "Therapeutic Guidelines: Oral and dental", reliability: "clinical-guideline" },
  ],
  "Travel health": [
    { id: "tg-travel", title: "Therapeutic Guidelines: Travel", reliability: "clinical-guideline" },
  ],
  "Wound management": [
    { id: "tg-wound", title: "Therapeutic Guidelines: Wound management", reliability: "clinical-guideline" },
  ],
};

const COMMON_SOURCES: SourceTag[] = [
  { id: "monash-osce", title: "Monash OSCE Prep info", reliability: "osce-training", locator: "Case structure, examination flow, OSCE timing." },
  { id: "amh", title: "Australian Medicines Handbook", reliability: "medicines-reference" },
];

function deriveSourceTags(c: OSCECase): SourceTag[] {
  if (c.sourceTags && c.sourceTags.length > 0) return c.sourceTags;
  const cat = DEFAULT_SOURCE_BY_CATEGORY[c.category] ?? [];
  return [...cat, ...COMMON_SOURCES];
}

// ---------- Vitals defaults ----------

const NORMAL_VITALS: Record<string, string> = {
  HR: "78",
  BP: "118/76",
  Temp: "36.7",
  RR: "16",
  SpO2: "98%",
};

function shouldFillVitals(c: OSCECase): boolean {
  if (Object.keys(c.vitals ?? {}).length > 0) return false;
  // Don't auto-fill if the case explicitly mentions hypoxia, severe distress, or shock.
  const corpus = corpusOf(c);
  if (HYPOXIA_RE.test(corpus)) return false;
  if (/severe (dehydration|distress|sepsis|shock)|silent chest|cyanos/.test(corpus)) return false;
  return true;
}

function deriveVitals(c: OSCECase): Record<string, string> {
  if (!shouldFillVitals(c)) return c.vitals ?? {};
  // Normal vitals signal a low-acuity baseline. Examiner can still escalate.
  return { ...NORMAL_VITALS };
}

// ---------- Treatment plan ----------

function deriveTreatmentPlan(c: OSCECase, rc: ReferralClassification): { cls: string[]; notes: string } {
  if (c.treatmentPlanClass && c.treatmentPlanClass.length > 0) {
    return { cls: c.treatmentPlanClass, notes: c.treatmentPlanNotes };
  }
  if (rc === "emergency-referral" || rc === "urgent-referral" || rc === "refer-only") {
    return {
      cls: [
        "No autonomous prescribing in this scope",
        "Supportive care only if appropriate",
        "Urgent referral and SBAR handover",
        "Document advice, refusal, and safety-net",
      ],
      notes: c.treatmentPlanNotes || "Dose and eligibility must be verified against the current pharmacist prescribing protocol before clinical use.",
    };
  }
  return {
    cls: ["Class-level option per protocol (dose pending verification)"],
    notes: c.treatmentPlanNotes || "Dose and eligibility must be verified against the current pharmacist prescribing protocol before clinical use.",
  };
}

// ---------- Verification notes ----------

function deriveVerificationNotes(c: OSCECase): string[] | undefined {
  const existing = c.verificationNotes ?? [];
  const note = "Dose and eligibility must be verified against the current pharmacist prescribing protocol before clinical use.";
  if (existing.includes(note)) return existing;
  if (c.protocolConfidence === "high") return existing.length ? existing : undefined;
  return [...existing, note];
}

// ---------- Auto-documented reasoning ----------

const CARDIAC_TRIGGER_RE = /chest pain|retrosternal|epigastr|chest tight|chest heav|radiat|left arm|jaw|diaphor|heartburn|indigestion/i;

function deriveRedFlagsToScreen(c: OSCECase): string[] {
  const existing = c.redFlagsToScreen ?? [];
  const corpus = corpusOf(c);
  const triggersCardiac = CARDIAC_TRIGGER_RE.test(corpus);
  const alreadyMentions = existing.some((r) => /cardiac|acs|angina|ischaem|ischem|myocard/i.test(r));
  if (triggersCardiac && !alreadyMentions) {
    return [...existing, "Cardiac mimics (ACS, angina): screened and excluded based on age, risk factors, and pain character"];
  }
  return existing;
}

function derivePregnancyAwareReasoning(c: OSCECase): string {
  const pt = c.fakePatientScript?.pregnancyBreastfeeding ?? "";
  const isPregBF = /pregnan|breastfeed|lactat|trimester/i.test(pt);
  if (!isPregBF) return c.protocolReasoning;
  const mentions = /pregnan|breastfeed|lactat/i.test(c.protocolReasoning + " " + c.clinicalReasoning + " " + c.treatmentPlanNotes);
  if (mentions) return c.protocolReasoning;
  return `${c.protocolReasoning} Pregnancy/breastfeeding status (${pt.trim()}) directly affects medicine selection, dose, and the threshold for referral: verify each option against the relevant pregnancy/lactation reference before prescribing.`;
}

// ---------- Public API ----------

export function enrichCase(c: OSCECase): OSCECase {
  const rc = deriveReferralClassification(c);
  const viva = deriveViva(c, rc);
  const sbar = deriveSbar(c, rc);
  const sourceTags = deriveSourceTags(c);
  const vitals = deriveVitals(c);
  const { cls, notes } = deriveTreatmentPlan(c, rc);
  const verificationNotes = deriveVerificationNotes(c);
  const redFlagsToScreen = deriveRedFlagsToScreen(c);
  const protocolReasoning = derivePregnancyAwareReasoning(c);

  return {
    ...c,
    referralClassification: rc,
    viva,
    sbar,
    sourceTags,
    vitals,
    treatmentPlanClass: cls,
    treatmentPlanNotes: notes,
    verificationNotes,
    redFlagsToScreen,
    protocolReasoning,
  };
}

export function enrichAll(cases: OSCECase[]): OSCECase[] {
  return cases.map(enrichCase);
}
