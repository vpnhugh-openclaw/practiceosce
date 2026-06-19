/**
 * Clinical guardrail validator.
 *
 * Runs a set of structural and clinical-consistency checks against every
 * OSCECase. Used by:
 *   - the Examiner view and Case-detail QA panel (status badge)
 *   - the /qa admin page (full grid)
 *   - the Practice page (blocks "critical" cases from timed use unless overridden)
 *   - the Viva page (flags missing custom viva blocks)
 *
 * The validator is intentionally conservative: it flags rather than rewrites.
 * Heuristics use lower-cased substring matches across the case's narrative
 * fields so it works for both seeded and future generated cases without a
 * structured vocabulary.
 */

import type { OSCECase, ReferralClassification } from "./types";

export type CheckLevel = "pass" | "warning" | "fail" | "needs-verification";

export interface CheckResult {
  id: string;
  label: string;
  level: CheckLevel;
  detail?: string;
  /** A failure of a "critical" check blocks timed practice unless overridden. */
  critical?: boolean;
}

export interface CaseValidationReport {
  caseId: string;
  results: CheckResult[];
  /** Roll-ups */
  passCount: number;
  warningCount: number;
  failCount: number;
  needsVerificationCount: number;
  criticalFailCount: number;
  /** True if any critical check failed: case should not be used in timed practice without override. */
  unsafeForTimedPractice: boolean;
  /** Worst-case overall level. */
  overall: CheckLevel;
}

// ---------- Small helpers ----------

const lc = (s: string | undefined) => (s ?? "").toLowerCase();
const joinLC = (...parts: Array<string | string[] | undefined | Record<string, string>>) =>
  parts
    .flatMap((p) => {
      if (!p) return [];
      if (Array.isArray(p)) return p;
      if (typeof p === "object") return Object.values(p);
      return [p];
    })
    .join(" ")
    .toLowerCase();

const anyOf = (hay: string, needles: string[]) => needles.some((n) => hay.includes(n));

const AI_FILLER = [
  "empower", "streamline", "seamless", "leverage",
  "cutting-edge", "holistic", "game-changing", "delve into",
  "in today's fast-paced", "navigate the complex",
  "real-world scenario", "robust solution",
  // NOTE: "elevate" intentionally NOT included: clinical usage ("elevate the
  // head of the bed", "elevate the limb") is legitimate. We only flag the
  // marketing phrase "elevate your".
];
const AI_FILLER_PHRASES = ["elevate your", "unlock your potential", "take it to the next level"];

// ---------- Per-check implementations ----------

function checkSources(c: OSCECase): CheckResult {
  const hasTags = (c.sourceTags?.length ?? 0) > 0;
  if (hasTags) {
    return { id: "source-tags", label: "Case has case-specific source tags", level: "pass" };
  }
  return {
    id: "source-tags",
    label: "Case has case-specific source tags",
    level: "needs-verification",
    detail: "Needs case-specific source tagging. Default Queensland Health protocol fallback is shown only for display continuity.",
  };
}

function checkSourceNotes(c: OSCECase): CheckResult {
  const ok = !!c.sourceNotes && c.sourceNotes.trim().length > 10;
  return {
    id: "source-notes",
    label: "Case has source reference",
    level: ok ? "pass" : "warning",
    detail: ok ? undefined : "No sourceNotes string on this case.",
  };
}

function checkDiagnosisConsistency(c: OSCECase): CheckResult {
  if (!c.expectedDiagnosis) {
    return {
      id: "diagnosis-consistency",
      label: "Diagnosis matches history",
      level: "fail",
      critical: true,
      detail: "No expectedDiagnosis recorded.",
    };
  }
  const dx = lc(c.expectedDiagnosis);
  const corpus = joinLC(
    c.candidateStem, c.condition, c.fakePatientScript?.openingLine,
    c.fakePatientScript?.mainComplaint, c.fakePatientScript?.socrates,
    c.fakePatientScript?.volunteer, c.clinicalReasoning,
  );

  // Diagnosis-pattern matrix. Each entry: terms expected somewhere in the narrative.
  const patterns: Array<{ dxIncludes: string[]; expect: string[]; reason: string }> = [
    { dxIncludes: ["otitis externa", "swimmer"], expect: ["pinna", "tragus", "canal", "swim", "water"], reason: "Otitis externa cases usually mention tragus/pinna tenderness, canal involvement or water exposure." },
    { dxIncludes: ["otitis media", "aom"], expect: ["ear pain", "earache", "tm", "tympanic", "fever", "child", "uri"], reason: "AOM cases usually mention ear pain plus URI features or TM findings." },
    { dxIncludes: ["allergic rhinitis"], expect: ["sneez", "itch", "watery", "bilateral", "season", "pollen", "dust"], reason: "Allergic rhinitis should fit sneeze/itch/watery/bilateral/seasonal pattern." },
    { dxIncludes: ["gord", "reflux", "heartburn"], expect: ["heartburn", "reflux", "retrosternal", "regurgitat", "epigastric", "after meal", "lying"], reason: "GORD should fit reflux/retrosternal/postprandial pattern." },
    { dxIncludes: ["asthma"], expect: ["wheeze", "reliever", "salbutamol", "cough", "short of breath", "sob"], reason: "Asthma cases should reference wheeze, reliever use or breathlessness." },
    { dxIncludes: ["copd"], expect: ["smok", "sputum", "wheeze", "breathless", "exacerbation"], reason: "COPD cases should reference smoking history, sputum or breathlessness pattern." },
    { dxIncludes: ["gastroenteritis", "food poison"], expect: ["diarrhoea", "vomit", "nausea", "abdominal", "loose"], reason: "Gastroenteritis cases should fit diarrhoea/vomiting/nausea pattern." },
    { dxIncludes: ["impetigo"], expect: ["crust", "honey", "vesic", "lesion", "skin", "rash"], reason: "Impetigo cases should reference honey-coloured crusting or vesicular lesions." },
    { dxIncludes: ["uti", "cystitis"], expect: ["dysuria", "frequency", "urgency", "burning", "urine"], reason: "UTI cases should fit dysuria/frequency/urgency pattern." },
  ];

  for (const p of patterns) {
    if (p.dxIncludes.some((d) => dx.includes(d))) {
      if (!anyOf(corpus, p.expect)) {
        return {
          id: "diagnosis-consistency",
          label: "Diagnosis matches history",
          level: "warning",
          detail: p.reason,
        };
      }
    }
  }
  return { id: "diagnosis-consistency", label: "Diagnosis matches history", level: "pass" };
}

function checkExamConsistency(c: OSCECase): CheckResult {
  const dx = lc(c.expectedDiagnosis);
  const exam = joinLC(c.examinationFindings);
  if (!exam.trim()) {
    return {
      id: "exam-consistency",
      label: "Examination findings match diagnosis",
      level: "warning",
      detail: "No examinationFindings recorded.",
    };
  }
  const rules: Array<{ dx: string[]; expect: string[]; reason: string }> = [
    { dx: ["otitis externa"], expect: ["tragus", "pinna", "canal", "discharge"], reason: "Otitis externa exam should reference tragus/pinna pain or external canal findings." },
    { dx: ["otitis media", "aom"], expect: ["tympanic", "tm ", "membrane", "bulg"], reason: "AOM exam should reference tympanic membrane appearance." },
    { dx: ["allergic rhinitis"], expect: ["turbinate", "conjunct", "rhinorr", "nasal", "shiner"], reason: "Allergic rhinitis exam should reference nasal turbinates or conjunctival/ocular findings." },
    { dx: ["asthma", "copd"], expect: ["wheeze", "auscult", "spo", "rr", "crackle"], reason: "Respiratory cases should reference auscultation, wheeze, RR or SpO₂." },
    { dx: ["gord", "reflux", "heartburn"], expect: ["epigastr", "abdomen", "tender", "soft"], reason: "GORD exam should reference abdominal/epigastric assessment." },
    { dx: ["gastroenteritis"], expect: ["abdomen", "bowel", "tender", "hydration", "mucous"], reason: "Gastroenteritis exam should reference abdomen, bowel sounds or hydration." },
    { dx: ["impetigo"], expect: ["lesion", "crust", "vesic", "lymph"], reason: "Impetigo exam should describe lesions, crusting or lymph nodes." },
  ];
  for (const r of rules) {
    if (r.dx.some((d) => dx.includes(d)) && !anyOf(exam, r.expect)) {
      return { id: "exam-consistency", label: "Examination findings match diagnosis", level: "warning", detail: r.reason };
    }
  }
  return { id: "exam-consistency", label: "Examination findings match diagnosis", level: "pass" };
}

function parseVital(v: string | undefined): number | null {
  if (!v) return null;
  const m = v.match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function checkVitalsSeverity(c: OSCECase): CheckResult {
  if (!c.vitals || Object.keys(c.vitals).length === 0) {
    return { id: "vitals-plausible", label: "Vitals are plausible", level: "warning", detail: "No vitals recorded." };
  }
  const v = c.vitals;
  const key = (re: RegExp) => {
    const k = Object.keys(v).find((x) => re.test(x.toLowerCase()));
    return k ? v[k] : undefined;
  };
  const spo2 = parseVital(key(/spo|sat|oxygen/));
  const rr = parseVital(key(/^rr$|resp/));
  const hr = parseVital(key(/^hr$|heart|pulse/));
  const temp = parseVital(key(/temp/));
  const scope = c.scopeDecision;
  const referral = c.referralClassification;

  const problems: string[] = [];

  if (spo2 !== null && spo2 < 92 && scope !== "emergency" && referral !== "emergency-referral") {
    return {
      id: "vitals-plausible", label: "Vitals are plausible", level: "fail", critical: true,
      detail: `SpO₂ ${spo2}% is hypoxic but scope is "${scope}". Hypoxia must trigger emergency referral.`,
    };
  }
  if (rr !== null && rr > 28 && scope === "in-scope") {
    problems.push(`RR ${rr} is high for an in-scope decision.`);
  }
  if (hr !== null && hr > 130 && scope === "in-scope") {
    problems.push(`HR ${hr} is high for an in-scope decision.`);
  }
  if (temp !== null && temp >= 39 && scope === "in-scope") {
    problems.push(`Temp ${temp}°C with in-scope decision warrants documented reasoning.`);
  }
  if (problems.length) {
    return { id: "vitals-plausible", label: "Vitals are plausible", level: "warning", detail: problems.join(" ") };
  }
  return { id: "vitals-plausible", label: "Vitals are plausible", level: "pass" };
}

function checkRedFlagReferral(c: OSCECase): CheckResult {
  const present = (c.redFlagsPresent ?? []).map(lc);
  const screen = (c.redFlagsToScreen ?? []).map(lc);
  if (present.length === 0 && screen.length === 0) {
    return {
      id: "redflag-coverage",
      label: "Red flags are checked",
      level: "warning",
      detail: "Neither redFlagsPresent nor redFlagsToScreen has any entries.",
    };
  }
  const emergencyKeywords = ["chest pain", "cyanos", "stroke", "spo₂ <", "spo2 <", "silent chest", "anaphylax", "haemoptys", "hematemes", "melaena", "stridor", "drowsy", "uncons"];
  const hasEmergencyPresent = present.some((p) => anyOf(p, emergencyKeywords));
  if (hasEmergencyPresent && c.scopeDecision !== "emergency" && c.referralClassification !== "emergency-referral" && c.referralClassification !== "urgent-referral") {
    return {
      id: "redflag-coverage", label: "Red flags are checked", level: "fail", critical: true,
      detail: `Emergency-level red flag present but scope is "${c.scopeDecision}" / referral "${c.referralClassification}".`,
    };
  }
  if (present.length > 0 && c.scopeDecision === "in-scope") {
    return {
      id: "redflag-coverage", label: "Red flags are checked", level: "fail", critical: true,
      detail: "redFlagsPresent is non-empty but case is marked pharmacist-manageable.",
    };
  }
  return { id: "redflag-coverage", label: "Red flags are checked", level: "pass" };
}

function checkReferralJustified(c: OSCECase): CheckResult {
  const refer = c.scopeDecision === "treat-and-refer" || c.scopeDecision === "refer-only" || c.scopeDecision === "emergency";
  if (refer) {
    const reason = (c.referralPlan ?? "").trim();
    if (reason.length < 20) {
      return { id: "referral-justified", label: "Referral decision is justified", level: "warning", detail: "Referral plan is missing or too short to be specific." };
    }
  }
  return { id: "referral-justified", label: "Referral decision is justified", level: "pass" };
}

function checkScope(c: OSCECase): CheckResult {
  if (!c.scopeDecision) {
    return { id: "scope-decision", label: "Treatment is within pharmacist scope", level: "fail", critical: true, detail: "Missing scopeDecision." };
  }
  return { id: "scope-decision", label: "Treatment is within pharmacist scope", level: "pass" };
}

function checkDoseVerification(c: OSCECase): CheckResult {
  const notes = lc(c.treatmentPlanNotes);
  const hasVerify = notes.includes("verify") || notes.includes("confirm") || notes.includes("needs verification") || (c.needsVerification ?? false);
  if (!c.treatmentPlanClass || c.treatmentPlanClass.length === 0) {
    return { id: "dose-sourced", label: "Dose is sourced or marked as needing verification", level: "warning", detail: "No treatmentPlanClass entries." };
  }
  return {
    id: "dose-sourced",
    label: "Dose is sourced or marked as needing verification",
    level: hasVerify ? "pass" : "needs-verification",
    detail: hasVerify ? undefined : "treatmentPlanNotes does not mention verify/confirm against current protocol.",
  };
}

function checkPregnancyBF(c: OSCECase): CheckResult {
  const pt = c.fakePatientScript?.pregnancyBreastfeeding;
  if (!pt || pt.trim() === "") {
    return { id: "preg-bf", label: "Pregnancy/breastfeeding considered", level: "warning", detail: "pregnancyBreastfeeding field is empty." };
  }
  const isPregBF = anyOf(lc(pt), ["pregnan", "breastfeed", "lactat", "trimester"]);
  if (isPregBF) {
    const reasoning = joinLC(c.protocolReasoning, c.clinicalReasoning, c.treatmentPlanNotes);
    if (!anyOf(reasoning, ["pregnan", "breastfeed", "lactat"])) {
      return {
        id: "preg-bf", label: "Pregnancy/breastfeeding considered", level: "fail", critical: true,
        detail: "Patient is pregnant or breastfeeding but reasoning does not mention it.",
      };
    }
  }
  return { id: "preg-bf", label: "Pregnancy/breastfeeding considered", level: "pass" };
}

function checkAllergy(c: OSCECase): CheckResult {
  const al = lc(c.fakePatientScript?.allergies);
  if (!al) return { id: "allergy", label: "Allergy considered", level: "warning", detail: "No allergies field on patient script." };
  if (anyOf(al, ["penicillin", "amoxicillin", "augmentin"]) && anyOf(al, ["anaphyl", "swelling", "throat"])) {
    const tx = joinLC(c.treatmentPlanClass, c.treatmentPlanNotes);
    if (anyOf(tx, ["penicillin", "amoxicillin", "augmentin", "flucloxacillin", "cephalexin", "cefalexin"])) {
      return {
        id: "allergy", label: "Allergy considered", level: "fail", critical: true,
        detail: "Penicillin anaphylaxis recorded but a beta-lactam appears in the treatment plan.",
      };
    }
  }
  return { id: "allergy", label: "Allergy considered", level: "pass" };
}

function checkAgeConsiderations(c: OSCECase): CheckResult {
  const age = c.patientProfile?.age;
  if (typeof age !== "number") {
    return { id: "age-extremes", label: "Paediatric/older adult considerations checked", level: "warning", detail: "Patient age missing." };
  }
  const reasoning = joinLC(c.protocolReasoning, c.clinicalReasoning, c.treatmentPlanNotes);
  if ((age < 16 || age >= 75) && !anyOf(reasoning, ["age", "paediatric", "child", "elderly", "older adult", "geriatric"])) {
    return {
      id: "age-extremes", label: "Paediatric/older adult considerations checked", level: "warning",
      detail: `Patient is ${age} years old but reasoning does not mention age-specific considerations.`,
    };
  }
  return { id: "age-extremes", label: "Paediatric/older adult considerations checked", level: "pass" };
}

function checkCardiacMimic(c: OSCECase): CheckResult {
  const corpus = joinLC(
    c.candidateStem, c.condition, c.expectedDiagnosis,
    c.fakePatientScript?.mainComplaint, c.fakePatientScript?.socrates,
    c.fakePatientScript?.volunteer,
  );
  // Only trigger when there is a genuine chest/epigastric/retrosternal
  // complaint OR atypical pain features that could mask ACS. Pure
  // heartburn/indigestion alone is now a warning, not a critical fail.
  const hasChestEpigastric = anyOf(corpus, ["chest pain", "retrosternal", "epigastr", "chest tight", "chest heav"]);
  const hasAtypical = anyOf(corpus, ["radiat", "left arm", "jaw", "diaphor", "exertion"]);
  const hasHeartburnOnly = anyOf(corpus, ["heartburn", "indigestion"]) && !hasChestEpigastric;
  if (!hasChestEpigastric && !hasAtypical && !hasHeartburnOnly) {
    return { id: "cardiac-mimic", label: "Cardiac mimics not missed", level: "pass" };
  }
  const reasoning = joinLC(c.protocolReasoning, c.clinicalReasoning, c.differentials, c.redFlagsToScreen, c.criticalFails);
  const considers = anyOf(reasoning, ["cardiac", "acs", "angina", "ischaem", "ischem", "myocard", "ekg", "ecg"]);
  if (considers) return { id: "cardiac-mimic", label: "Cardiac mimics not missed", level: "pass" };

  // Heartburn-only without chest features: warning, not critical.
  if (hasHeartburnOnly && !hasChestEpigastric && !hasAtypical) {
    return {
      id: "cardiac-mimic", label: "Cardiac mimics not missed", level: "warning",
      detail: "Heartburn/indigestion presentation: consider adding cardiac mimic (ACS, angina) to differentials or screening questions.",
    };
  }
  return {
    id: "cardiac-mimic", label: "Cardiac mimics not missed", level: "fail", critical: true,
    detail: "Chest/epigastric or atypical pain features present but cardiac mimic (ACS, angina) is not considered in reasoning, differentials or critical fails.",
  };
}

function checkSafetyNetSpecific(c: OSCECase): CheckResult {
  const sn = c.safetyNet ?? [];
  if (sn.length === 0) {
    return { id: "safetynet-specific", label: "Safety-netting is specific", level: "warning", detail: "No safety-net entries." };
  }
  const generic = sn.some((s) => /seek (medical )?attention if symptoms worsen|see (your )?gp if symptoms persist/i.test(s) && s.length < 80);
  if (generic && sn.length === 1) {
    return { id: "safetynet-specific", label: "Safety-netting is specific", level: "warning", detail: "Safety-net is generic. Name specific symptoms, timeframes, and where to go." };
  }
  return { id: "safetynet-specific", label: "Safety-netting is specific", level: "pass" };
}

function checkGPLetter(c: OSCECase): CheckResult {
  const needsRefer = c.scopeDecision === "treat-and-refer" || c.scopeDecision === "refer-only" || c.scopeDecision === "emergency";
  const hasSbar = !!(c.sbar?.situation || c.sbar?.assessment || c.sbar?.recommendation);
  const hasLetter = !!c.gpLetter && c.gpLetter.length > 60;
  if (needsRefer && !hasSbar && !hasLetter) {
    return { id: "gp-letter", label: "GP letter is clinically useful", level: "warning", detail: "Referral case has no sbar/gpLetter content." };
  }
  return { id: "gp-letter", label: "GP letter is clinically useful", level: "pass" };
}

function checkCustomViva(c: OSCECase): CheckResult {
  const n = c.viva?.length ?? 0;
  if (n >= 5) return { id: "viva-custom", label: "Custom viva block exists", level: "pass" };
  if (n === 0) return { id: "viva-custom", label: "Custom viva block exists", level: "warning", detail: "Missing custom viva block. Viva Mode will fall back to generic questions." };
  return { id: "viva-custom", label: "Custom viva block exists", level: "warning", detail: `Only ${n} custom viva question(s); generic fillers will be used.` };
}

/**
 * Common presenting-complaint vocabulary that may appear in BOTH the brief
 * and the diagnosis without constituting a leak. A leak requires the brief
 * to reveal genuinely examiner-only information (final dx, hidden findings,
 * vitals, management answers), not ordinary symptom or anatomy words.
 */
const BRIEF_LEAK_ALLOWLIST = new Set([
  // anatomy
  "right", "left", "ear", "ears", "nose", "throat", "chest", "abdomen", "abdominal",
  "epigastric", "ankle", "knee", "foot", "skin", "head", "back", "stomach",
  // symptoms
  "pain", "cough", "fever", "rash", "itch", "itchy", "swelling", "swollen",
  "nausea", "vomit", "vomiting", "diarrhoea", "diarrhea", "discharge",
  "headache", "dizzy", "tired", "tiredness", "fatigue", "symptoms", "symptom",
  "burning", "stinging", "blocked", "runny", "sneeze", "sneezing",
  "wheeze", "wheezing", "breathless", "breathlessness", "short", "shortness",
  // context
  "history", "request", "review", "asks", "asking", "asked", "wants", "needs",
  "presents", "patient", "today", "yesterday", "morning", "evening",
  // conditions named in opening complaint (not the diagnostic answer)
  "asthma", "reflux", "hayfever", "cold", "flu", "psoriasis", "eczema",
  "dermatitis", "rhinitis", "acne", "migraine", "constipation",
  "haemorrhoids", "hemorrhoids", "thrush",
  // device/anatomy commonly named upfront
  "grommet", "grommets", "tube", "tubes",
  // medications the patient may name themselves
  "tramadol", "paracetamol", "ibuprofen", "anticoagulant", "warfarin",
  // generic descriptors
  "acute", "chronic", "adult", "child", "mild", "moderate", "severe",
  "since", "after", "before", "during", "while",
]);

const LEAK_HARD_TERMS = [
  // Diagnostic answer language - only flag if the brief contains a multi-word
  // diagnostic noun phrase from the expected diagnosis.
];

function checkBriefLeak(c: OSCECase): CheckResult {
  const brief = lc(c.candidateStem);
  if (!brief) {
    return { id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "warning", detail: "candidateStem is empty." };
  }

  // 1. Hard fail: hidden findings (hiddenAnswers / hiddenFromBrief / vitals / exam
  // findings) appear in the brief.
  const hiddenStrings = [
    ...Object.values(c.fakePatientScript?.hiddenAnswers ?? {}),
    ...(c.hiddenFromBrief ?? []),
    ...Object.values(c.examinationFindings ?? {}),
    ...Object.values(c.vitals ?? {}),
  ];
  for (const h of hiddenStrings) {
    if (!h) continue;
    const snippet = lc(h).trim();
    if (snippet.length >= 20 && brief.includes(snippet.slice(0, 25))) {
      return {
        id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "fail", critical: true,
        detail: "An examiner-only finding (hidden answer, examination finding, or vitals reading) appears in the student brief.",
      };
    }
  }

  // 2. Multi-word diagnostic phrase appears in brief.
  const dx = lc(c.expectedDiagnosis);
  if (dx) {
    // Build candidate noun phrases: any consecutive pair of significant
    // (non-allowlisted, >=4 char) tokens from the diagnosis.
    const tokens = dx.split(/[^a-z]+/).filter(Boolean);
    const significant = tokens.filter((t) => t.length >= 4 && !BRIEF_LEAK_ALLOWLIST.has(t));
    for (let i = 0; i < significant.length - 1; i++) {
      const phrase = `${significant[i]} ${significant[i + 1]}`;
      if (brief.includes(phrase)) {
        return {
          id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "fail", critical: true,
          detail: `Student brief contains the diagnostic phrase "${phrase}".`,
        };
      }
    }

    // 3. Soft warning: a single highly specific (>=8 char, not allowlisted)
    // diagnostic noun appears in the brief. Suggestive but plausible.
    const suggestive = significant.filter((t) => t.length >= 9 && !BRIEF_LEAK_ALLOWLIST.has(t));
    for (const t of suggestive) {
      if (brief.includes(t)) {
        return {
          id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "warning",
          detail: `Student brief mentions "${t}", which appears in the expected diagnosis. May be acceptable as part of the presenting complaint; review wording.`,
        };
      }
    }
  }

  // 4. Management or referral classification language in the brief.
  const referralLeak = /\b(refer to (gp|ed)|emergency referral|prescribe \w+|administer \w+)\b/i.test(c.candidateStem);
  if (referralLeak) {
    return {
      id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "fail", critical: true,
      detail: "Student brief reveals management/referral decision that should remain examiner-only.",
    };
  }

  return { id: "brief-leak", label: "Hidden findings do not leak into Student Brief", level: "pass" };
}

function checkEmDashes(c: OSCECase): CheckResult {
  const corpus = JSON.stringify(c);
  if (corpus.includes("—") || corpus.includes("–")) {
    return { id: "em-dashes", label: "No em dashes", level: "warning", detail: "Em or en dash found in case content." };
  }
  return { id: "em-dashes", label: "No em dashes", level: "pass" };
}

function checkAIFiller(c: OSCECase): CheckResult {
  const corpus = JSON.stringify(c).toLowerCase();
  const hits = [
    ...AI_FILLER.filter((w) => corpus.includes(w)),
    ...AI_FILLER_PHRASES.filter((w) => corpus.includes(w)),
  ];
  if (hits.length === 0) return { id: "ai-filler", label: "No AI-sounding filler", level: "pass" };
  return { id: "ai-filler", label: "No AI-sounding filler", level: "warning", detail: `Found: ${hits.join(", ")}` };
}

function checkUnsupportedClaims(c: OSCECase): CheckResult {
  // Naive: very long single sentence in protocolReasoning without "protocol" or "verify" mention.
  const r = c.protocolReasoning ?? "";
  const longestSentence = r.split(/[.!?]/).map((s) => s.trim()).sort((a, b) => b.length - a.length)[0] ?? "";
  if (longestSentence.length > 220 && !/protocol|verify|reference|guideline/i.test(longestSentence)) {
    return { id: "unsupported-claims", label: "No unsupported claims", level: "warning", detail: "Long protocolReasoning sentence with no protocol/guideline anchor." };
  }
  return { id: "unsupported-claims", label: "No unsupported claims", level: "pass" };
}

function checkReferralClassification(c: OSCECase): CheckResult {
  const allowed: ReferralClassification[] = [
    "pharmacist-manageable", "treat-and-refer", "refer-only", "urgent-referral", "emergency-referral",
  ];
  if (!c.referralClassification) {
    return { id: "referral-class", label: "Referral classification set", level: "warning", detail: "No referralClassification (one of: " + allowed.join(", ") + ")." };
  }
  return { id: "referral-class", label: "Referral classification set", level: "pass" };
}

// ---------- Public API ----------

export function validateCase(c: OSCECase): CaseValidationReport {
  const results: CheckResult[] = [
    checkSourceNotes(c),
    checkSources(c),
    checkDiagnosisConsistency(c),
    checkExamConsistency(c),
    checkVitalsSeverity(c),
    checkRedFlagReferral(c),
    checkReferralJustified(c),
    checkReferralClassification(c),
    checkScope(c),
    checkDoseVerification(c),
    checkPregnancyBF(c),
    checkAllergy(c),
    checkAgeConsiderations(c),
    checkCardiacMimic(c),
    checkSafetyNetSpecific(c),
    checkGPLetter(c),
    checkCustomViva(c),
    checkBriefLeak(c),
    checkEmDashes(c),
    checkAIFiller(c),
    checkUnsupportedClaims(c),
  ];

  const passCount = results.filter((r) => r.level === "pass").length;
  const warningCount = results.filter((r) => r.level === "warning").length;
  const failCount = results.filter((r) => r.level === "fail").length;
  const needsVerificationCount = results.filter((r) => r.level === "needs-verification").length;
  const criticalFailCount = results.filter((r) => r.level === "fail" && r.critical).length;
  const unsafeForTimedPractice = criticalFailCount > 0;
  const overall: CheckLevel =
    criticalFailCount > 0 ? "fail"
      : failCount > 0 ? "fail"
      : warningCount > 0 ? "warning"
      : needsVerificationCount > 0 ? "needs-verification"
      : "pass";

  return {
    caseId: c.id,
    results,
    passCount, warningCount, failCount, needsVerificationCount, criticalFailCount,
    unsafeForTimedPractice, overall,
  };
}

export const LEVEL_LABEL: Record<CheckLevel, string> = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
  "needs-verification": "Needs verification",
};

export const LEVEL_CLASS: Record<CheckLevel, string> = {
  pass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  warning: "bg-amber-100 text-amber-900 border-amber-300",
  fail: "bg-red-100 text-red-900 border-red-300",
  "needs-verification": "bg-sky-100 text-sky-900 border-sky-300",
};
