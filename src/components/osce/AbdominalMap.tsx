import { useState } from "react";

interface Region {
  id: string;
  label: string;
  differentials: string[];
  examFocus: string;
}

const REGIONS: Region[] = [
  {
    id: "RUQ",
    label: "Right upper quadrant",
    differentials: ["Cholecystitis", "Hepatitis", "Hepatic congestion", "Right lower lobe pneumonia"],
    examFocus: "Murphy's sign, hepatomegaly, jaundice screen.",
  },
  {
    id: "EPI",
    label: "Epigastrium",
    differentials: ["Peptic ulcer", "GORD", "Pancreatitis", "Cardiac referred pain (MI)"],
    examFocus: "Tenderness, ECG if cardiac suspected, lipase if pancreatitis suspected.",
  },
  {
    id: "LUQ",
    label: "Left upper quadrant",
    differentials: ["Splenomegaly", "Gastric ulcer", "Left lower lobe pneumonia"],
    examFocus: "Spleen palpation, percussion, respiratory exam.",
  },
  {
    id: "RF",
    label: "Right flank",
    differentials: ["Renal colic", "Pyelonephritis", "Ureteric stone"],
    examFocus: "Renal angle tenderness, urinalysis, ask about haematuria.",
  },
  {
    id: "UMB",
    label: "Umbilical / central",
    differentials: ["Early appendicitis", "Small-bowel obstruction", "AAA (older adults)", "Mesenteric ischaemia"],
    examFocus: "Pulsatile mass, bowel sounds, urgent referral if AAA suspected.",
  },
  {
    id: "LF",
    label: "Left flank",
    differentials: ["Renal colic", "Pyelonephritis", "Diverticulitis (descending colon)"],
    examFocus: "Renal angle tenderness, urinalysis.",
  },
  {
    id: "RIF",
    label: "Right iliac fossa",
    differentials: ["Appendicitis", "Ovarian pathology", "Ectopic pregnancy", "Inguinal hernia"],
    examFocus: "Rovsing's, psoas, obturator; βhCG in females of reproductive age.",
  },
  {
    id: "SUP",
    label: "Suprapubic",
    differentials: ["UTI", "Urinary retention", "Pelvic inflammatory disease", "Endometriosis"],
    examFocus: "Bladder palpation, urine dip, pelvic history.",
  },
  {
    id: "LIF",
    label: "Left iliac fossa",
    differentials: ["Diverticulitis", "Constipation", "Ovarian pathology", "Inguinal hernia"],
    examFocus: "Tenderness, bowel history, pelvic history.",
  },
];

export function AbdominalMap() {
  const [active, setActive] = useState<string>("UMB");
  const current = REGIONS.find((r) => r.id === active)!;

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-5">
      <div>
        <div
          role="group"
          aria-label="Nine-region abdominal map"
          className="aspect-square rounded-xl border border-border bg-parchment p-3 grid grid-cols-3 grid-rows-3 gap-1.5"
        >
          {REGIONS.map((r) => {
            const isActive = r.id === active;
            return (
              <button
                key={r.id}
                onClick={() => setActive(r.id)}
                aria-pressed={isActive}
                className={`rounded-md text-[11px] leading-tight text-center px-1 transition-colors ${
                  isActive
                    ? "bg-navy text-navy-foreground"
                    : "bg-card hover:bg-teal/40 text-foreground border border-border"
                }`}
              >
                <span className="font-mono block text-[10px] opacity-70">{r.id}</span>
                <span>{r.label.split(" ").slice(0, 2).join(" ")}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
          Tap a region for likely differentials and focused exam manoeuvres.
        </p>
      </div>

      <div className="handbook-card p-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Region</p>
        <h3 className="font-display text-xl text-navy mb-3">{current.label}</h3>

        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          Likely differentials
        </p>
        <ul className="text-sm mb-4 space-y-1">
          {current.differentials.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>

        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
          Focused exam / next step
        </p>
        <p className="text-sm">{current.examFocus}</p>
      </div>
    </div>
  );
}
