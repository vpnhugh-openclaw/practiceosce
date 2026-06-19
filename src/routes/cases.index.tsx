import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { CASES } from "@/data/cases";
import { PageHeader } from "@/components/osce/Primitives";
import { ScopeDecisionBadge } from "@/components/osce/ScopeBadges";
import type { CaseType, ConditionCategory, Difficulty } from "@/lib/types";

export const Route = createFileRoute("/cases/")({
  head: () => ({ meta: [{ title: "Cases: Hugh's OSCE Case Generator" }] }),
  component: CasesPage,
});

const SUBJECTS = ["Random", "ENT", "Gastrointestinal", "Respiratory"] as const;
type Subject = (typeof SUBJECTS)[number];

const CATEGORIES: ConditionCategory[] = [
  "Respiratory",
  "ENT",
  "Dermatology",
  "Gastrointestinal",
  "Cardiovascular",
  "Women's health",
  "Musculoskeletal",
  "Weight management",
  "Smoking cessation",
  "Oral health",
  "Travel health",
  "Wound management",
];
const DIFFS: Difficulty[] = ["Beginner", "Standard OSCE", "Difficult", "Brutal"];
const TIMES = [10, 15, 20, 25, 30];
const TYPES: CaseType[] = [
  "In-scope routine",
  "Treat and refer",
  "Refer only",
  "Emergency referral",
  "Diagnostic uncertainty",
  "Protocol trap",
  "Communication heavy",
  "Examination heavy",
  "Safety-netting heavy",
  "Marked emotional impact",
  "Paediatric",
  "Pregnancy/breastfeeding trap",
  "Comorbidity trap",
  "Medication contraindication trap",
];

function CasesPage() {
  const [subject, setSubject] = useState<Subject>("Random");
  const [category, setCategory] = useState<ConditionCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [time, setTime] = useState<number | "All">("All");
  const [type, setType] = useState<CaseType | "All">("All");
  const [pickIndex, setPickIndex] = useState(0);

  const subjectCat: ConditionCategory | "All" =
    subject === "ENT"
      ? "ENT"
      : subject === "Gastrointestinal"
        ? "Gastrointestinal"
        : subject === "Respiratory"
          ? "Respiratory"
          : "All";

  const matches = useMemo(
    () =>
      CASES.filter(
        (c) =>
          (subjectCat === "All" || c.category === subjectCat) &&
          (category === "All" || c.category === category) &&
          (difficulty === "All" || c.difficulty === difficulty) &&
          (time === "All" || c.timeMinutes === time) &&
          (type === "All" || c.caseType.includes(type)),
      ),
    [subjectCat, category, difficulty, time, type],
  );

  const featured = matches.length ? matches[pickIndex % matches.length] : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Cases"
        title="Launch a station from one place."
        subtitle="Browse, filter, and start seeded OSCE cases without bouncing between separate Generate and Case Bank screens."
      />

      <div className="handbook-card mb-6 grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-3">
        <Select
          label="Subject"
          value={subject}
          onChange={(v) => setSubject(v as Subject)}
          options={[...SUBJECTS]}
        />
        <Select
          label="Condition category"
          value={category}
          onChange={(v) => setCategory(v as ConditionCategory | "All")}
          options={["All", ...CATEGORIES]}
        />
        <Select
          label="Case type"
          value={type}
          onChange={(v) => setType(v as CaseType | "All")}
          options={["All", ...TYPES]}
        />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={(v) => setDifficulty(v as Difficulty | "All")}
          options={["All", ...DIFFS]}
        />
        <Select
          label="Time (min)"
          value={String(time)}
          onChange={(v) => setTime(v === "All" ? "All" : Number(v))}
          options={["All", ...TIMES.map(String)]}
        />
      </div>

      {featured && (
        <div className="handbook-card mb-6 flex flex-wrap items-center justify-between gap-4 bg-accent/40 p-5">
          <div className="flex items-center gap-3">
            <Shuffle className="h-5 w-5 text-navy" />
            <div>
              <p className="text-xs text-muted-foreground">
                Featured pick from {matches.length} matching{" "}
                {matches.length === 1 ? "case" : "cases"}
              </p>
              <p className="font-medium">{featured.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPickIndex((index) => index + 1)}
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Shuffle pick
            </button>
            <CaseActions caseId={featured.id} />
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((c) => (
          <div key={c.id} className="handbook-card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {c.category} · {c.timeMinutes} min · {c.difficulty}
              </p>
              <ScopeDecisionBadge status={c.scopeDecision} size="sm" />
            </div>
            <p className="font-medium">{c.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.caseType.join(" · ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CaseActions caseId={c.id} />
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No cases match. Widen the filters and try again.
          </p>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function CaseActions({ caseId }: { caseId: string }) {
  return (
    <>
      <Link
        to="/cases/$caseId"
        params={{ caseId }}
        className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        Open case
      </Link>
      <Link
        to="/practice/solo"
        search={{ caseId }}
        className="inline-flex min-h-11 items-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Solo Mode
      </Link>
      <Link
        to="/practice/actor-examiner"
        search={{ caseId }}
        className="inline-flex min-h-11 items-center rounded-md bg-navy px-3 py-2 text-sm font-medium text-navy-foreground hover:opacity-90"
      >
        Actor / Examiner
      </Link>
    </>
  );
}
