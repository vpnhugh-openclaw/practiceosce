// Hugh's OSCE Case Generator: core types

export type ScopeStatus =
  | "in-scope"
  | "treat-and-refer"
  | "refer-only"
  | "emergency"
  | "needs-protocol-check";

export type ProtocolConfidence = "high" | "medium" | "low" | "needs-review";

export type ConditionCategory =
  | "Respiratory"
  | "ENT"
  | "Dermatology"
  | "Gastrointestinal"
  | "Cardiovascular"
  | "Women's health"
  | "Musculoskeletal"
  | "Weight management"
  | "Smoking cessation"
  | "Oral health"
  | "Travel health"
  | "Wound management";

export type CaseType =
  | "In-scope routine"
  | "Treat and refer"
  | "Refer only"
  | "Emergency referral"
  | "Diagnostic uncertainty"
  | "Protocol trap"
  | "Communication heavy"
  | "Examination heavy"
  | "Safety-netting heavy"
  | "Marked emotional impact"
  | "Paediatric"
  | "Adolescent HEADSSS"
  | "Pregnancy/breastfeeding trap"
  | "Medication contraindication trap"
  | "Comorbidity trap"
  | "Allergy trap";

export type Difficulty = "Beginner" | "Standard OSCE" | "Difficult" | "Brutal";

export interface ConditionProtocol {
  id: string;
  conditionName: string;
  category: ConditionCategory;
  minimumAge?: number;
  maximumAge?: number;
  previousDiagnosisRequired?: boolean;
  protocolSource: string;
  protocolVersion: string;
  protocolConfidence: ProtocolConfidence;
  inScopeCriteria: string[];
  outOfScopeCriteria: string[];
  treatAndReferCriteria: string[];
  emergencyReferralCriteria: string[];
  focusedQuestions: string[];
  redFlags: string[];
  relevantVitals: string[];
  relevantExaminations: string[];
  differentialDiagnoses: string[];
  pharmacologicalOptions: string[]; // class-level only unless verified
  nonPharmacologicalAdvice: string[];
  safetyNet: string[];
  reviewTime: string;
  vaccinationPrompts: string[];
  communicationFrameworks: string[];
  commonTraps: string[];
}

export interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  ethnicity?: string;
  occupation?: string;
  pregnancy?: string;
  social?: string;
}

export interface FakePatientScript {
  openingLine: string;
  mainComplaint: string;
  socrates: Record<string, string>;
  hiddenAnswers: Record<string, string>;
  medicalHistory: string;
  medications: string;
  allergies: string;
  pregnancyBreastfeeding: string;
  surgicalHistory: string;
  familyHistory: string;
  vaccinationHistory: string;
  smoking: string;
  nutrition: string;
  alcohol: string;
  physicalActivity: string;
  sleepMood: string;
  socialContext: string;
  emotionalImpact: string;
  dayToDayImpact: string;
  volunteer: string[];
  onlyIfAsked: string[];
  challengePrompts: string[];
}

export interface MarkingRubricItem {
  domain: string;
  item: string;
  maxMarks: number;
  critical?: boolean;
  feedbackIfMissed: string;
}

export interface VivaQA {
  question: string;
  modelAnswer: string;
}

export type ReferralClassification =
  | "pharmacist-manageable"
  | "treat-and-refer"
  | "refer-only"
  | "urgent-referral"
  | "emergency-referral";

export interface OSCECase {
  id: string;
  title: string;
  condition: string;
  category: ConditionCategory;
  difficulty: Difficulty;
  caseType: CaseType[];
  timeMinutes: number;
  candidateStem: string;
  patientProfile: PatientProfile;
  fakePatientScript: FakePatientScript;
  vitals: Record<string, string>;
  examinationFindings: Record<string, string>;
  expectedDiagnosis: string;
  differentials: string[];
  scopeDecision: ScopeStatus;
  protocolReasoning: string;
  clinicalReasoning: string;
  treatmentPlanClass: string[];
  treatmentPlanNotes: string;
  nonPharmPlan: string[];
  safetyNet: string[];
  reviewTime: string;
  referralPlan: string;
  gpLetter?: string;
  markingRubric: MarkingRubricItem[];
  criticalFails: string[];
  learningPoints: string[];
  redFlagsPresent: string[];
  redFlagsToScreen: string[];
  protocolConfidence: ProtocolConfidence;
  sourceNotes: string;
  // ---- v2 additive fields (optional: old cases continue to render) ----
  ice?: { ideas?: string; concerns?: string; expectations?: string };
  hiddenFromBrief?: string[];
  referralClassification?: ReferralClassification;
  viva?: VivaQA[];
  sbar?: { situation?: string; background?: string; assessment?: string; recommendation?: string };
  defaultTimeMinutes?: number;
  // ---- v3 sourcing layer (optional) ----
  sourceTags?: SourceTag[];
  needsVerification?: boolean;
  verificationNotes?: string[];
}

export type ReferenceReliability =
  | "government-protocol"
  | "clinical-guideline"
  | "medicines-reference"
  | "osce-training"
  | "patient-education"
  | "background";

export type ReferenceArea =
  | "ENT" | "GI" | "Respiratory" | "MSK" | "Skin" | "Women's health"
  | "Protocol" | "Red flags" | "Examination" | "Medicines"
  | "Patient counselling" | "OSCE structure";

export interface SourceTag {
  id: string;
  title: string;
  locator?: string;
  reliability: ReferenceReliability;
  url?: string;
}

