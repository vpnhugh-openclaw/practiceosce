import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/osce/Primitives";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "My Performance — Hugh's OSCE Case Generator" }] }),
  component: PerformancePage,
});

function PerformancePage() {
  return (
    <div>
      <PageHeader eyebrow="My Performance" title="Track your weak areas." subtitle="Performance tracking is coming soon — it requires sign-in so your scores can be saved across sessions." />
      <Section title="Coming next">
        <ul className="text-sm space-y-1">
          <li>• Cases completed, scores over time, conditions practised</li>
          <li>• Red flags missed, scope errors, referral errors, safety-netting omissions</li>
          <li>• Weak-area recommendations and suggested repeat cases</li>
          <li>• Will activate after Lovable Cloud is enabled for sign-in</li>
        </ul>
      </Section>
    </div>
  );
}
