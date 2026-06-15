export interface RedFlagEntry {
  acronym?: string;
  letter?: string;
  flag: string;
  appliesTo: string[];
  suggests: string;
  action: string;
  oscePhrase?: string;
}

export const ACRONYMS = [
  {
    name: "CHUPO",
    domain: "Respiratory alarm signs",
    items: [
      { letter: "C", flag: "Cyanosis (central or peripheral)" },
      { letter: "H", flag: "Hypoxia / SpO₂ < 92%" },
      { letter: "U", flag: "Unable to speak in full sentences" },
      { letter: "P", flag: "Pulse markedly elevated" },
      { letter: "O", flag: "Oxygen sats falling / silent chest" },
    ],
  },
  {
    name: "CANVASSHU",
    domain: "GORD / upper-GI alarm signs",
    items: [
      { letter: "C", flag: "Cough (chronic)" },
      { letter: "A", flag: "Anaemia symptoms" },
      { letter: "N", flag: "Nausea / vomiting persistent" },
      { letter: "V", flag: "Vomiting blood (haematemesis)" },
      { letter: "A", flag: "Anorexia / appetite loss" },
      { letter: "S", flag: "Swallowing difficulty (dysphagia)" },
      { letter: "S", flag: "Symptoms ≥8 weeks despite treatment" },
      { letter: "H", flag: "Hoarseness" },
      { letter: "U", flag: "Unintentional weight loss" },
    ],
  },
  {
    name: "SIP",
    domain: "Skin conditions",
    items: [
      { letter: "S", flag: "Spreading (cellulitis, lymphangitis)" },
      { letter: "I", flag: "Infected / systemic features" },
      { letter: "P", flag: "Painful disproportionately / Periorbital / Pregnancy" },
    ],
  },
  {
    name: "SOCRATES",
    domain: "Pain / symptom assessment",
    items: [
      { letter: "S", flag: "Site" },
      { letter: "O", flag: "Onset" },
      { letter: "C", flag: "Character" },
      { letter: "R", flag: "Radiation" },
      { letter: "A", flag: "Associated symptoms" },
      { letter: "T", flag: "Timing" },
      { letter: "E", flag: "Exacerbating / relieving" },
      { letter: "S", flag: "Severity" },
    ],
  },
  {
    name: "HEADSSS",
    domain: "Adolescent psychosocial",
    items: [
      { letter: "H", flag: "Home" },
      { letter: "E", flag: "Education / employment" },
      { letter: "A", flag: "Activities" },
      { letter: "D", flag: "Drugs / substances" },
      { letter: "S", flag: "Sexuality" },
      { letter: "S", flag: "Suicide / depression" },
      { letter: "S", flag: "Safety" },
    ],
  },
  {
    name: "SNAP",
    domain: "Lifestyle factors",
    items: [
      { letter: "S", flag: "Smoking" },
      { letter: "N", flag: "Nutrition" },
      { letter: "A", flag: "Alcohol" },
      { letter: "P", flag: "Physical activity" },
    ],
  },
  {
    name: "5As",
    domain: "Behaviour change",
    items: [
      { letter: "1", flag: "Ask" },
      { letter: "2", flag: "Advise" },
      { letter: "3", flag: "Assess" },
      { letter: "4", flag: "Assist" },
      { letter: "5", flag: "Arrange" },
    ],
  },
  {
    name: "ISBAR",
    domain: "Clinical handover / GP letter",
    items: [
      { letter: "I", flag: "Introduction" },
      { letter: "S", flag: "Situation" },
      { letter: "B", flag: "Background" },
      { letter: "A", flag: "Assessment" },
      { letter: "R", flag: "Recommendation" },
    ],
  },
];

export const RED_FLAGS: RedFlagEntry[] = [
  { acronym: "CHUPO", flag: "SpO₂ < 92%", appliesTo: ["Asthma", "COPD", "Respiratory"], suggests: "Severe hypoxia / life-threatening exacerbation", action: "Emergency referral — call 000", oscePhrase: "Your oxygen level is concerning — I'm going to arrange urgent transfer to hospital." },
  { acronym: "CHUPO", flag: "Unable to speak in full sentences", appliesTo: ["Asthma", "COPD"], suggests: "Severe respiratory distress", action: "Emergency referral" },
  { acronym: "CHUPO", flag: "Silent chest", appliesTo: ["Asthma"], suggests: "Life-threatening asthma", action: "Emergency referral" },
  { acronym: "CANVASSHU", flag: "Haematemesis or melaena", appliesTo: ["GORD"], suggests: "Upper-GI bleed / PUD", action: "Emergency referral" },
  { acronym: "CANVASSHU", flag: "Dysphagia", appliesTo: ["GORD"], suggests: "Oesophageal pathology", action: "Urgent GP / endoscopy referral" },
  { acronym: "CANVASSHU", flag: "Unintentional weight loss", appliesTo: ["GORD"], suggests: "Malignancy risk", action: "Urgent GP referral" },
  { acronym: "SIP", flag: "Periorbital lesions / spreading erythema", appliesTo: ["Impetigo", "Cellulitis"], suggests: "Periorbital cellulitis risk", action: "Same-day GP / ED" },
  { flag: "Mastoid tenderness", appliesTo: ["Otitis media"], suggests: "Mastoiditis", action: "Emergency referral" },
  { flag: "Facial nerve weakness", appliesTo: ["Otitis media", "Shingles"], suggests: "Ramsay Hunt / facial nerve involvement", action: "Same-day GP / ED" },
  { flag: "Ophthalmic involvement (Hutchinson sign)", appliesTo: ["Shingles"], suggests: "Herpes zoster ophthalmicus", action: "Same-day ophthalmology" },
  { flag: "Migraine with aura on combined contraception request", appliesTo: ["Contraception"], suggests: "UKMEC 4 — absolute contraindication", action: "Refer to GP; offer barrier method" },
  { flag: "Cauda equina symptoms (bladder/bowel, saddle)", appliesTo: ["Back pain"], suggests: "Cauda equina syndrome", action: "Emergency referral" },
  { flag: "Reduced urine output / dry mucous membranes", appliesTo: ["Gastroenteritis"], suggests: "Significant dehydration", action: "GP / ED if severe" },
  { flag: "Confusion in older adult with respiratory infection", appliesTo: ["COPD", "Pneumonia"], suggests: "Sepsis / hypoxia", action: "Emergency referral" },
];
