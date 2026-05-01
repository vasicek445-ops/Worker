"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import { Inbox, ArrowLeft, ExternalLink, X, Loader2, Building2, MapPin, Coins, Sparkles, Settings, Wand2, ChevronDown, ChevronUp } from "lucide-react";

type Match = {
  id: string;
  job_url: string | null;
  job_source: string | null;
  company: string | null;
  position: string;
  location: string | null;
  salary_text: string | null;
  description: string | null;
  language: string | null;
  match_score: number | null;
  match_reasoning?: string | null;
  draft_subject: string | null;
  draft_body: string | null;
  status: "pending" | "sent" | "skipped" | "edited" | "expired";
  generated_at: string;
  sent_at: string | null;
};

type Filter = "pending" | "sent" | "skipped" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "pending", label: "Čeká na akci" },
  { key: "sent", label: "Odeslané" },
  { key: "skipped", label: "Přeskočené" },
  { key: "all", label: "Vše" },
];

export default function MatchesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function load(f: Filter) {
    setLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?next=/profil/matches");
      return;
    }
    try {
      const res = await fetch(`/api/matches?status=${f}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "load_failed");
      setMatches(json.matches ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }

  async function generateDraftFor(id: string) {
    setDraftingId(id);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`/api/matches/${id}/draft`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.hint || json.message || json.error || "draft_failed");
      }
      setMatches((m) => m.map((x) => (x.id === id ? { ...x, ...json.match } : x)));
      setExpanded((e) => ({ ...e, [id]: true }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Generování selhalo");
    } finally {
      setDraftingId(null);
    }
  }

  async function updateStatus(id: string, status: Match["status"]) {
    setBusyId(id);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "update_failed");
      }
      setMatches((m) => m.filter((x) => x.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Update selhalo");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 no-underline"
        >
          <ArrowLeft size={16} /> Zpět na profil
        </Link>

        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Inbox size={28} className="text-[#ff8c2b]" />
            <h1 className="text-2xl font-extrabold tracking-tight m-0">Smart Apply matche</h1>
          </div>
          <Link
            href="/profil/agent"
            className="text-white/40 hover:text-white text-sm flex items-center gap-1.5 no-underline"
          >
            <Settings size={14} /> Nastavení
          </Link>
        </div>
        <p className="text-white/50 text-sm mb-6">
          Pozice nalezené agentem na základě tvých preferencí. Otevři, pošli, přeskoč.
        </p>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition ${
                filter === key
                  ? "bg-[#ff8c2b]/10 border-[#ff8c2b]/40 text-[#ff8c2b] font-semibold"
                  : "bg-white/[0.02] border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-white/40 py-12 justify-center">
            <Loader2 size={18} className="animate-spin" /> Načítám…
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
            <Inbox size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm m-0">
              {filter === "pending"
                ? "Žádné čekající matche. Spusť discovery v nastavení."
                : "Tady nic není."}
            </p>
            {filter === "pending" && (
              <Link
                href="/profil/agent"
                className="inline-block mt-4 bg-[#ff8c2b] hover:bg-[#ff6a1f] text-white text-sm font-semibold px-4 py-2 rounded-xl no-underline"
              >
                Otevřít nastavení agenta
              </Link>
            )}
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((m) => (
              <article
                key={m.id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-white/15 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold m-0 leading-tight">{m.position}</h3>
                  {m.match_score !== null && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#39ff6e]/10 border border-[#39ff6e]/30 text-[#39ff6e] text-xs font-bold">
                      <Sparkles size={11} /> {m.match_score}%
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50 mb-3">
                  {m.company && (
                    <span className="inline-flex items-center gap-1"><Building2 size={12} /> {m.company}</span>
                  )}
                  {m.location && (
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {m.location}</span>
                  )}
                  {m.salary_text && (
                    <span className="inline-flex items-center gap-1 text-[#ff8c2b]"><Coins size={12} /> {m.salary_text}</span>
                  )}
                  {m.job_source && (
                    <span className="text-white/30">via {m.job_source}</span>
                  )}
                </div>
                {m.description && (
                  <p className="text-white/60 text-xs leading-relaxed m-0 mb-4 line-clamp-3">
                    {m.description.slice(0, 280)}{m.description.length > 280 ? "…" : ""}
                  </p>
                )}

                {m.match_reasoning && (
                  <p className="text-white/40 text-[11px] italic m-0 mb-3">
                    💡 {m.match_reasoning}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {m.job_url && (
                    <a
                      href={m.job_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs no-underline text-white/80"
                    >
                      <ExternalLink size={12} /> Otevřít inzerát
                    </a>
                  )}
                  {m.status === "pending" && (
                    <>
                      {!m.draft_body ? (
                        <button
                          disabled={draftingId === m.id}
                          onClick={() => generateDraftFor(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff8c2b]/15 hover:bg-[#ff8c2b]/25 border border-[#ff8c2b]/40 rounded-lg text-xs text-[#ff8c2b] font-semibold disabled:opacity-50"
                        >
                          {draftingId === m.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          {draftingId === m.id ? "AI píše…" : "Vygeneruj návrh"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setExpanded((e) => ({ ...e, [m.id]: !e[m.id] }))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#39ff6e]/10 hover:bg-[#39ff6e]/20 border border-[#39ff6e]/30 rounded-lg text-xs text-[#39ff6e] font-semibold"
                        >
                          {expanded[m.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {expanded[m.id] ? "Skrýt draft" : "Zobrazit draft"}
                        </button>
                      )}
                      <button
                        disabled={busyId === m.id}
                        onClick={() => updateStatus(m.id, "skipped")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 disabled:opacity-50"
                      >
                        {busyId === m.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                        Přeskočit
                      </button>
                    </>
                  )}
                  {m.status === "sent" && (
                    <span className="text-[#39ff6e] text-xs">
                      ✅ Odesláno {m.sent_at ? new Date(m.sent_at).toLocaleString("cs-CZ") : ""}
                    </span>
                  )}
                  {m.status === "skipped" && (
                    <span className="text-white/30 text-xs italic">Přeskočeno</span>
                  )}
                </div>

                {expanded[m.id] && m.draft_body && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
                    <div className="text-xs text-white/40">Předmět</div>
                    <div className="text-sm font-semibold text-white">{m.draft_subject}</div>
                    <div className="text-xs text-white/40 mt-3">Tělo emailu ({m.language ?? "—"})</div>
                    <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans m-0 leading-relaxed">
                      {m.draft_body}
                    </pre>
                    <div className="text-[10px] text-white/30 italic mt-3">
                      Tlačítko „Pošli&ldquo; bude dostupné v dalším milníku — propojí se s tvým Gmailem.
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
