import type { ScopeStatus, ProtocolConfidence } from "@/lib/types";
import { AlertTriangle, CheckCircle2, ArrowRight, Siren, HelpCircle } from "lucide-react";

const SCOPE_META: Record<ScopeStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  "in-scope": { label: "In scope — treat", className: "scope-pill-green", Icon: CheckCircle2 },
  "treat-and-refer": { label: "In scope — treat and refer", className: "scope-pill-amber", Icon: ArrowRight },
  "refer-only": { label: "Out of scope — refer", className: "scope-pill-red", Icon: AlertTriangle },
  "emergency": { label: "Emergency / hospital", className: "scope-pill-black", Icon: Siren },
  "needs-protocol-check": { label: "Needs protocol check", className: "scope-pill-amber", Icon: HelpCircle },
};

export function ScopeDecisionBadge({ status, size = "md" }: { status: ScopeStatus; size?: "sm" | "md" | "lg" }) {
  const { label, className, Icon } = SCOPE_META[status];
  const sizing = size === "lg" ? "px-4 py-2 text-sm" : size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizing} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

const CONF_META: Record<ProtocolConfidence, { label: string; className: string }> = {
  high: { label: "Protocol verified", className: "bg-emerald-100 text-emerald-800" },
  medium: { label: "Protocol — medium confidence", className: "bg-amber-100 text-amber-800" },
  low: { label: "Protocol — low confidence", className: "bg-orange-100 text-orange-800" },
  "needs-review": { label: "Needs protocol review", className: "bg-rose-100 text-rose-800" },
};

export function ProtocolConfidenceBadge({ confidence }: { confidence: ProtocolConfidence }) {
  const m = CONF_META[confidence];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${m.className}`}>
      {m.label}
    </span>
  );
}

export function ProtocolCheckWarning({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 px-4 py-3 text-sm flex gap-3">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Protocol check required</p>
        <p className="mt-1 leading-relaxed">
          {children ??
            "Verify medicine choice, dose and duration against the current Queensland Health pharmacist prescribing protocol before prescribing. This app deliberately does not display doses until protocol verification is complete."}
        </p>
      </div>
    </div>
  );
}

export function RedFlagBox({ items, title = "Red flags" }: { items: string[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
      <p className="font-semibold text-destructive text-sm flex items-center gap-1.5">
        <AlertTriangle className="h-4 w-4" />
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i} className="text-destructive/90">• {i}</li>
        ))}
      </ul>
    </div>
  );
}
