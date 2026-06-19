import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpenCheck,
  ClipboardList,
  Flag,
  LifeBuoy,
  Mail,
  MessageCircleQuestion,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/osce/Primitives";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "Learn / Reference: Hugh's OSCE Case Generator" }] }),
  component: LearnPage,
});

const TOOLS = [
  {
    to: "/viva",
    label: "Viva Mode",
    hint: "Examiner-style questions and model answers",
    icon: MessageCircleQuestion,
  },
  {
    to: "/scope",
    label: "Scope Checker",
    hint: "Protocol-aligned treat / refer / escalate drill",
    icon: ShieldCheck,
  },
  {
    to: "/redflags",
    label: "Red Flag Library",
    hint: "Searchable alarms and escalation prompts",
    icon: Flag,
  },
  {
    to: "/examination",
    label: "Examination Skills",
    hint: "OSCE-ready examination checklists and abdominal map",
    icon: Stethoscope,
  },
  {
    to: "/protocols",
    label: "Condition Protocol Cards",
    hint: "Quick age limits, scope, red flags, and review times",
    icon: BookOpenCheck,
  },
  {
    to: "/safetynet",
    label: "Safety-Net Builder",
    hint: "Patient-friendly safety-net scripts and GP follow-up wording",
    icon: LifeBuoy,
  },
  {
    to: "/letter",
    label: "GP Letter Generator",
    hint: "ISBAR handover and referral drafting",
    icon: Mail,
  },
  {
    to: "/references",
    label: "References",
    hint: "Source hierarchy and linked reference materials",
    icon: BookMarked,
  },
] as const;

function LearnPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Learn / Reference"
        title="Study tools and reference material."
        subtitle="This hub keeps the non-station tools together so practice flow stays simple while every learning feature remains reachable."
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="handbook-card p-5 hover:border-navy/40 transition-colors flex items-start gap-3"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="handbook-card p-5 mt-6">
        <div className="flex items-start gap-3">
          <ClipboardList className="h-5 w-5 text-navy mt-0.5" />
          <div>
            <p className="font-medium">Suggested order</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use `Cases` to pick a station, `Practice Exam Mode` to run it, then come back here for
              deeper protocol, red-flag, viva, or letter practice as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
