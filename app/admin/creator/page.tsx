"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────
interface Segment {
  start: number;
  end: number;
  text: string;
}

interface Transcription {
  id: string;
  title: string;
  creator: string;
  platform: "TikTok" | "Instagram" | "YouTube";
  views: string;
  tags: string;
  text: string;
  segments: Segment[];
  duration: number;
  created_at: string;
}

interface GeneratedScript {
  hook: string;
  body: string;
  cta: string;
  broll: string;
  duration: string;
}

// ─── Helpers ─────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Accordion Section ──────────────────────────────────────
function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card mb-6 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="text-2xl">{icon}</span>
          {title}
        </span>
        <span
          className={`text-[#39ff6e] text-xl transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-5 pt-0">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function ContentCreatorPage() {
  // Upload & Transcribe state
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeStatus, setTranscribeStatus] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<{
    text: string;
    segments: Segment[];
    duration: number;
  } | null>(null);
  const [meta, setMeta] = useState({
    title: "",
    creator: "",
    platform: "TikTok" as "TikTok" | "Instagram" | "YouTube",
    views: "",
    tags: "",
  });

  // Library state
  const [library, setLibrary] = useState<Transcription[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Script generation state
  const [idea, setIdea] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<
    "TikTok" | "Instagram" | "YouTube"
  >("TikTok");
  const [tone, setTone] = useState("Informativní");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [rawScript, setRawScript] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch library from API
  const fetchLibrary = useCallback(async () => {
    try {
      const res = await fetch("/api/transcriptions");
      const data = await res.json();
      if (data.success) setLibrary(data.data);
    } catch (err) {
      console.error("Failed to load transcriptions:", err);
    }
  }, []);

  // Load library from API on mount
  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // ─── Upload handlers ────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // ─── Transcribe ─────────────────────────────────────────
  const handleTranscribe = async () => {
    if (!file) return;
    setTranscribing(true);
    setTranscriptionResult(null);
    setTranscribeStatus("Získávám přístup...");

    try {
      // Step 1: Get API key from server
      const keyRes = await fetch("/api/transcribe");
      const keyData = await keyRes.json();
      if (!keyData.success) throw new Error(keyData.error || "Chyba přístupu");

      setTranscribeStatus("Whisper přepisuje...");

      // Step 2: Send file directly to OpenAI (bypasses Vercel 4.5MB limit)
      const ext = file.name.split(".").pop() || "mp4";
      const cleanFile = new File([file], `audio.${ext}`, { type: file.type });

      const formData = new FormData();
      formData.append("file", cleanFile);
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");

      const whisperRes = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${keyData.key}` },
          body: formData,
        }
      );

      if (!whisperRes.ok) {
        const errText = await whisperRes.text();
        throw new Error(`Whisper error ${whisperRes.status}: ${errText.slice(0, 200)}`);
      }

      const data = await whisperRes.json();
      setTranscriptionResult({
        text: data.text,
        segments: (data.segments || []).map((s: { start: number; end: number; text: string }) => ({
          start: s.start,
          end: s.end,
          text: s.text,
        })),
        duration: data.duration || 0,
      });

      // Pre-fill title from filename
      if (!meta.title) {
        setMeta((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Chyba při přepisu");
    } finally {
      setTranscribing(false);
      setTranscribeStatus("");
    }
  };

  // ─── Save to library ───────────────────────────────────
  const handleSave = async () => {
    if (!transcriptionResult) return;
    if (!meta.title.trim()) {
      alert("Vyplň název videa");
      return;
    }

    try {
      const res = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meta.title,
          creator: meta.creator,
          platform: meta.platform,
          views: meta.views,
          tags: meta.tags,
          text: transcriptionResult.text,
          segments: transcriptionResult.segments,
          duration: transcriptionResult.duration,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Chyba při ukládání");

      // Refresh library from API
      await fetchLibrary();

      // Reset form
      setTranscriptionResult(null);
      setFile(null);
      setMeta({ title: "", creator: "", platform: "TikTok", views: "", tags: "" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Chyba při ukládání");
    }
  };

  // ─── Delete from library ───────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transcriptions?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Chyba při mazání");

      // Refresh library from API
      await fetchLibrary();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Chyba při mazání");
    }
  };

  // ─── Generate script ───────────────────────────────────
  const handleGenerate = async () => {
    if (!idea.trim()) {
      alert("Zadej nápad na video");
      return;
    }

    setGenerating(true);
    setScript(null);

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          platform: targetPlatform,
          tone,
          transcriptions: library.map((t) => ({
            title: t.title,
            text: t.text,
            creator: t.creator,
            views: t.views,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chyba při generování");

      const scriptText = data.script || "";
      if (!scriptText) throw new Error("API vrátilo prázdný script");

      setRawScript(scriptText);
      const parsed = parseScript(scriptText);
      setScript(parsed);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Chyba při generování");
    } finally {
      setGenerating(false);
    }
  };

  function stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // **bold**
      .replace(/\*(.*?)\*/g, "$1") // *italic*
      .replace(/^#{1,6}\s+/gm, "") // ### headings
      .replace(/^>\s+/gm, "") // > blockquotes
      .trim();
  }

  function parseScript(text: string): GeneratedScript {
    const sections: Record<string, string> = {};
    const labelPatterns: [string, RegExp][] = [
      ["HOOK", /^(?:🎬\s*)?HOOK/i],
      ["BODY", /^(?:📖\s*)?(?:TĚLO|BODY)/i],
      ["CTA", /^(?:📢\s*)?CTA/i],
      ["B-ROLL", /^(?:🎥\s*)?B-?ROLL/i],
      ["DÉLKA", /^(?:⏱️?\s*)?(?:DÉLKA|CELKOVÁ|Celkov)/i],
      ["HASHTAGS", /^(?:📊\s*)?HASHTAGS?/i],
    ];

    let current = "";
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "---") continue;

      const matched = labelPatterns.find(([, regex]) => regex.test(trimmed));
      if (matched) {
        current = matched[0];
        const colonIdx = trimmed.indexOf(":");
        const afterLabel = colonIdx !== -1 ? trimmed.slice(colonIdx + 1).trim() : "";
        if (afterLabel) {
          sections[current] = (sections[current] || "") + afterLabel;
        }
      } else if (current) {
        sections[current] = (sections[current] || "") + "\n" + trimmed;
      }
    }

    const duration = [sections["DÉLKA"], sections["HASHTAGS"]]
      .filter(Boolean)
      .join("\n");

    return {
      hook: stripMarkdown(sections["HOOK"] || ""),
      body: stripMarkdown(sections["BODY"] || ""),
      cta: stripMarkdown(sections["CTA"] || ""),
      broll: stripMarkdown(sections["B-ROLL"] || ""),
      duration: stripMarkdown(duration),
    };
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#39ff6e]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#39ff6e]/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#39ff6e]/10 border border-[#39ff6e]/20 text-[#39ff6e] text-sm font-medium mb-4">
            <span>🎬</span> Admin Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Content Creator AI
          </h1>
          <p className="text-white/50 text-lg">
            Viral Video Script Generator
          </p>
        </div>

        {/* Section 1: Upload & Transcribe */}
        <Section title="Nahrát & Přepsat" icon="🎙️" defaultOpen={true}>
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-[#39ff6e] bg-[#39ff6e]/10 scale-[1.01]"
                : file
                ? "border-[#39ff6e]/40 bg-[#39ff6e]/5"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.webm,.mp3,.m4a,.wav"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
            />
            {file ? (
              <div>
                <span className="text-3xl mb-2 block">📁</span>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-white/40 text-sm mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <span className="text-4xl mb-3 block">📤</span>
                <p className="text-white/60 font-medium">
                  Přetáhni video nebo audio soubor
                </p>
                <p className="text-white/30 text-sm mt-1">
                  .mp4, .mov, .webm, .mp3, .m4a, .wav
                </p>
              </div>
            )}
          </div>

          {/* Transcribe button */}
          <button
            onClick={handleTranscribe}
            disabled={!file || transcribing}
            className={`mt-4 w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
              !file || transcribing
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-[#39ff6e] text-[#0a0a12] hover:bg-[#39ff6e]/90 hover:shadow-[0_0_30px_rgba(57,255,110,0.3)] active:scale-[0.98]"
            }`}
          >
            {transcribing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {transcribeStatus || "Whisper přepisuje..."}
              </span>
            ) : (
              "🎤 Přepsat video"
            )}
          </button>

          {/* Transcription result */}
          {transcriptionResult && (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-[#39ff6e] font-medium">
                <span>✅</span> Přepis hotový
                {transcriptionResult.duration > 0 && (
                  <span className="text-white/40 text-sm ml-2">
                    ({formatTime(transcriptionResult.duration)})
                  </span>
                )}
              </div>

              {/* Full text */}
              <div>
                <label className="block text-sm text-white/40 mb-1">
                  Celý text
                </label>
                <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-white/80 leading-relaxed">
                  {transcriptionResult.text}
                </div>
              </div>

              {/* Segments */}
              {transcriptionResult.segments.length > 0 && (
                <div>
                  <label className="block text-sm text-white/40 mb-1">
                    Segmenty s časovými značkami
                  </label>
                  <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto text-sm space-y-1">
                    {transcriptionResult.segments.map((seg, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-[#39ff6e]/60 font-mono shrink-0">
                          [{formatTime(seg.start)}]
                        </span>
                        <span className="text-white/70">{seg.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/40 mb-1">
                    Název videa *
                  </label>
                  <input
                    type="text"
                    value={meta.title}
                    onChange={(e) =>
                      setMeta({ ...meta, title: e.target.value })
                    }
                    placeholder="Název videa"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#39ff6e]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-1">
                    Tvůrce
                  </label>
                  <input
                    type="text"
                    value={meta.creator}
                    onChange={(e) =>
                      setMeta({ ...meta, creator: e.target.value })
                    }
                    placeholder="@username"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#39ff6e]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-1">
                    Platforma
                  </label>
                  <select
                    value={meta.platform}
                    onChange={(e) =>
                      setMeta({
                        ...meta,
                        platform: e.target.value as
                          | "TikTok"
                          | "Instagram"
                          | "YouTube",
                      })
                    }
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#39ff6e]/40 transition-colors appearance-none"
                  >
                    <option value="TikTok" className="bg-[#0a0a12]">
                      TikTok
                    </option>
                    <option value="Instagram" className="bg-[#0a0a12]">
                      Instagram
                    </option>
                    <option value="YouTube" className="bg-[#0a0a12]">
                      YouTube
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-1">
                    Počet zhlédnutí
                  </label>
                  <input
                    type="text"
                    value={meta.views}
                    onChange={(e) =>
                      setMeta({ ...meta, views: e.target.value })
                    }
                    placeholder="např. 1.2M"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#39ff6e]/40 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-white/40 mb-1">
                    Tagy (oddělené čárkou)
                  </label>
                  <input
                    type="text"
                    value={meta.tags}
                    onChange={(e) =>
                      setMeta({ ...meta, tags: e.target.value })
                    }
                    placeholder="práce, švýcarsko, tip"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#39ff6e]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl font-semibold bg-[#39ff6e]/10 border border-[#39ff6e]/30 text-[#39ff6e] hover:bg-[#39ff6e]/20 transition-all duration-300 active:scale-[0.98]"
              >
                💾 Uložit do knihovny
              </button>
            </div>
          )}
        </Section>

        {/* Section 2: Library */}
        <Section title="Knihovna přepisů" icon="📚">
          {library.length === 0 ? (
            <div className="text-center py-10 text-white/30">
              <span className="text-4xl block mb-3">📭</span>
              <p>Zatím žádné přepisy. Nahraj a přepiš první video.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/40 mb-2">
                {library.length}{" "}
                {library.length === 1 ? "přepis" : library.length < 5 ? "přepisy" : "přepisů"}
              </p>
              {library.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/20"
                >
                  {/* Item header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">
                        {item.platform === "TikTok"
                          ? "📱"
                          : item.platform === "Instagram"
                          ? "📸"
                          : "🎬"}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                          {item.creator && <span>@{item.creator}</span>}
                          <span>{item.platform}</span>
                          {item.views && <span>{item.views} views</span>}
                          <span>
                            {new Date(item.created_at).toLocaleDateString("cs-CZ")}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Smazat "${item.title}"?`)) {
                            handleDelete(item.id);
                          }
                        }}
                        className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Smazat"
                      >
                        🗑️
                      </button>
                      <span
                        className={`text-white/30 text-sm transition-transform duration-200 ${
                          expandedId === item.id ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-in">
                      {item.tags && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.tags.split(",").map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full bg-[#39ff6e]/10 text-[#39ff6e] text-xs"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.duration > 0 && (
                        <p className="text-xs text-white/40 mb-2">
                          Délka: {formatTime(item.duration)}
                        </p>
                      )}
                      <div className="bg-white/[0.02] rounded-lg p-3 text-sm text-white/70 leading-relaxed max-h-60 overflow-y-auto">
                        {item.segments.length > 0
                          ? item.segments.map((seg, i) => (
                              <div key={i} className="flex gap-2 mb-1">
                                <span className="text-[#39ff6e]/50 font-mono text-xs shrink-0 mt-0.5">
                                  [{formatTime(seg.start)}]
                                </span>
                                <span>{seg.text}</span>
                              </div>
                            ))
                          : item.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Section 3: Generate Script */}
        <Section title="Generovat script" icon="✍️">
          <div className="space-y-4">
            {/* Idea textarea */}
            <div>
              <label className="block text-sm text-white/40 mb-1">
                Zadej nápad na video
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={4}
                placeholder="Např: Video o tom, jak najít práci ve Švýcarsku bez němčiny. Zaměřit na agentury a první kroky."
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#39ff6e]/40 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Options row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/40 mb-1">
                  Platforma
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) =>
                    setTargetPlatform(
                      e.target.value as "TikTok" | "Instagram" | "YouTube"
                    )
                  }
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#39ff6e]/40 transition-colors appearance-none"
                >
                  <option value="TikTok" className="bg-[#0a0a12]">
                    TikTok (15-60s)
                  </option>
                  <option value="Instagram" className="bg-[#0a0a12]">
                    Instagram Reels (15-90s)
                  </option>
                  <option value="YouTube" className="bg-[#0a0a12]">
                    YouTube Shorts (15-60s)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/40 mb-1">
                  Tón
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#39ff6e]/40 transition-colors appearance-none"
                >
                  <option value="Informativní" className="bg-[#0a0a12]">
                    Informativní
                  </option>
                  <option value="Zábavný" className="bg-[#0a0a12]">
                    Zábavný
                  </option>
                  <option value="Provokativní" className="bg-[#0a0a12]">
                    Provokativní
                  </option>
                  <option value="Motivační" className="bg-[#0a0a12]">
                    Motivační
                  </option>
                </select>
              </div>
            </div>

            {/* Library count hint */}
            {library.length > 0 && (
              <p className="text-xs text-white/30">
                📚 Script bude generován na základě {library.length}{" "}
                {library.length === 1
                  ? "přepisu"
                  : library.length < 5
                  ? "přepisů"
                  : "přepisů"}{" "}
                z knihovny jako příklady stylu.
              </p>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!idea.trim() || generating}
              className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 ${
                !idea.trim() || generating
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#39ff6e] text-[#0a0a12] hover:bg-[#39ff6e]/90 hover:shadow-[0_0_30px_rgba(57,255,110,0.3)] active:scale-[0.98]"
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="inline-block w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                  Generuji script...
                </span>
              ) : (
                "✍️ Generovat script"
              )}
            </button>

            {/* Generated script output */}
            {(script || rawScript) && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-[#39ff6e] font-medium text-lg">
                  <span>🎬</span> Vygenerovaný script
                </div>

                {/* Raw output fallback if parser found nothing */}
                {(!script?.hook && !script?.body) && rawScript && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/40 text-xs mb-2 uppercase tracking-wide">Raw output</div>
                    <pre className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">{rawScript}</pre>
                  </div>
                )}

                {/* Hook */}
                {script?.hook && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wide">
                        Hook
                      </span>
                      <span className="text-white/30 text-xs">
                        prvních 2-3 sekund
                      </span>
                    </div>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {script?.hook}
                    </p>
                  </div>
                )}

                {/* Body */}
                {script?.body && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wide">
                        Body
                      </span>
                      <span className="text-white/30 text-xs">
                        hlavní obsah
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {script?.body}
                    </p>
                  </div>
                )}

                {/* CTA */}
                {script?.cta && (
                  <div className="bg-[#39ff6e]/5 border border-[#39ff6e]/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#39ff6e]/20 text-[#39ff6e] text-xs font-bold uppercase tracking-wide">
                        CTA
                      </span>
                      <span className="text-white/30 text-xs">
                        call to action
                      </span>
                    </div>
                    <p className="text-white/90 leading-relaxed font-medium">
                      {script?.cta}
                    </p>
                  </div>
                )}

                {/* B-Roll */}
                {script?.broll && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wide">
                        B-Roll
                      </span>
                      <span className="text-white/30 text-xs">
                        vizuální návrhy
                      </span>
                    </div>
                    <p className="text-white/70 leading-relaxed whitespace-pre-line">
                      {script?.broll}
                    </p>
                  </div>
                )}

                {/* Duration */}
                {script?.duration && (
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span>⏱️</span> Odhadovaná délka: {script?.duration}
                  </div>
                )}

                {/* Copy button */}
                <button
                  onClick={() => {
                    const full = script?.hook
                      ? `HOOK:\n${script.hook}\n\nBODY:\n${script.body}\n\nCTA:\n${script.cta}\n\nB-ROLL:\n${script.broll}\n\nDÉLKA: ${script.duration}`
                      : rawScript;
                    navigator.clipboard.writeText(full);
                    alert("Zkopírováno do schránky!");
                  }}
                  className="w-full py-2.5 rounded-xl font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  📋 Kopírovat celý script
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center text-white/20 text-xs mt-12 pb-8">
          Woker Admin — Content Creator AI
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          backdrop-filter: blur(20px);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
