import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section } from "@/components/osce/Primitives";
import { ClipboardCheck, Monitor, UserRound } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/practice/actor-examiner")({
  validateSearch: z.object({
    caseId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Actor / Examiner Mode: Hugh's OSCE Case Generator" }] }),
  component: ActorExaminerModePage,
});

function ActorExaminerModePage() {
  const { caseId: searchCaseId } = Route.useSearch();
  const initialCaseId =
    searchCaseId && CASE_INDEX[searchCaseId] ? searchCaseId : CASES[0].id;
  const [caseId, setCaseId] = useState(initialCaseId);
  const c = CASE_INDEX[caseId];

  useEffect(() => {
    if (searchCaseId && CASE_INDEX[searchCaseId]) {
      setCaseId(searchCaseId);
    }
  }, [searchCaseId]);

  return (
    <div>
      <PageHeader
        eyebrow="Practice Exam Mode · Actor / Examiner Mode"
        title="Run the station across two devices."
        subtitle="Choose one case, then open the actor screen on one device and the examiner sheet on the other. Both links stay pinned to the same case."
      />

      <div className="handbook-card p-4 mb-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Selected case
          </span>
          <select
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="mt-1 w-full max-w-xl rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            {CASES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm text-muted-foreground">
          {c.category} · {c.condition} · {c.timeMinutes}-minute station
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link
          to="/patient"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Open actor screen</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this on the patient/actor device. It keeps the diagnosis hidden and exposes the
              role-play script for the selected case.
            </p>
          </div>
        </Link>

        <Link
          to="/examiner"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Open examiner screen</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this on the examiner device. It loads the same case with the timer, rubric,
              red-flag checklist, and attempt logging.
            </p>
          </div>
        </Link>
      </div>

      <Section title="Recommended setup" defaultOpen>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">1. Pick the case once</p>
            <p className="mt-1 text-muted-foreground">
              The selected station stays attached to both launch buttons above.
            </p>
          </div>
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">2. Open both views</p>
            <p className="mt-1 text-muted-foreground">
              One device runs the actor script, one device runs the examiner sheet.
            </p>
          </div>
          <div className="rounded-md border border-border bg-parchment/50 p-3 text-sm">
            <p className="font-medium text-navy">3. Keep the case reference handy</p>
            <p className="mt-1 text-muted-foreground">
              Use the full case page only for setup or review, not during the simulated station.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/cases/$caseId"
            params={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <Monitor className="h-4 w-4" /> Open full case reference
          </Link>
          <Link
            to="/practice/solo"
            search={{ caseId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            Switch to Solo Mode
          </Link>
        </div>
      </Section>
    </div>
  );
}
