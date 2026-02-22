"use client";

import { useState, useEffect } from "react";

export function SaveButton({ jobId }: { jobId: number }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("woker_saved") || "[]");
    setSaved(list.includes(jobId));
  }, [jobId]);

  function toggle() {
    const list = JSON.parse(localStorage.getItem("woker_saved") || "[]");
    let updated;
    if (list.includes(jobId)) {
      updated = list.filter((id: number) => id !== jobId);
      setSaved(false);
    } else {
      updated = [...list, jobId];
      setSaved(true);
    }
    localStorage.setItem("woker_saved", JSON.stringify(updated));
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
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("woker_applied") || "[]");
    setApplied(list.some((a: any) => a.id === jobId));
  }, [jobId]);

  function apply() {
    if (applied) return;
    const list = JSON.parse(localStorage.getItem("woker_applied") || "[]");
    const today = new Date().toLocaleDateString("cs-CZ");
    list.push({ id: jobId, date: today, status: "Odesláno" });
    localStorage.setItem("woker_applied", JSON.stringify(list));
    setApplied(true);
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
