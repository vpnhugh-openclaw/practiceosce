export const EXAMINATION_SKILLS = [
  {
    id: "gals",
    name: "GALS / Musculoskeletal",
    intro: "Gait, Arms, Legs, Spine: focused screen for MSK presentations.",
    sections: [
      {
        heading: "Preparation",
        steps: ["Introduce self, confirm patient, gain consent", "Hand hygiene", "Offer chaperone where appropriate", "Expose appropriate areas with dignity"],
      },
      {
        heading: "Screening questions",
        steps: ["Any pain or stiffness in muscles, joints or back?", "Can you dress yourself without difficulty?", "Can you walk up and down stairs without difficulty?"],
      },
      {
        heading: "Gait",
        steps: ["Observe walking: symmetry, stride length, arm swing, antalgic gait", "Turn 180°: smoothness, balance"],
      },
      {
        heading: "Standing observation",
        steps: ["Front: muscle bulk, symmetry, deformity", "Side: cervical / thoracic / lumbar curves", "Back: scoliosis, muscle bulk, iliac crest level"],
      },
      {
        heading: "Spine",
        steps: ["Palpate spinous processes, paraspinal muscles", "Lumbar flexion: touch toes; observe lumbar curve", "Cervical lateral flexion (ear to shoulder)"],
      },
      {
        heading: "Arms",
        steps: ["Hands behind head", "Hands behind back", "Grip strength", "Squeeze MCPs", "Pincer grip"],
      },
      {
        heading: "Legs",
        steps: ["Internal/external rotation of hips", "Patella tap for effusion", "Crepitus on knee flexion", "Inspect feet: calluses, deformity"],
      },
      {
        heading: "Conclude",
        steps: ["Thank patient", "Document GALS as normal/abnormal per region", "Escalate findings appropriately"],
      },
    ],
  },
  {
    id: "respiratory",
    name: "Respiratory examination",
    intro: "Inspect → palpate → percuss → auscultate. CHUPO red flags throughout.",
    sections: [
      {
        heading: "End-of-bed-o-gram",
        steps: ["Tripoding, accessory muscle use, pursed-lip breathing", "Ability to speak in full sentences (CHUPO)", "Cyanosis, pallor, distress"],
      },
      {
        heading: "Vitals",
        steps: ["SpO₂", "RR", "HR", "Temperature", "Peak flow if asthma"],
      },
      {
        heading: "Head and neck",
        steps: ["Eyes: pallor", "Mouth: central cyanosis, thrush (ICS use)", "Tracheal position"],
      },
      {
        heading: "Hands",
        steps: ["Tremor (β2 overuse)", "Clubbing", "Peripheral cyanosis", "Tar staining"],
      },
      {
        heading: "Chest",
        steps: ["Chest expansion (symmetry)", "Percussion (anterior + posterior)", "Auscultation: wheeze, crackles, vocal resonance 'would do if time'", "Anterior repeat 'would do if time'"],
      },
      {
        heading: "Feet",
        steps: ["Peripheral oedema (cor pulmonale)"],
      },
      {
        heading: "Conclude",
        steps: ["Thank patient", "Summarise findings using CHUPO framework", "Decide scope"],
      },
    ],
  },
  {
    id: "ent",
    name: "ENT examination",
    intro: "Systematic eyes → nose → mouth/throat → neck → ears.",
    sections: [
      {
        heading: "End-of-bed-o-gram",
        steps: ["Distress, drooling, stridor", "Hearing"],
      },
      {
        heading: "Eyes",
        steps: ["Allergic shiners, conjunctival injection"],
      },
      {
        heading: "Nose and sinuses",
        steps: ["Inspect external nose", "Palpate frontal and maxillary sinuses", "Anterior rhinoscopy: turbinates, discharge, polyps"],
      },
      {
        heading: "Mouth / throat",
        steps: ["Dentition, oral mucosa, tongue", "Tonsils, pharynx: cobblestoning"],
      },
      {
        heading: "Neck",
        steps: ["Cervical lymph nodes", "TMJ tenderness", "Mastoid tenderness"],
      },
      {
        heading: "Hearing",
        steps: ["Whisper test at 60 cm: 'say 99'"],
      },
      {
        heading: "Ears",
        steps: ["External ear inspection", "Pinna and tragus tenderness (AOE vs AOM)", "Otoscopy: canal, TM colour, bulging/retraction, cone of light, perforation"],
      },
    ],
  },
  {
    id: "abdominal",
    name: "Abdominal examination",
    intro: "Inspect → palpate (9 regions, superficial then deep) → percuss → auscultate.",
    sections: [
      {
        heading: "End-of-bed-o-gram",
        steps: ["Distress, jaundice, pallor", "Position (still vs restless)"],
      },
      {
        heading: "Hands and face",
        steps: ["Clubbing, leuconychia, palmar erythema", "Eyes: jaundice, pallor", "Mouth: hydration, dentition"],
      },
      {
        heading: "Hydration",
        steps: ["Capillary refill", "Mucous membranes", "Skin turgor", "Peripheral oedema"],
      },
      {
        heading: "Abdomen",
        steps: ["Inspect: distension, scars, masses", "9-region superficial palpation", "9-region deep palpation", "Liver palpation", "Splenic palpation", "Ascites: shifting dullness", "Bowel sounds"],
      },
      {
        heading: "Reasoning",
        steps: ["Differentiate GORD vs PUD vs gallbladder vs cardiac overlap", "Decide scope and red flags"],
      },
    ],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular examination",
    intro: "Useful in respiratory, abdominal and weight-management presentations.",
    sections: [
      { heading: "End-of-bed-o-gram", steps: ["Distress, breathlessness", "Oedema"] },
      { heading: "Vitals", steps: ["BP both arms (where relevant)", "HR rate and rhythm", "SpO₂"] },
      { heading: "Hands", steps: ["Diaphoresis", "Temperature", "Colour, capillary refill", "Clubbing, splinter haemorrhages"] },
      { heading: "Eyes / mouth", steps: ["Conjunctival pallor", "Central cyanosis"] },
      { heading: "Legs", steps: ["Peripheral oedema"] },
      { heading: "Auscultation", steps: ["APTM 2245: Aortic 2R, Pulmonary 2L, Tricuspid 4L, Mitral 5L mid-clavicular"] },
    ],
  },
];
