import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Wand2,
  Timer,
  UserRound,
  ClipboardCheck,
  ShieldCheck,
  Flag,
  Stethoscope,
  BookOpenCheck,
  LifeBuoy,
  Mail,
  BarChart3,
  Library,
  BookMarked,
  MessageCircleQuestion,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generate", label: "Generate Case", icon: Wand2 },
  { to: "/practice", label: "Practice Exam Mode", icon: Timer },
  { to: "/patient", label: "Fake Patient Mode", icon: UserRound },
  { to: "/examiner", label: "Examiner Mode", icon: ClipboardCheck },
  { to: "/viva", label: "Viva Mode", icon: MessageCircleQuestion },
  { to: "/scope", label: "Scope Checker", icon: ShieldCheck },
  { to: "/redflags", label: "Red Flag Library", icon: Flag },
  { to: "/examination", label: "Examination Skills", icon: Stethoscope },
  { to: "/protocols", label: "Condition Protocol Cards", icon: BookOpenCheck },
  { to: "/safetynet", label: "Safety-Net Builder", icon: LifeBuoy },
  { to: "/letter", label: "GP Letter Generator", icon: Mail },
  { to: "/performance", label: "My Performance", icon: BarChart3 },
  { to: "/cases", label: "Case Bank", icon: Library },
  { to: "/references", label: "References", icon: BookMarked },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:h-screen flex flex-col`}
      >
        <div className="px-6 py-6 border-b border-sidebar-border">
          <p className="text-[10px] tracking-[0.2em] uppercase text-sidebar-primary/80">Hugh's</p>
          <h1 className="font-display text-xl leading-tight mt-1">OSCE Case Generator</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1.5 italic">
            Pharmacist Prescribing Practice Exams, Queensland Protocol Style
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mb-0.5 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-sidebar-primary pl-[10px]"
                    : "hover:bg-sidebar-accent/40 text-sidebar-foreground/85"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-sidebar-border text-[11px] text-sidebar-foreground/60 leading-snug">
          Training tool only. Always verify against current Queensland Health protocol.
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2 -ml-2 rounded-md hover:bg-muted"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <p className="font-display text-base leading-none">Hugh's OSCE Case Generator</p>
            <p className="text-[11px] text-muted-foreground">Queensland Protocol Style</p>
          </div>
        </header>

        <main className="flex-1 px-5 lg:px-10 py-8 max-w-[1240px] w-full mx-auto">{children}</main>

        <footer className="border-t border-border px-5 lg:px-10 py-6 text-xs text-muted-foreground leading-relaxed">
          <p className="max-w-3xl">
            <strong className="text-foreground font-semibold">Training tool only.</strong> This app
            supports OSCE preparation and must not be used as a substitute for checking the current
            Queensland Health clinical practice guideline, local legislation, professional judgement
            or university marking guidance. Doses and prescribing decisions must always be verified
            against the current Queensland Health pharmacist prescribing protocol.
          </p>
        </footer>
      </div>
    </div>
  );
}
