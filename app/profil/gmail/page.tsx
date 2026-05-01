"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../supabase";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send, Loader2, Settings } from "lucide-react";

type ConnectionStatus =
  | { state: "loading" }
  | { state: "not_connected" }
  | { state: "connected"; email: string; connectedAt: string }
  | { state: "error"; message: string };

export default function GmailConnectPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0a0a12]" />}>
      <GmailConnectContent />
    </Suspense>
  );
}

function GmailConnectContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus>({ state: "loading" });
  const [busy, setBusy] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  // Banner from OAuth callback redirect (?gmail=connected or ?error=...)
  const callbackError = params.get("error");
  const callbackConnected = params.get("gmail") === "connected";
  const callbackEmail = params.get("email");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    setStatus({ state: "loading" });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login?next=/profil/gmail");
      return;
    }
    const { data, error } = await supabase
      .from("email_oauth_tokens")
      .select("email, connected_at, revoked")
      .eq("provider", "gmail")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      setStatus({ state: "error", message: error.message });
      return;
    }
    if (!data || data.revoked) {
      setStatus({ state: "not_connected" });
      return;
    }
    setStatus({ state: "connected", email: data.email, connectedAt: data.connected_at });
    if (!testEmail) setTestEmail(data.email);
  }

  async function handleConnect() {
    setBusy(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch("/api/auth/gmail/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Failed to start OAuth");
      window.location.href = json.url;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus({ state: "error", message: err?.message || "OAuth start failed" });
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Opravdu odpojit Gmail? Smart Apply pak nebude posílat emaily.")) return;
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase
      .from("email_oauth_tokens")
      .update({ revoked: true })
      .eq("provider", "gmail");
    setBusy(false);
    void loadStatus();
  }

  async function handleSendTest() {
    if (!testEmail) return;
    setBusy(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/gmail/test-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({ to: testEmail, subject: "Test z Wokeru ✓" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      setTestResult(`✅ Odesláno! Message ID: ${json.message_id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setTestResult(`❌ ${err?.message || "send_failed"}`);
    } finally {
      setBusy(false);
    }
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
          <Mail size={28} className="text-[#ff8c2b]" />
          <h1 className="text-2xl font-extrabold tracking-tight m-0">Připojit Gmail</h1>
        </div>
        <p className="text-white/50 text-sm mb-8">
          Woker bude posílat tvé pracovní přihlášky z tvého vlastního Gmail účtu — vyšší
          reply rate než cold email, a všechny odpovědi ti chodí přímo do tvého Inboxu.
        </p>

        {callbackError && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm flex gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <strong>OAuth chyba:</strong> {callbackError}
            </div>
          </div>
        )}
        {callbackConnected && (
          <div className="mb-4 p-4 rounded-xl border border-[#39ff6e]/30 bg-[#39ff6e]/5 text-[#39ff6e] text-sm flex gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <div>
              Gmail propojen{callbackEmail ? `: ${callbackEmail}` : ""}.
            </div>
          </div>
        )}

        {/* Status card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 mb-6">
          {status.state === "loading" && (
            <div className="flex items-center gap-3 text-white/40">
              <Loader2 size={18} className="animate-spin" /> Načítám…
            </div>
          )}

          {status.state === "not_connected" && (
            <>
              <h2 className="text-lg font-bold mb-2 m-0">Žádný Gmail účet</h2>
              <p className="text-white/50 text-sm mb-5">
                Klikni níže a Google tě provede přihlášením. Woker dostane pouze oprávnění{" "}
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-[12px]">gmail.send</code>{" "}
                (posílání emailů z tvé adresy). NIKDY nemáme přístup ke čtení tvých emailů.
              </p>
              <button
                disabled={busy}
                onClick={handleConnect}
                className="bg-[#ff8c2b] hover:bg-[#ff6a1f] disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition"
              >
                <Mail size={18} /> {busy ? "Otevírám Google…" : "Připojit Gmail"}
              </button>
            </>
          )}

          {status.state === "connected" && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={18} className="text-[#39ff6e]" />
                <h2 className="text-lg font-bold m-0">Gmail připojen</h2>
              </div>
              <p className="text-white/50 text-sm mb-1">
                Účet: <span className="text-white font-medium">{status.email}</span>
              </p>
              <p className="text-white/30 text-xs mb-5">
                Připojeno {new Date(status.connectedAt).toLocaleString("cs-CZ")}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href="/profil/agent"
                  className="bg-[#ff8c2b]/10 hover:bg-[#ff8c2b]/20 border border-[#ff8c2b]/30 text-[#ff8c2b] text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 no-underline"
                >
                  <Settings size={14} /> Nastavit agenta
                </Link>
                <button
                  disabled={busy}
                  onClick={handleDisconnect}
                  className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm underline"
                >
                  Odpojit Gmail
                </button>
              </div>
            </>
          )}

          {status.state === "error" && (
            <div className="text-red-400 text-sm flex gap-2">
              <AlertCircle size={18} /> {status.message}
            </div>
          )}
        </div>

        {/* Test send card */}
        {status.state === "connected" && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h2 className="text-lg font-bold mb-2 m-0">Test odeslání</h2>
            <p className="text-white/50 text-sm mb-4">
              Pošli si testovací email a ověř, že integrace funguje.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="komu poslat (default = tobě)"
                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#ff8c2b]"
              />
              <button
                disabled={busy || !testEmail}
                onClick={handleSendTest}
                className="bg-[#ff8c2b] hover:bg-[#ff6a1f] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Odeslat test
              </button>
            </div>
            {testResult && (
              <div className={`mt-4 p-3 rounded-xl text-sm ${
                testResult.startsWith("✅") ? "bg-[#39ff6e]/5 border border-[#39ff6e]/20 text-[#39ff6e]"
                : "bg-red-500/5 border border-red-500/20 text-red-300"
              }`}>
                {testResult}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
