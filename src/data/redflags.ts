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
  // Respiratory
  { acronym: "CHUPO", flag: "SpO₂ < 92%", appliesTo: ["Respiratory", "Asthma", "COPD"], suggests: "Severe hypoxia / life-threatening exacerbation", action: "Emergency referral: call 000", oscePhrase: "Your oxygen level is concerning: I'm going to arrange urgent transfer to hospital." },
  { acronym: "CHUPO", flag: "Unable to speak in full sentences", appliesTo: ["Respiratory", "Asthma", "COPD"], suggests: "Severe respiratory distress", action: "Emergency referral" },
  { acronym: "CHUPO", flag: "Silent chest", appliesTo: ["Asthma"], suggests: "Life-threatening asthma", action: "Emergency referral" },
  { flag: "Haemoptysis", appliesTo: ["Respiratory"], suggests: "PE, malignancy, TB, severe infection", action: "Same-day GP / ED" },
  { flag: "Unexplained weight loss", appliesTo: ["Respiratory", "GI"], suggests: "Malignancy, chronic infection", action: "Urgent GP referral" },
  { flag: "Night sweats", appliesTo: ["Respiratory"], suggests: "TB, lymphoma, infection", action: "Urgent GP referral" },
  { flag: "Recurrent pneumonia", appliesTo: ["Respiratory"], suggests: "Bronchiectasis, malignancy, immunodeficiency", action: "GP/specialist referral" },
  { flag: "Peripheral oedema / orthopnoea", appliesTo: ["Respiratory"], suggests: "Cardiac failure", action: "Same-day GP" },
  { flag: "Pleuritic chest pain + recent immobility", appliesTo: ["Respiratory"], suggests: "Pulmonary embolism", action: "Emergency referral" },
  { flag: "Confusion in older adult with respiratory infection", appliesTo: ["Respiratory", "COPD", "Pneumonia"], suggests: "Sepsis / hypoxia", action: "Emergency referral" },
  { flag: "Fever ≥38°C in immunocompromised", appliesTo: ["Respiratory", "Emergency"], suggests: "Febrile neutropenia / sepsis", action: "Emergency referral" },

  // GI
  { acronym: "CANVASSHU", flag: "Haematemesis or melaena", appliesTo: ["GI", "GORD"], suggests: "Upper-GI bleed / PUD", action: "Emergency referral" },
  { acronym: "CANVASSHU", flag: "Dysphagia", appliesTo: ["GI", "GORD"], suggests: "Oesophageal pathology", action: "Urgent GP / endoscopy referral" },
  { acronym: "CANVASSHU", flag: "Odynophagia", appliesTo: ["GI"], suggests: "Oesophagitis, infection, malignancy", action: "GP referral" },
  { acronym: "CANVASSHU", flag: "Unintentional weight loss", appliesTo: ["GI", "GORD"], suggests: "Malignancy risk", action: "Urgent GP referral" },
  { flag: "Persistent vomiting", appliesTo: ["GI"], suggests: "Obstruction, severe gastritis, intracranial pathology", action: "GP / ED if severe" },
  { flag: "Severe abdominal pain with guarding/rebound/rigidity", appliesTo: ["GI"], suggests: "Surgical abdomen", action: "Emergency referral" },
  { flag: "Jaundice", appliesTo: ["GI"], suggests: "Hepatobiliary disease", action: "Urgent GP / ED" },
  { flag: "Reduced urine output / dry mucous membranes", appliesTo: ["GI"], suggests: "Significant dehydration / AKI", action: "GP / ED if severe" },
  { flag: "Possible pregnancy complication (epigastric pain, headache, visual change)", appliesTo: ["GI", "Pregnancy"], suggests: "Pre-eclampsia / HELLP", action: "Urgent obstetric review" },
  { flag: "Chest pain / exertional epigastric pain in middle-aged adult", appliesTo: ["GI", "Cardiac"], suggests: "ACS masquerade", action: "Emergency referral: call 000" },
  { flag: "Older adult with new/progressive dyspepsia", appliesTo: ["GI"], suggests: "Malignancy until proven otherwise", action: "Urgent GP referral (endoscopy)" },

  // ENT
  { flag: "Mastoid tenderness / swelling / redness", appliesTo: ["ENT", "Otitis media"], suggests: "Mastoiditis", action: "Emergency referral" },
  { flag: "Facial nerve weakness", appliesTo: ["ENT", "Otitis media", "Shingles"], suggests: "Ramsay Hunt / mastoiditis / nerve involvement", action: "Same-day GP / ED" },
  { flag: "Severe headache + neck stiffness", appliesTo: ["ENT", "Emergency"], suggests: "Meningitis", action: "Emergency referral" },
  { flag: "Vertigo / neurological symptoms with otalgia", appliesTo: ["ENT"], suggests: "Inner-ear / CNS complication", action: "Urgent GP / ED" },
  { flag: "High fever + systemic illness", appliesTo: ["ENT"], suggests: "Severe infection", action: "Same-day GP / ED" },
  { flag: "Immunocompromise (chemo, transplant, uncontrolled diabetes)", appliesTo: ["ENT", "Immunocompromised"], suggests: "Necrotising OE / severe infection", action: "Refer; do not treat in pharmacy" },
  { flag: "Trauma / foreign body", appliesTo: ["ENT"], suggests: "Mechanical injury", action: "GP / ED" },
  { flag: "Persistent / worsening despite treatment", appliesTo: ["ENT"], suggests: "Complication / wrong diagnosis", action: "GP review" },
  { flag: "Unilateral nasal polyp / epistaxis / discharge", appliesTo: ["ENT"], suggests: "Malignancy", action: "Urgent ENT referral" },

  // Other
  { acronym: "SIP", flag: "Periorbital lesions / spreading erythema", appliesTo: ["Dermatology", "Impetigo", "Cellulitis"], suggests: "Periorbital cellulitis risk", action: "Same-day GP / ED" },
  { flag: "Ophthalmic involvement (Hutchinson sign)", appliesTo: ["Dermatology", "Shingles"], suggests: "Herpes zoster ophthalmicus", action: "Same-day ophthalmology" },
  { flag: "Migraine with aura on combined contraception request", appliesTo: ["Women's health", "Contraception"], suggests: "UKMEC 4: absolute contraindication", action: "Refer to GP; offer barrier method" },
  { flag: "Cauda equina symptoms (bladder/bowel, saddle)", appliesTo: ["MSK", "Back pain"], suggests: "Cauda equina syndrome", action: "Emergency referral" },
  { flag: "Paediatric patient with discharge or grommets", appliesTo: ["Paediatric", "ENT"], suggests: "Out of pharmacist scope", action: "GP/ENT referral" },
];
