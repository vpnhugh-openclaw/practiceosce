import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CASES } from "@/data/cases";
import { PageHeader } from "@/components/osce/Primitives";
import { ScopeDecisionBadge } from "@/components/osce/ScopeBadges";
import { Shuffle, ArrowRight } from "lucide-react";
import type { ConditionCategory, Difficulty, CaseType } from "@/lib/types";

export const Route = createFileRoute("/generate")({
  head: () => ({ meta: [{ title: "Generate Case — Hugh's OSCE Case Generator" }] }),
  component: GeneratePage,
});

const SUBJECTS = ["Random", "ENT", "Gastrointestinal", "Respiratory"] as const;
type Subject = typeof SUBJECTS[number];

const CATEGORIES: ConditionCategory[] = [
  "Respiratory","ENT","Dermatology","Gastrointestinal","Cardiovascular",
  "Women's health","Musculoskeletal","Weight management","Smoking cessation","Oral health","Travel health","Wound management",
];
const DIFFS: Difficulty[] = ["Beginner", "Standard OSCE", "Difficult", "Brutal"];
const TIMES = [10, 15, 20, 25, 30];
const TYPES: CaseType[] = [
  "In-scope routine","Treat and refer","Refer only","Emergency referral","Diagnostic uncertainty","Protocol trap",
  "Communication heavy","Examination heavy","Safety-netting heavy","Marked emotional impact","Paediatric","Pregnancy/breastfeeding trap","Comorbidity trap","Medication contraindication trap",
];
const ROLES = ["Student brief","Fake patient script","Examiner key","Full OSCE station","Viva mode","Timed practice"] as const;

function GeneratePage() {
  const [subject, setSubject] = useState<Subject>("Random");
  const [category, setCategory] = useState<ConditionCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");
  const [time, setTime] = useState<number | "All">("All");
  const [type, setType] = useState<CaseType | "All">("All");
  const [role, setRole] = useState<typeof ROLES[number]>("Full OSCE station");

  const subjectCat: ConditionCategory | "All" =
    subject === "ENT" ? "ENT" : subject === "Gastrointestinal" ? "Gastrointestinal" : subject === "Respiratory" ? "Respiratory" : "All";

  const matches = useMemo(() => CASES.filter((c) =>
    (subjectCat === "All" || c.category === subjectCat) &&
    (category === "All" || c.category === category) &&
    (difficulty === "All" || c.difficulty === difficulty) &&
    (time === "All" || c.timeMinutes === time) &&
    (type === "All" || c.caseType.includes(type))
  ), [subjectCat, category, difficulty, time, type]);

  const random = matches[Math.floor(Math.random() * Math.max(matches.length, 1))];

  return (
    <div>
      <PageHeader eyebrow="Generate Case" title="Build your station." subtitle="Filter by subject, condition, type, difficulty and role. Default station time is 20 minutes." />

      <div className="handbook-card p-5 mb-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Subject" value={subject} onChange={(v) => setSubject(v as Subject)} options={[...SUBJECTS]} />
        <Select label="Role / view" value={role} onChange={(v) => setRole(v as typeof ROLES[number])} options={[...ROLES]} />
        <Select label="Condition category" value={category} onChange={(v) => setCategory(v as ConditionCategory | "All")} options={["All", ...CATEGORIES]} />
        <Select label="Case type" value={type} onChange={(v) => setType(v as CaseType | "All")} options={["All", ...TYPES]} />
        <Select label="Difficulty" value={difficulty} onChange={(v) => setDifficulty(v as Difficulty | "All")} options={["All", ...DIFFS]} />
        <Select label="Time (min)" value={String(time)} onChange={(v) => setTime(v === "All" ? "All" : Number(v))} options={["All", ...TIMES.map(String)]} />
      </div>

      {random && (
        <div className="handbook-card p-5 mb-6 bg-accent/40 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Shuffle className="h-5 w-5 text-navy" />
            <div>
              <p className="text-xs text-muted-foreground">Random pick from {matches.length} matching {matches.length === 1 ? "case" : "cases"}</p>
              <p className="font-medium">{random.title}</p>
            </div>
          </div>
          <Link to="/cases/$caseId" params={{ caseId: random.id }} className="inline-flex items-center gap-2 rounded-md bg-navy text-navy-foreground px-4 py-2 text-sm font-medium">
            Open case <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {matches.map((c) => (
          <Link key={c.id} to="/cases/$caseId" params={{ caseId: c.id }} className="handbook-card p-4 hover:border-navy/40">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.category} · {c.timeMinutes} min</p>
              <ScopeDecisionBadge status={c.scopeDecision} size="sm" />
            </div>
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.caseType.join(" · ")}</p>
          </Link>
        ))}
        {matches.length === 0 && <p className="text-muted-foreground text-sm">No cases match — try widening the filters.</p>}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={String(value)} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
