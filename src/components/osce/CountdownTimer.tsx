import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Clock3 } from "lucide-react";

export interface CountdownTimerProps {
  defaultMinutes?: number;
  onComplete?: () => void;
  sticky?: boolean;
  label?: string;
  /** Allow custom-time override input. Real OSCE Mode default is 20. */
  allowCustom?: boolean;
}

/**
 * 20-minute Real OSCE Mode countdown.
 * Colour states: green 20:00→10:00, amber 10:00→05:00, red 05:00→00:00.
 * Shows "2 minutes remaining" notice at 2:00 and "Time complete" at 0:00.
 */
export function CountdownTimer({
  defaultMinutes = 20,
  onComplete,
  sticky = true,
  label = "20-minute Real OSCE Practice",
  allowCustom = true,
}: CountdownTimerProps) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [seconds, setSeconds] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSeconds(minutes * 60);
    setCompleted(false);
    setRunning(false);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    intRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          setCompleted(true);
          onComplete?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intRef.current) clearInterval(intRef.current);
    };
  }, [running, onComplete]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // Colour state thresholds scale with chosen duration so non-20 minute
  // sessions still pass through green→amber→red bands proportionally.
  const total = minutes * 60;
  const greenThreshold = total / 2; // top half = green
  const amberThreshold = total / 4; // next quarter = amber
  const state: "green" | "amber" | "red" =
    seconds > greenThreshold ? "green" : seconds > amberThreshold ? "amber" : "red";

  const tone =
    state === "green"
      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
      : state === "amber"
      ? "bg-amber-50 text-amber-900 border-amber-300"
      : "bg-red-50 text-red-900 border-red-300";

  const showTwoMinWarning = seconds > 0 && seconds <= 120 && !completed;

  return (
    <div
      className={`${sticky ? "sticky top-2 z-30" : ""} handbook-card border-2 ${tone} p-3 sm:p-4 flex flex-wrap items-center gap-3`}
    >
      <Clock3 className="h-5 w-5" />
      <div className="flex-1 min-w-[180px]">
        <p className="text-[11px] uppercase tracking-wide opacity-70">{label}</p>
        <p className="font-mono text-3xl sm:text-4xl tabular-nums leading-none mt-0.5">
          {mm}:{ss}
        </p>
        {showTwoMinWarning && (
          <p className="text-xs font-medium mt-1">⚠ 2 minutes remaining</p>
        )}
        {completed && <p className="text-sm font-semibold mt-1">Time complete: finalise score and feedback.</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {allowCustom && (
          <label className="flex items-center gap-1 text-xs">
            <span>min</span>
            <input
              type="number"
              min={1}
              max={60}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(60, Number(e.target.value) || 20)))}
              className="w-14 rounded border border-input bg-card px-2 py-1 text-sm"
            />
          </label>
        )}
        <button
          onClick={() => {
            if (completed) {
              setSeconds(minutes * 60);
              setCompleted(false);
            }
            setRunning((r) => !r);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-navy text-navy-foreground px-3 py-1.5 text-sm"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : completed ? "Restart" : seconds === minutes * 60 ? "Start" : "Resume"}
        </button>
        <button
          onClick={() => {
            setSeconds(minutes * 60);
            setRunning(false);
            setCompleted(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
    </div>
  );
}
