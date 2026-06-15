import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Section({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="handbook-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-parchment border-b border-border"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base text-navy">{title}</h3>
          {badge}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions }: { title: string; subtitle?: string; eyebrow?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        {eyebrow && <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-4xl text-navy">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-sm border-b border-border last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}

export function HiddenReveal({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-dashed border-border rounded-md">
      <button onClick={() => setOpen((o) => !o)} className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-muted/40">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Reveal"}</span>
      </button>
      {open && <div className="px-3 pb-3 pt-1 text-sm">{children}</div>}
    </div>
  );
}
