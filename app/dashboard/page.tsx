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
    <main className="min-h-screen bg-[#0E0E0E] px-6 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="text-[#E8302A] font-black text-xl">⚙ Woker</div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8302A] to-orange-400"></div>
        </div>

        <div className="mb-6">
          <h1 className="text-white text-2xl font-black mb-1">Dobré ráno, Václav 👋</h1>
          <p className="text-gray-500 text-sm">AI našel <span className="text-[#E8302A] font-bold">{jobs.length} nabídek</span> přesně pro tebe</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["🤖 AI Match", "Remote", "Full-time", "Freelance"].map((f, i) => (
            <div key={f} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${i === 0 ? "bg-[#E8302A] text-white" : "bg-[#1A1A1A] text-gray-500 hover:text-white"}`}>
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {jobs.map((job: any) => (
            <div key={job.id} className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-white font-black text-lg leading-tight">{job.title}</h2>
                  <p className="text-gray-500 text-sm">{job.company} • {job.location}</p>
                </div>
                <div className="bg-[#E8302A] text-white rounded-full w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 ml-3">
                  <span className="text-xs font-black leading-none">{job.match}%</span>
                  <span className="text-[8px] leading-none opacity-80">match</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">{job.type}</span>
                <span className="bg-[#111] border border-gray-800 text-gray-400 rounded-full px-3 py-1 text-xs">💰 {job.salary}/měs</span>
                <span className="bg-[rgba(232,48,42,0.1)] border border-[rgba(232,48,42,0.3)] text-[#E8302A] rounded-full px-3 py-1 text-xs">{job.lang}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/nabidka?id=${job.id}`} className="flex-1 bg-[#E8302A] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#FF4D47] transition-colors text-center">
                  Zobrazit kontakt →
                </Link>
                <button className="bg-[#111] border border-gray-800 text-gray-500 font-bold py-3 px-4 rounded-xl text-sm hover:border-gray-600 transition-colors">
                  💾
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}