import { useState } from "react";
import { BookOpenCheck, ChevronDown, AlertTriangle, ExternalLink } from "lucide-react";
import type { SourceTag } from "@/lib/types";
import { RELIABILITY_LABEL } from "@/data/references";

interface Props {
  sources?: SourceTag[];
  needsVerification?: boolean;
  verificationNotes?: string[];
  label?: string;
  defaultOpen?: boolean;
}

/**
 * Compact, collapsible "Reference basis" drawer.
 * Sits below clinical content without crowding the main OSCE flow.
 */
export function SourcesDrawer({
  sources = [],
  needsVerification,
  verificationNotes = [],
  label = "Sources used",
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = sources.length > 0 || needsVerification || verificationNotes.length > 0;
  if (!hasContent) return null;

  return (
    <div className="mt-4 rounded-md border border-border bg-muted/30 text-sm print:bg-transparent">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <BookOpenCheck className="h-3.5 w-3.5" />
          {label}
          {needsVerification && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-red-foreground/10 text-red-foreground px-1.5 py-0.5 normal-case tracking-normal font-medium">
              <AlertTriangle className="h-3 w-3" />
              Needs verification before clinical use
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {sources.length > 0 && (
            <ul className="space-y-1.5">
              {sources.map((s) => (
                <li key={s.id} className="text-xs leading-snug">
                  <span className="font-medium text-foreground">{s.title}</span>
                  {s.locator && <span className="text-muted-foreground">, {s.locator}</span>}
                  <span className="ml-1 text-muted-foreground">
                    [{RELIABILITY_LABEL[s.reliability]}]
                  </span>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1 inline-flex items-center gap-0.5 text-navy hover:underline"
                    >
                      link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          {verificationNotes.length > 0 && (
            <ul className="text-xs text-red-foreground space-y-1 list-disc pl-4">
              {verificationNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          {sources.length === 0 && !verificationNotes.length && needsVerification && (
            <p className="text-xs text-red-foreground">
              No verified source attached. Confirm against the current Queensland Health pharmacist
              prescribing protocol before using clinically.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
