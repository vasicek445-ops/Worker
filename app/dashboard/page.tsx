import Link from "next/link";
import { supabase } from "../supabase";

export const dynamic = 'force-dynamic';

async function getNabidky() {
  const { data } = await supabase.from("Nabídky").select("*");
  return data || [];
}

export default async function Dashboard() {
  const jobs = await getNabidky();

  return (
    <main className="min-h-screen bg-[#0E0E0E] pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8302A] to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[#E8302A] font-black text-xl tracking-tight">Woker</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-500"></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 mb-5">
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Hledat pozici nebo firmu...</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-5 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a4e] via-[#2d1b3d] to-[#E8302A] p-6 min-h-[140px] flex items-end">
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-[#E8302A] opacity-80 blur-sm"></div>
          <div className="absolute top-8 right-16 w-10 h-10 rounded-lg bg-[#E8302A] opacity-60 rotate-12"></div>
          <div>
            <h2 className="text-white font-black text-lg leading-tight uppercase">
              Práce ve Švýcarsku:<br />
              Vaše příležitosti
            </h2>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div className="bg-[#E8302A] text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1">
            🎯 AI Match
          </div>
          {["Remote", "Full-time", "Freelance"].map((f) => (
            <div key={f} className="bg-[#1A1A1A] border border-gray-800 text-gray-400 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Doporučené pozice */}
      <div className="px-5 mb-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-white font-bold text-base">Doporučené pozice</h3>
          <span className="text-gray-500 text-sm">• {jobs.length} nových</span>
        </div>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="pl-5 mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 pr-5">
          {jobs.map((job: any) => {
            const matchColor = job.match >= 90 ? "from-green-600 to-green-800" :
                               job.match >= 80 ? "from-blue-600 to-blue-800" :
                               "from-orange-600 to-orange-800";
            const matchBg = job.match >= 90 ? "bg-green-500" :
                            job.match >= 80 ? "bg-blue-500" :
                            "bg-orange-500";

            return (
              <Link
                key={job.id}
                href={`/nabidka?id=${job.id}`}
                className="min-w-[170px] max-w-[170px] flex-shrink-0"
              >
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden">
                  {/* Card gradient header with match */}
                  <div className={`relative h-24 bg-gradient-to-br ${matchColor} p-3 flex items-start justify-end`}>
                    <div className={`${matchBg} w-11 h-11 rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-black">{job.match}%</span>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="p-3">
                    <h4 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2">
                      {job.title?.length > 25 ? job.title.substring(0, 25) + "." : job.title}
                    </h4>
                    <p className="text-gray-500 text-xs mb-3 truncate">{job.company}</p>
                    <span className="inline-block bg-[#111] border border-gray-800 text-gray-400 rounded-full px-2 py-1 text-xs">
                      {job.lang || "🇬🇧 B1+"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Všechny nabídky - vertikální seznam */}
      <div className="px-5">
        <h3 className="text-white font-bold text-base mb-4">Všechny nabídky</h3>
        <div className="flex flex-col gap-3">
          {jobs.map((job: any) => (
            <Link key={`list-${job.id}`} href={`/nabidka?id=${job.id}`}>
              <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-3">
                    <h4 className="text-white font-bold text-base leading-tight mb-1">{job.title}</h4>
                    <p className="text-gray-500 text-sm">{job.company} • {job.location}</p>
                  </div>
                  <div className="bg-[#E8302A] text-white rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black leading-none">{job.match}%</span>
                    <span className="text-[8px] leading-none opacity-80">match</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">{job.type || "Full-time"}</span>
                  <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">{job.salary || "Dle dohody"}</span>
                  <span className="bg-[rgba(232,48,42,0.1)] border border-[rgba(232,48,42,0.3)] text-[#E8302A] rounded-full px-3 py-1 text-xs">{job.lang || "🇬🇧 B1+"}</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#E8302A] text-white text-center py-3 rounded-xl text-sm font-bold">
                    Zobrazit kontakt →
                  </div>
                  <button className="bg-[#111] border border-gray-800 text-gray-500 font-bold py-3 px-4 rounded-xl text-sm">
                    🔖
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-gray-800 px-6 py-3">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          {[
            { name: "Discover", icon: "🔍", href: "/dashboard", active: true },
            { name: "Uložené", icon: "🔖", href: "/dashboard", active: false },
            { name: "Průvodce", icon: "📋", href: "/pruvodce", active: false },
            { name: "Přihlášky", icon: "✉️", href: "/dashboard", active: false },
            { name: "Profil", icon: "👤", href: "/profil", active: false },
          ].map((item) => (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
              <span className="text-lg">{item.icon}</span>
              <span className={`text-xs ${item.active ? "text-[#E8302A] font-bold" : "text-gray-600"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
