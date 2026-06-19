import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CASES, CASE_INDEX } from "@/data/cases";
import { PageHeader, Section, HiddenReveal } from "@/components/osce/Primitives";
import { getViva, hasCustomViva } from "@/lib/viva";
import { PageSourcesDrawer } from "@/components/osce/PageSourcesDrawer";
import { Printer, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/viva")({
  head: () => ({ meta: [{ title: "Viva Mode: Hugh's OSCE Case Generator" }] }),
  component: VivaPage,
});

function VivaPage() {
  const [caseId, setCaseId] = useState(CASES[0].id);
  const c = CASE_INDEX[caseId];
  const viva = useMemo(() => getViva(c), [c]);

  return (
    <div>
      <PageHeader
        eyebrow="Viva Mode"
        title="Five examiner-style questions per case."
        subtitle="Read the question, answer aloud, then reveal the model answer. Each case carries at least five viva questions covering diagnosis, red flags, scope, safety-net and patient education."
        actions={
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm no-print"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        }
      />

      <select
        value={caseId}
        onChange={(e) => setCaseId(e.target.value)}
        className="rounded-md border border-input bg-card px-3 py-2 text-sm mb-5 w-full max-w-md no-print"
      >
        {CASES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <div className="handbook-card p-5 mb-5 bg-parchment/60">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Case</p>
        <p className="font-display text-xl text-navy">{c.title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {c.category} · {c.condition} · Scope: {c.scopeDecision}
        </p>
      </div>

      {!hasCustomViva(c) && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm inline-flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            <strong>Missing custom viva block.</strong> Some questions below are generic fillers
            generated from the case's reasoning and red flags, not authored examiner questions.
            Treat as a scaffold and check against examiner guidance.
          </span>
        </div>
      )}


      <Section title="Viva questions" defaultOpen>
        <ol className="space-y-3 list-decimal pl-5">
          {viva.map((q, i) => (
            <li key={i} className="text-sm">
              <p className="font-medium text-foreground mb-1.5">{q.question}</p>
              <HiddenReveal label="Reveal model answer">
                <p className="leading-relaxed">{q.modelAnswer}</p>
              </HiddenReveal>
            </li>
          ))}
        </ol>
      </Section>

      <p className="text-xs text-muted-foreground italic mt-5">
        Model answers are training scaffolds. Verify any prescribing detail against the current
        Queensland Health pharmacist prescribing protocol.
      </p>

      <PageSourcesDrawer
        sources={c.sourceTags}
        needsVerification={c.needsVerification ?? true}
        verificationNotes={c.verificationNotes ?? ["Viva model answers must be checked against the current Queensland Health protocol before use as clinical guidance."]}
      />
    </div>
  );
}
