"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

export default function Ulozene() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      const saved = JSON.parse(localStorage.getItem("woker_saved") || "[]");
      if (saved.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("Nabídky")
        .select("*")
        .in("id", saved);
      setJobs(data || []);
      setLoading(false);
    }
    loadSaved();
  }, []);

  function removeSaved(id: number) {
    const saved = JSON.parse(localStorage.getItem("woker_saved") || "[]");
    const updated = saved.filter((s: number) => s !== id);
    localStorage.setItem("woker_saved", JSON.stringify(updated));
    setJobs(jobs.filter((j) => j.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#0E0E0E] pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white text-2xl font-black mb-1">Uložené nabídky</h1>
        <p className="text-gray-500 text-sm">
          {jobs.length} {jobs.length === 1 ? "nabídka" : "nabídek"} uložených
        </p>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="text-gray-500 text-center py-20">Načítám...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-white font-bold text-lg mb-2">Zatím nic uloženého</h3>
            <p className="text-gray-500 text-sm mb-6">
              Klikni na 🔖 u nabídky pro uložení
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#E8302A] text-white px-6 py-3 rounded-xl font-bold text-sm"
            >
              Prohlédnout nabídky
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h4 className="text-white font-bold text-base leading-tight mb-1">
                      {job.title}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div className="bg-[#E8302A] text-white rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black leading-none">
                      {job.match}%
                    </span>
                    <span className="text-[8px] leading-none opacity-80">
                      match
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">
                    {job.type || "Full-time"}
                  </span>
                  <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">
                    {job.salary || "Dle dohody"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/nabidka?id=${job.id}`}
                    className="flex-1 bg-[#E8302A] text-white text-center py-3 rounded-xl text-sm font-bold"
                  >
                    Zobrazit kontakt →
                  </Link>
                  <button
                    onClick={() => removeSaved(job.id)}
                    className="bg-[#111] border border-gray-800 text-red-400 font-bold py-3 px-4 rounded-xl text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
