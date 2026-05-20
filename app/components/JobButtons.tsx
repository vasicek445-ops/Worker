"use client";

import { useSyncExternalStore, useCallback } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getLocalList(key: string): number[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function getServerSnapshot(): number[] {
  return [];
}

export function SaveButton({ jobId }: { jobId: number }) {
  const list = useSyncExternalStore(
    subscribe,
    useCallback(() => getLocalList("woker_saved"), []),
    getServerSnapshot,
  );
  const saved = list.includes(jobId);

  function toggle() {
    const current = getLocalList("woker_saved");
    const updated = current.includes(jobId)
      ? current.filter((id: number) => id !== jobId)
      : [...current, jobId];
    localStorage.setItem("woker_saved", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); toggle(); }}
      className={`border font-bold py-3 px-4 rounded-xl text-sm ${
        saved
          ? "bg-[#E8302A]/20 border-[#E8302A] text-[#E8302A]"
          : "bg-[#111] border-gray-800 text-gray-500"
      }`}
    >
      {saved ? "♥" : "🔖"}
    </button>
  );
}

export function ApplyButton({ jobId, jobTitle }: { jobId: number; jobTitle: string }) {
  const list = useSyncExternalStore(
    subscribe,
    useCallback(() => getLocalList("woker_applied"), []),
    getServerSnapshot,
  );
  const applied = list.some((a: { id: number } | number) =>
    typeof a === "object" ? a.id === jobId : a === jobId
  );

  function apply() {
    if (applied) return;
    const current: Array<{ id: number; date: string; status: string }> = JSON.parse(
      localStorage.getItem("woker_applied") || "[]"
    );
    const today = new Date().toLocaleDateString("cs-CZ");
    current.push({ id: jobId, date: today, status: "Odesláno" });
    localStorage.setItem("woker_applied", JSON.stringify(current));
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); apply(); }}
      className={`flex-1 text-center py-3 rounded-xl text-sm font-bold ${
        applied
          ? "bg-green-600 text-white"
          : "bg-[#E8302A] text-white"
      }`}
    >
      {applied ? "✓ Přihlášeno" : "Zobrazit kontakt →"}
    </button>
  );
}
