"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import { Settings, ArrowLeft, Save, Loader2, Plus, X, Search, Sparkles } from "lucide-react";

type AgentConfig = {
  positions: string[];
  locations: string[];
  languages: string[];
  daily_limit: number;
  salary_min_chf: number | null;
  active: boolean;
  auto_send: boolean;
};

const DEFAULT: AgentConfig = {
  positions: [],
  locations: [],
  languages: ["de"],
  daily_limit: 3,
  salary_min_chf: null,
  active: true,
  auto_send: false,
};

const ALL_LANGUAGES = [
  { code: "de", label: "Němčina" },
  { code: "en", label: "Angličtina" },
  { code: "fr", label: "Francouzština" },
  { code: "it", label: "Italština" },
];

export default function AgentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AgentConfig>(DEFAULT);

  const [newPosition, setNewPosition] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<
    | { kind: "ok"; found: number; inserted: number; bySource: Record<string, number> }
    | { kind: "err"; message: string }
    | null
  >(null);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?next=/profil/agent");
      return;
    }
    try {
      const res = await fetch("/api/agent/config", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (json.config) setConfig({ ...DEFAULT, ...json.config });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Načtení selhalo");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/agent/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setSavedAt(new Date());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }

  function addPosition() {
    const v = newPosition.trim();
    if (!v || config.positions.includes(v) || config.positions.length >= 10) return;
    setConfig((c) => ({ ...c, positions: [...c.positions, v] }));
    setNewPosition("");
  }

  function addLocation() {
    const v = newLocation.trim();
    if (!v || config.locations.includes(v) || config.locations.length >= 10) return;
    setConfig((c) => ({ ...c, locations: [...c.locations, v] }));
    setNewLocation("");
  }

  function removePosition(p: string) {
    setConfig((c) => ({ ...c, positions: c.positions.filter((x) => x !== p) }));
  }
  function removeLocation(p: string) {
    setConfig((c) => ({ ...c, locations: c.locations.filter((x) => x !== p) }));
  }
  async function runDiscovery() {
    setDiscovering(true);
    setDiscoveryResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/jobs/discover", {
        method: "POST",
        headers: { Authorization: `Bearer ${session!.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        setDiscoveryResult({ kind: "err", message: json.error || "discover_failed" });
      } else {
        setDiscoveryResult({
          kind: "ok",
          found: json.found ?? 0,
          inserted: json.inserted ?? 0,
          bySource: json.by_source ?? {},
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setDiscoveryResult({ kind: "err", message: err?.message || "network_error" });
    } finally {
      setDiscovering(false);
    }
  }

  function toggleLanguage(code: string) {
    setConfig((c) => ({
      ...c,
      languages: c.languages.includes(code)
        ? c.languages.filter((x) => x !== code)
        : [...c.languages, code],
    }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white/40">
        <Loader2 className="animate-spin mr-3" size={20} /> Načítám…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 no-underline"
        >
          <ArrowLeft size={16} /> Zpět na profil
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Settings size={28} className="text-[#ff8c2b]" />
          <h1 className="text-2xl font-extrabold tracking-tight m-0">Smart Apply nastavení</h1>
        </div>
        <p className="text-white/50 text-sm mb-8">
          Řekni agentovi co hledáš. Každý den ráno na základě těchto preferencí najde
          relevantní pozice a vygeneruje drafty emailů, které pošleš ze svého Gmailu.
        </p>

        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* POSITIONS */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
          <h2 className="text-base font-bold mb-2 m-0">Hledané pozice</h2>
          <p className="text-white/40 text-xs mb-4">
            Např. „svářeč“, „logistik“, „skladník“, „kuchař“. Max 10.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPosition())}
              placeholder="přidej pozici…"
              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff8c2b]"
            />
            <button
              onClick={addPosition}
              className="bg-[#ff8c2b] hover:bg-[#ff6a1f] text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus size={16} /> Přidat
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.positions.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff8c2b]/10 border border-[#ff8c2b]/30 rounded-full text-sm text-[#ff8c2b]">
                {p}
                <button onClick={() => removePosition(p)} className="hover:text-white"><X size={14} /></button>
              </span>
            ))}
            {config.positions.length === 0 && (
              <span className="text-white/30 text-sm italic">Žádné pozice. Přidej alespoň jednu.</span>
            )}
          </div>
        </section>

        {/* LOCATIONS */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
          <h2 className="text-base font-bold mb-2 m-0">Lokace ve Švýcarsku</h2>
          <p className="text-white/40 text-xs mb-4">
            Kanton nebo město. Např. „Curych“, „Bern“, „celá CH“. Max 10.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
              placeholder="přidej lokaci…"
              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff8c2b]"
            />
            <button
              onClick={addLocation}
              className="bg-[#ff8c2b] hover:bg-[#ff6a1f] text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus size={16} /> Přidat
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.locations.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff8c2b]/10 border border-[#ff8c2b]/30 rounded-full text-sm text-[#ff8c2b]">
                {p}
                <button onClick={() => removeLocation(p)} className="hover:text-white"><X size={14} /></button>
              </span>
            ))}
            {config.locations.length === 0 && (
              <span className="text-white/30 text-sm italic">Žádná lokace. Přidej alespoň jednu (nebo „celá CH“).</span>
            )}
          </div>
        </section>

        {/* LANGUAGES */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
          <h2 className="text-base font-bold mb-2 m-0">Jazyky kterými umíš pracovat</h2>
          <p className="text-white/40 text-xs mb-4">
            Pozice mimo tyto jazyky se přeskočí.
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_LANGUAGES.map(({ code, label }) => {
              const on = config.languages.includes(code);
              return (
                <button
                  key={code}
                  onClick={() => toggleLanguage(code)}
                  className={`px-4 py-2 rounded-xl text-sm border transition ${
                    on
                      ? "bg-[#ff8c2b]/10 border-[#ff8c2b]/40 text-[#ff8c2b] font-semibold"
                      : "bg-white/[0.02] border-white/10 text-white/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* LIMITS */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-4">
          <h2 className="text-base font-bold mb-2 m-0">Limity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Max emailů denně</label>
              <input
                type="number"
                min={0}
                max={50}
                value={config.daily_limit}
                onChange={(e) => setConfig((c) => ({ ...c, daily_limit: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff8c2b]"
              />
              <p className="text-[10px] text-white/30 mt-1">Free 3 / Starter 10 / Pro 20 / Max 30</p>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Min mzda CHF/měs (volitelné)</label>
              <input
                type="number"
                min={0}
                value={config.salary_min_chf ?? ""}
                onChange={(e) => setConfig((c) => ({ ...c, salary_min_chf: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="např. 4500"
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff8c2b]"
              />
              <p className="text-[10px] text-white/30 mt-1">Pozice pod tímto limitem se přeskočí</p>
            </div>
          </div>
        </section>

        {/* TOGGLES */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6 space-y-3">
          <ToggleRow
            label="Agent aktivní"
            description="Pokud vypnuto, žádné denní matche se negenerují."
            on={config.active}
            onChange={(v) => setConfig((c) => ({ ...c, active: v }))}
          />
          <ToggleRow
            label="Auto-send"
            description="DOPORUČENO VYPNUTO. Pokud zapnuto, agent pošle emaily bez tvého review (riziko spam-flagu)."
            on={config.auto_send}
            onChange={(v) => setConfig((c) => ({ ...c, auto_send: v }))}
          />
        </section>

        {/* SAVE */}
        <div className="flex items-center gap-4 mb-8">
          <button
            disabled={saving}
            onClick={save}
            className="bg-[#ff8c2b] hover:bg-[#ff6a1f] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Uložit nastavení
          </button>
          {savedAt && (
            <span className="text-[#39ff6e] text-sm">
              ✅ Uloženo {savedAt.toLocaleTimeString("cs-CZ")}
            </span>
          )}
        </div>

        {/* DISCOVERY — manual trigger before cron is wired */}
        <section className="rounded-2xl border border-[#ff8c2b]/30 bg-gradient-to-br from-[#ff8c2b]/5 to-transparent p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-[#ff8c2b]" />
            <h2 className="text-base font-bold m-0">Vyzkoušet teď</h2>
          </div>
          <p className="text-white/50 text-sm mb-4">
            Spusť discovery ručně — agent prohledá Adzuna podle tvých preferencí
            a uloží kandidáty do tvé fronty matchů.
          </p>
          <button
            disabled={discovering || !config.positions.length}
            onClick={runDiscovery}
            className="bg-white/10 hover:bg-white/15 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            {discovering ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {discovering ? "Hledám…" : "Najdi dnešní pozice"}
          </button>
          {!config.positions.length && (
            <p className="text-white/30 text-xs mt-2">Nejdřív přidej alespoň jednu pozici výše a ulož.</p>
          )}
          {discoveryResult?.kind === "ok" && (
            <div className="mt-4 p-3 rounded-xl bg-[#39ff6e]/5 border border-[#39ff6e]/20 text-sm">
              <div className="text-[#39ff6e] font-semibold">
                ✅ Nalezeno {discoveryResult.found} pozic, uloženo {discoveryResult.inserted} nových
              </div>
              <div className="text-white/40 text-xs mt-1">
                {Object.entries(discoveryResult.bySource).map(([src, n]) => `${src}: ${n}`).join(" · ")}
              </div>
              {discoveryResult.inserted > 0 && (
                <Link href="/profil/matches" className="text-[#ff8c2b] text-xs mt-2 inline-block no-underline hover:underline">
                  → Otevřít fronta matchů
                </Link>
              )}
            </div>
          )}
          {discoveryResult?.kind === "err" && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-300 text-sm">
              ❌ {discoveryResult.message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ToggleRow({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-white/40 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`flex-shrink-0 w-11 h-6 rounded-full transition relative ${
          on ? "bg-[#ff8c2b]" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
