import type { SourceTag } from "@/lib/types";
import { SourcesDrawer } from "@/components/osce/SourcesDrawer";

/** Default fallback source list used whenever a case/protocol does not
 * carry its own explicit `sourceTags`. */
export const DEFAULT_PROTOCOL_SOURCES: SourceTag[] = [
  {
    id: "qh-scope-pilot",
    title: "Queensland Pharmacist Scope of Practice Pilot: Clinical Practice Guidelines",
    locator: "Source imported, page reference pending.",
    reliability: "government-protocol",
    url: "https://www.health.qld.gov.au/clinical-practice/guidelines-procedures/medicines/queensland-pharmacist-scope-of-practice-pilot",
  },
];

interface Props {
  /** Optional explicit per-content sources. If empty, default QH protocol source is used. */
  sources?: SourceTag[];
  needsVerification?: boolean;
  verificationNotes?: string[];
  label?: string;
}

/**
 * Page-level "Reference basis" drawer. Use at the bottom of any clinical
 * page or card where the student needs to see where the content came from.
 */
export function PageSourcesDrawer({ sources, needsVerification, verificationNotes, label }: Props) {
  const final = sources && sources.length > 0 ? sources : DEFAULT_PROTOCOL_SOURCES;
  return (
    <SourcesDrawer
      sources={final}
      needsVerification={needsVerification}
      verificationNotes={verificationNotes}
      label={label ?? "Reference basis"}
    />
  );
}
