// Local-first OSCE attempt tracking via localStorage.
import { useCallback, useEffect, useState } from "react";

const KEY = "osce.attempts.v1";

export interface AttemptRecord {
  id: string;
  caseId: string;
  caseTitle: string;
  category: string;
  condition: string;
  scopeExpected: string;
  earned: number;
  max: number;
  pct: number;
  result: "Pass" | "Borderline" | "Fail" | "Fail (critical fail triggered)";
  criticalFail: boolean;
  missedRubric: string[];
  notes?: string;
  createdAt: number;
}

function read(): AttemptRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "[]") as AttemptRecord[];
  } catch {
    return [];
  }
}

function write(records: AttemptRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
  window.dispatchEvent(new Event("osce:attempts-changed"));
}

export function logAttempt(rec: Omit<AttemptRecord, "id" | "createdAt">) {
  const full: AttemptRecord = {
    ...rec,
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  write([full, ...read()].slice(0, 500));
  return full;
}

export function clearAttempts() {
  write([]);
}

export function useAttempts() {
  const [items, setItems] = useState<AttemptRecord[]>([]);
  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    window.addEventListener("osce:attempts-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("osce:attempts-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const reset = useCallback(() => {
    clearAttempts();
    setItems([]);
  }, []);

  return { items, reset };
}
