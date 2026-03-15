"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
  chips?: string[];
};

interface WookyProps {
  profilePercent?: number;
  profileData?: {
    pozice?: string;
    obor?: string;
    nemcina_uroven?: string;
    zkusenosti?: string;
    dovednosti?: string;
    full_name?: string;
  } | null;
  appCount?: number;
  matchCount?: number;
  hasCv?: boolean;
}

const STORAGE_KEY = "wooky-chat-history";

function getContextQuestions(profilePercent: number, appCount: number, hasCv: boolean): string[] {
  if (profilePercent < 50) {
    return [
      "Jak vyplnit profil?",
      "Co je Smart Matching?",
      "Jaký obor vybrat?",
      "Kolik se vydělá ve Švýcarsku?",
    ];
  }
  if (profilePercent < 100) {
    return [
      "Dokončit profil — co chybí?",
      "Jaké obory jsou nejžádanější?",
      "Potřebuju němčinu?",
      "Jak funguje matching?",
    ];
  }
  if (!hasCv) {
    return [
      "Vytvořit CV pro Švýcarsko",
      "Jaké šablony máte?",
      "Co má být v CV?",
      "Kolik se vydělá v mém oboru?",
    ];
  }
  if (appCount === 0) {
    return [
      "Jak se přihlásit na pozici?",
      "Jaké agentury doporučuješ?",
      "Jak napsat motivační dopis?",
      "Kolik se vydělá v mém oboru?",
    ];
  }
  return [
    "Jak se připravit na pohovor?",
    "Co dělat před nástupem?",
    "Jaké pojištění potřebuju?",
    "Jak fungují daně ve Švýcarsku?",
  ];
}

function getGreeting(profilePercent: number, name: string, appCount: number, hasCv: boolean): string {
  const firstName = name?.split(" ")[0] || "";
  const hi = firstName ? `${firstName}, ahoj!` : "Ahoj!";

  if (profilePercent < 50) {
    return `${hi} Jsem Wooky, tvuj Team Leader tady na Wokeru. Vidim ze mas profil na ${profilePercent}% — to musime dohodit. Kompletni profil mi umozni spustit Smart Matching a najit ti presne ty spravne agentury. Pojdme na to!`;
  }
  if (profilePercent < 100) {
    return `${hi} Tady Wooky, tvuj Team Leader. Profil mas na ${profilePercent}% — jeste par udaju a poustim na to cely tym. Smart Matching, CV generator, vse bude ready. Co potrebujes?`;
  }
  if (!hasCv) {
    return `${hi} Wooky tady. Profil je kompletni, super prace! Ted doporucuju nechat nas CV tym vytvorit zivotopis ve svycarskem formatu — zabere to minutu a bude profi. Nebo mi rekni co resis.`;
  }
  if (appCount === 0) {
    return `${hi} Wooky hlasi pripravenost. Mas profil i CV — je cas akcne nasadit Smart Matching. Sparuju te s nejlepsimi agenturami pro tvuj obor. Nebo chces jeste neco doladit?`;
  }
  return `${hi} Tady Wooky. Uz mas ${appCount} odeslan${appCount === 1 ? "ou prihlasku" : appCount < 5 ? "e prihlasky" : "ych prihlasek"} — skvela prace! Chces se pripravit na pohovor? Nebo ti muzu pomoct s necim dalsim.`;
}

function parseChips(text: string): { cleanText: string; chips: string[] } {
  const match = text.match(/\[CHIPS:\s*(.+?)\]\s*$/);
  if (!match) return { cleanText: text, chips: [] };
  const cleanText = text.replace(/\[CHIPS:\s*.+?\]\s*$/, "").trimEnd();
  const chips = match[1].split("|").map((c) => c.trim()).filter(Boolean);
  return { cleanText, chips };
}

export default function WookyChat({ profilePercent = 0, profileData, appCount = 0, hasCv = false }: WookyProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    role: "assistant",
    content: getGreeting(profilePercent, profileData?.full_name || "", appCount, hasCv),
  };

  // Load from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch { /* ignore */ }
    setMessages([initialMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Scroll to chat on hash
  useEffect(() => {
    if (window.location.hash === "#wooky") {
      setExpanded(true);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const cleanText = text.replace(/^[^\w\sáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+\s*/, "");
    const userMessage: Message = { role: "user", content: cleanText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Build context-enriched messages
      const apiMessages = newMessages
        .filter((_, i) => i !== 0)
        .map((m) => ({ role: m.role, content: m.content }));

      // Add profile context to the first message
      const profileContext = profileData
        ? `\n[KONTEXT: Uzivatel ${profileData.full_name || ""}. Pozice: ${profileData.pozice || "neuvedena"}. Obor: ${profileData.obor || "neuveden"}. Nemcina: ${profileData.nemcina_uroven || "neuvedena"}. Zkusenosti: ${profileData.zkusenosti || "neuvedeny"}. Profil: ${profilePercent}%.]`
        : "";

      const enrichedMessages = apiMessages.length > 0
        ? [{ role: "user" as const, content: apiMessages[0].content + profileContext }, ...apiMessages.slice(1)]
        : [{ role: "user" as const, content: cleanText + profileContext }];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: enrichedMessages, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Chyba serveru" }));
        throw new Error(errData.error || "Chyba");
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No body");
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) { fullText += parsed.text; setStreamingText(fullText); }
              } catch { /* skip */ }
            }
          }
        }

        const { cleanText: finalText, chips } = parseChips(fullText);
        setMessages([...newMessages, { role: "assistant", content: finalText, chips }]);
      } else {
        const data = await res.json();
        const { cleanText: finalText, chips } = parseChips(data.response || "");
        setMessages([...newMessages, { role: "assistant", content: finalText, chips }]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages([...newMessages, { role: "assistant", content: "Neco se pokazilo. Zkus to prosim znovu!" }]);
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [messages, isStreaming, profileData, profilePercent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const contextQuestions = getContextQuestions(profilePercent, appCount, hasCv);
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const showChips = !isStreaming && lastAssistantMsg?.chips && lastAssistantMsg.chips.length > 0;
  const showQuickQuestions = !isStreaming && messages.length <= 1;

  // ─── COLLAPSED STATE ───
  if (!expanded) {
    return (
      <div ref={chatRef} id="wooky" onClick={() => setExpanded(true)} className="cursor-pointer group">
        <div className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden transition-all hover:border-[#39ff6e]/20 hover:shadow-[0_0_30px_rgba(57,255,110,0.08)]">
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,110,0.2)]">
                  <Image src="/images/3d/speech.png" alt="" width={22} height={22} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#39ff6e] rounded-full border-2 border-[#0a0a12] shadow-[0_0_8px_rgba(57,255,110,0.5)]" />
              </div>
              <div>
                <p className="text-white text-sm font-bold m-0">Wooky</p>
                <p className="text-[#39ff6e] text-[11px] font-medium m-0">Online 24/7</p>
              </div>
            </div>
            <span className="text-[11px] text-white/25 font-medium bg-white/[0.04] px-3 py-1.5 rounded-full border border-white/[0.06]">AI Team Leader</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-[#39ff6e]/[0.04] rounded-xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%] border border-[#39ff6e]/10">
              <p className="text-[13px] text-white/60 leading-relaxed m-0">
                {profilePercent < 50
                  ? `Profil na ${profilePercent}% — dohodime to a pustim na to cely tym.`
                  : profilePercent < 100
                    ? `Jeste par kroku a mam vsechno ready. Poradim s cimkoliv.`
                    : `Vse ready! Rekni co resis a nasmeruju te na spravny nastroj.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contextQuestions.slice(0, 3).map((q, i) => (
                <span key={i} className="text-[11px] text-white/30 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.06] font-medium">{q}</span>
              ))}
            </div>
          </div>
          <div className="px-4 py-3 bg-[#39ff6e]/[0.02] border-t border-[#39ff6e]/[0.06] flex items-center justify-center">
            <span className="text-[13px] font-semibold text-[#39ff6e]/70 group-hover:text-[#39ff6e] transition">Otevrit chat →</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── EXPANDED CHAT ───
  return (
    <div ref={chatRef} id="wooky" className="bg-[#111120]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_0_40px_rgba(57,255,110,0.05)]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-3 bg-white/[0.02]">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39ff6e] to-[#2bcc58] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,110,0.2)]">
            <Image src="/images/3d/speech.png" alt="" width={22} height={22} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#39ff6e] rounded-full border-2 border-[#0a0a12]" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold m-0">Wooky</p>
          <p className={`text-[11px] font-medium m-0 ${isStreaming ? "text-yellow-400" : "text-[#39ff6e]"}`}>
            {isStreaming ? "Pise..." : "Online"}
          </p>
        </div>
        {messages.length > 1 && (
          <button onClick={handleClearChat} className="text-[10px] text-white/25 hover:text-white/50 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06] transition" title="Novy chat">
            Novy chat
          </button>
        )}
        <button onClick={() => setExpanded(false)} className="text-white/20 hover:text-white/50 transition p-1" title="Zavrit">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: "400px" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-[#39ff6e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Image src="/images/3d/speech.png" alt="" width={16} height={16} />
              </div>
            )}
            <div className={`rounded-xl px-3.5 py-2.5 max-w-[80%] ${
              msg.role === "user"
                ? "bg-[#39ff6e]/15 text-white/90 border border-[#39ff6e]/20"
                : "bg-white/[0.04] text-white/60 border border-white/[0.06]"
            }`}>
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed m-0">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Streaming */}
        {isStreaming && streamingText && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#39ff6e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Image src="/images/3d/speech.png" alt="" width={16} height={16} />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5 max-w-[80%]">
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed text-white/60 m-0">
                {streamingText}
                <span className="inline-block w-0.5 h-3.5 bg-[#39ff6e] ml-0.5 animate-pulse align-text-bottom" />
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingText && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#39ff6e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Image src="/images/3d/speech.png" alt="" width={16} height={16} />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#39ff6e]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#39ff6e]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#39ff6e]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick questions */}
        {showQuickQuestions && (
          <div className="flex flex-wrap gap-1.5 ml-9">
            {contextQuestions.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 hover:border-[#39ff6e]/30 hover:text-[#39ff6e]/70 hover:bg-[#39ff6e]/[0.04] transition font-medium">
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Suggestion chips */}
        {showChips && (
          <div className="flex flex-wrap gap-1.5 ml-9">
            {lastAssistantMsg!.chips!.map((chip) => (
              <button key={chip} onClick={() => sendMessage(chip)}
                className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40 hover:border-[#39ff6e]/30 hover:text-[#39ff6e]/70 hover:bg-[#39ff6e]/[0.04] transition font-medium">
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/[0.04] bg-white/[0.02]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Zeptej se Wookyho..."
            disabled={isStreaming}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#39ff6e]/40 focus:shadow-[0_0_20px_rgba(57,255,110,0.05)] disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] w-10 h-10 rounded-xl hover:shadow-[0_4px_20px_rgba(57,255,110,0.3)] transition disabled:opacity-30 font-bold flex items-center justify-center flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
