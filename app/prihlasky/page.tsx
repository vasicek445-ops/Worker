"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

export default function Prihlasky() {
  const [applications, setApplications] = useState<any[]>([]);
  const [smartApps, setSmartApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      // 1. Load localStorage applications (legacy)
      const applied = JSON.parse(localStorage.getItem("woker_applied") || "[]");
      if (applied.length > 0) {
        const ids = applied.map((a: any) => a.id);
        const { data } = await supabase
          .from("Nabídky")
          .select("*")
          .in("id", ids);

        const merged = (data || []).map((job: any) => {
          const app = applied.find((a: any) => a.id === job.id);
          return { ...job, appliedDate: app?.date, status: app?.status || "Odesláno" };
        });
        setApplications(merged);
      }

      // 2. Load Smart Matching applications from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbApps } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("sent_at", { ascending: false });

        setSmartApps(dbApps || []);
      }

      setLoading(false);
    }
    loadApplications();
  }, []);

  const statusColors: any = {
    "Odesláno": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "sent": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "Zobrazeno": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    "delivered": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    "Pohovor": "bg-green-500/10 text-green-400 border-green-500/30",
    "replied": "bg-green-500/10 text-green-400 border-green-500/30",
    "Zamítnuto": "bg-red-500/10 text-red-400 border-red-500/30",
    "rejected": "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const statusLabels: any = {
    sent: "Odesláno",
    delivered: "Doručeno",
    replied: "Odpověděli",
    rejected: "Zamítnuto",
  };

  const totalCount = applications.length + smartApps.length;
  const sentCount = applications.filter(a => a.status === "Odesláno").length + smartApps.filter(a => a.status === "sent").length;
  const repliedCount = applications.filter(a => a.status === "Pohovor").length + smartApps.filter(a => a.status === "replied").length;

  return (
    <main className="min-h-screen bg-[#0E0E0E] pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-white text-2xl font-black mb-1">Moje přihlášky</h1>
        <p className="text-gray-500 text-sm">
          {totalCount} {totalCount === 1 ? "přihláška" : "přihlášek"}
        </p>
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="px-5 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-white font-black text-xl">{totalCount}</div>
              <div className="text-gray-500 text-xs">Celkem</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-blue-400 font-black text-xl">{sentCount}</div>
              <div className="text-gray-500 text-xs">Odesláno</div>
            </div>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-black text-xl">{repliedCount}</div>
              <div className="text-gray-500 text-xs">Odpovědi</div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        {loading ? (
          <div className="text-gray-500 text-center py-20">Načítám...</div>
        ) : totalCount === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-white font-bold text-lg mb-2">Zatím žádné přihlášky</h3>
            <p className="text-gray-500 text-sm mb-6">
              Použij Smart Matching pro automatické přihlášení k agenturám
            </p>
            <Link
              href="/pruvodce/matching"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm no-underline"
            >
              🎯 Spustit Smart Matching
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Smart Matching applications */}
            {smartApps.length > 0 && (
              <>
                <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-2">Smart Matching</h3>
                {smartApps.map((app: any) => (
                  <div
                    key={app.id}
                    className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-3">
                        <h4 className="text-white font-bold text-base leading-tight mb-1">
                          {app.agency_name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {app.agency_email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            statusColors[app.status] || statusColors["sent"]
                          }`}
                        >
                          {statusLabels[app.status] || app.status}
                        </span>
                        {app.match_score && (
                          <span className="text-gray-600 text-[10px]">{app.match_score}% match</span>
                        )}
                      </div>
                    </div>
                    {app.match_reasoning && (
                      <p className="text-gray-600 text-xs mb-2">{app.match_reasoning}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-600 text-xs">
                        {app.sent_at ? new Date(app.sent_at).toLocaleDateString('cs-CZ') : "Dnes"}
                      </span>
                      <span className="text-blue-400 text-[10px] font-medium">🎯 Smart Matching</span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Legacy applications */}
            {applications.length > 0 && (
              <>
                {smartApps.length > 0 && (
                  <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-4">Ruční přihlášky</h3>
                )}
                {applications.map((job: any) => (
                  <div
                    key={job.id}
                    className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 mr-3">
                        <h4 className="text-white font-bold text-base leading-tight mb-1">
                          {job.title}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          statusColors[job.status] || statusColors["Odesláno"]
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-gray-600 text-xs">
                        Přihlášeno: {job.appliedDate || "Dnes"}
                      </span>
                      <Link
                        href={`/nabidka?id=${job.id}`}
                        className="text-[#E8302A] text-sm font-bold"
                      >
                        Detail →
                      </Link>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-gray-800 px-6 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {[
            { name: "Discover", icon: "🔍", href: "/dashboard", active: false },
            { name: "Uložené", icon: "🔖", href: "/ulozene", active: false },
            { name: "Průvodce", icon: "📋", href: "/pruvodce", active: false },
            { name: "Přihlášky", icon: "✉️", href: "/prihlasky", active: true },
            { name: "Profil", icon: "👤", href: "/profil", active: false },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-lg">{item.icon}</span>
              <span
                className={`text-xs ${
                  item.active ? "text-[#E8302A] font-bold" : "text-gray-600"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
