import { createFileRoute, Link } from "@tanstack/react-router";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader } from "@/components/osce/Primitives";
import { ClipboardCheck, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

export const Route = createFileRoute("/practice/")({
  validateSearch: z.object({
    caseId: z.string().optional(),
  }),
  head: () => ({ meta: [{ title: "Practice Exam Mode: Hugh's OSCE Case Generator" }] }),
  component: PracticeModePage,
});

function PracticeModePage() {
  const { caseId: searchCaseId } = Route.useSearch();
  const initialCaseId = searchCaseId && CASE_INDEX[searchCaseId] ? searchCaseId : CASES[0].id;
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
        eyebrow="Practice Exam Mode"
        title="Choose how you want to run the station."
        subtitle="Pick a case once, then launch either a two-device actor/examiner setup or a solo timed station."
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
          to="/practice/actor-examiner"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Actor / Examiner Mode</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Two people, two devices. One screen runs the patient script; the other runs the
              examiner marking sheet for the same case.
            </p>
          </div>
        </Link>

        <Link
          to="/practice/solo"
          search={{ caseId }}
          className="handbook-card flex h-full flex-col gap-3 p-5 transition-colors hover:border-navy/40"
        >
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-muted text-navy">
            <Timer className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl text-navy">Solo Mode</p>
            <p className="mt-2 text-sm text-muted-foreground">
              One device, timed practice. Work the station yourself, reveal the answer, and review
              progress without switching between separate top-level tools.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
