import type { ReferenceArea, ReferenceReliability } from "@/lib/types";

export interface ReferenceEntry {
  id: string;
  title: string;
  organisation: string;
  year?: string;
  url?: string;
  areas: ReferenceArea[];
  usedFor: string;
  lastChecked: string;
  reliability: ReferenceReliability;
  notes?: string;
}

/**
 * Curated reference list. Page locators are deliberately conservative:
 * if an exact page is not held in this app, the entry says
 * "Source imported, page reference pending." rather than inventing one.
 */
export const REFERENCES: ReferenceEntry[] = [
  {
    id: "qh-scope-pilot",
    title: "Queensland Pharmacist Scope of Practice Pilot: Clinical Practice Guidelines",
    organisation: "Queensland Health",
    year: "2024",
    url: "https://www.health.qld.gov.au/clinical-practice/guidelines-procedures/medicines/queensland-pharmacist-scope-of-practice-pilot",
    areas: ["Protocol", "ENT", "GI", "Respiratory", "Skin", "MSK", "Women's health"],
    usedFor: "Highest-authority source for prescribing eligibility, exclusions, dose class, duration, red flags, and referral thresholds across all in-scope conditions.",
    lastChecked: "2026-06-01",
    reliability: "government-protocol",
    notes: "Pharmacists must follow the relevant Queensland Health protocol when prescribing under the pilot. Where any other source disagrees with the current QH protocol, QH overrides.",
  },
  {
    id: "tg-respiratory",
    title: "Therapeutic Guidelines: Respiratory",
    organisation: "Therapeutic Guidelines Limited",
    areas: ["Respiratory", "Medicines"],
    usedFor: "Cross-reference for asthma, COPD, acute bronchitis, and pneumonia red flags.",
    lastChecked: "2026-06-01",
    reliability: "clinical-guideline",
    notes: "Source imported, page reference pending.",
  },
  {
    id: "tg-gastro",
    title: "Therapeutic Guidelines: Gastrointestinal",
    organisation: "Therapeutic Guidelines Limited",
    areas: ["GI", "Medicines"],
    usedFor: "GORD, dyspepsia, gastroenteritis, IBS, constipation.",
    lastChecked: "2026-06-01",
    reliability: "clinical-guideline",
    notes: "Source imported, page reference pending.",
  },
  {
    id: "amh",
    title: "Australian Medicines Handbook",
    organisation: "AMH Pty Ltd",
    url: "https://amhonline.amh.net.au",
    areas: ["Medicines"],
    usedFor: "Drug-level dose, contraindications, pregnancy/breastfeeding categories, interactions.",
    lastChecked: "2026-06-01",
    reliability: "medicines-reference",
  },
  {
    id: "asthma-handbook",
    title: "Australian Asthma Handbook v2.2",
    organisation: "National Asthma Council Australia",
    url: "https://www.asthmahandbook.org.au",
    areas: ["Respiratory", "Protocol"],
    usedFor: "Asthma severity assessment, reliever overuse thresholds, action plan structure.",
    lastChecked: "2026-06-01",
    reliability: "clinical-guideline",
  },
  {
    id: "copd-x",
    title: "COPD-X Plan: Australian and New Zealand COPD Guidelines",
    organisation: "Lung Foundation Australia",
    url: "https://copdx.org.au",
    areas: ["Respiratory", "Protocol"],
    usedFor: "COPD exacerbation triage, oxygen targets, referral criteria.",
    lastChecked: "2026-06-01",
    reliability: "clinical-guideline",
  },
  {
    id: "healthdirect",
    title: "Healthdirect Australia",
    organisation: "Australian Government",
    url: "https://www.healthdirect.gov.au",
    areas: ["Patient counselling"],
    usedFor: "Plain-language wording for patient-facing safety-net and counselling scripts.",
    lastChecked: "2026-06-01",
    reliability: "patient-education",
  },
  {
    id: "racgp-redbook",
    title: "RACGP Guidelines for Preventive Activities in General Practice (Red Book)",
    organisation: "Royal Australian College of General Practitioners",
    url: "https://www.racgp.org.au/clinical-resources/clinical-guidelines/key-racgp-guidelines/view-all-racgp-guidelines/red-book",
    areas: ["Examination", "Red flags"],
    usedFor: "Background reference for preventive screening prompts (vaccination, BP, weight).",
    lastChecked: "2026-06-01",
    reliability: "clinical-guideline",
  },
  {
    id: "monash-osce-pdf",
    title: "OSCE Prep Info: June 2026 (Monash)",
    organisation: "Monash University: imported PDF",
    areas: ["OSCE structure", "Examination", "ENT", "GI", "Respiratory"],
    usedFor: "Case structure, roleplayer cues, examination flow, examiner key layout and viva style. Not used as a prescribing source.",
    lastChecked: "2026-06-01",
    reliability: "osce-training",
    notes: "Treatment and dosing claims are not taken from this PDF.",
  },
  {
    id: "ipa-pdf",
    title: "IPA Practice Exams (uploaded)",
    organisation: "Imported PDF",
    areas: ["OSCE structure", "Examination"],
    usedFor: "Case structure, FSOP framework prompts, communication scaffolds.",
    lastChecked: "2026-06-01",
    reliability: "osce-training",
    notes: "Not used as a prescribing source. Treatment cross-checked against Queensland Health protocol.",
  },
];

export const RELIABILITY_LABEL: Record<ReferenceReliability, string> = {
  "government-protocol": "Government protocol",
  "clinical-guideline": "Official clinical guideline",
  "medicines-reference": "Medicines reference",
  "osce-training": "University OSCE training material",
  "patient-education": "Patient education resource",
  background: "Background only",
};

export const RELIABILITY_ORDER: ReferenceReliability[] = [
  "government-protocol",
  "clinical-guideline",
  "medicines-reference",
  "osce-training",
  "patient-education",
  "background",
];
