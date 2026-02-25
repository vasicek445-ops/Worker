'use client';

import { useState } from 'react';

export default function ZdarmaPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Vyplňte prosím jméno i email.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source: 'lead-magnet' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Něco se pokazilo');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo. Zkuste to znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=General+Sans:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'General Sans', -apple-system, sans-serif; background: #0a0a12; color: #f0f0f5; min-height: 100vh; overflow-x: hidden; }
        .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(57,255,110,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,110,0.03) 1px,transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: 0; }
        .bg-glow { position: fixed; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle,rgba(57,255,110,0.06) 0%,transparent 70%); pointer-events: none; z-index: 0; }
        .grain { position: fixed; inset: 0; opacity: 0.4; pointer-events: none; z-index: 1; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"); }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow" />
      <div className="grain" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 580, margin: '0 auto', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <a href="/" style={{ position: 'absolute', top: 24, left: 20, color: '#8888aa', textDecoration: 'none', fontSize: 14 }}>
          ← Zpět na Woker
        </a>

        {!success ? (
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(57,255,110,0.08)', border: '1px solid rgba(57,255,110,0.15)', color: '#39ff6e', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, letterSpacing: 0.5, textTransform: 'uppercase' as const, marginBottom: 24 }}>
              ✦ Zdarma ke stažení
            </div>

            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(36px, 8vw, 52px)', fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>
              5 kroků k práci ve <span style={{ color: '#39ff6e' }}>Švýcarsku</span>
            </h1>
            <p style={{ fontSize: 17, color: '#8888aa', lineHeight: 1.5, marginBottom: 32 }}>
              Kompletní průvodce, jak si najít práci ve Švýcarsku bez agentury. 10 stran praktických tipů, kontaktů a akčního plánu.
            </p>

            {/* Preview */}
            <div style={{ background: '#111122', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 13, color: '#8888aa', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 16 }}>Co se v průvodci dozvíte</div>
              {[
                ['📋', 'Pracovní povolení', '— typy, jak je získat, krok za krokem'],
                ['🔍', '5 nejlepších zdrojů', '— kde hledat práci (nejen jobs.ch)'],
                ['📄', 'CV pro Švýcarsko', '— co funguje a co ne'],
                ['💰', 'Reálné platy a daně', '— kolik vyděláte čistého'],
                ['🛡️', 'Ochrana před podvody', '— varovné signály a ověření firem'],
              ].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, background: 'rgba(57,255,110,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{icon}</div>
                  <div style={{ fontSize: 15, color: '#ccccdd', lineHeight: 1.4 }}>
                    <strong style={{ color: '#f0f0f5', fontWeight: 600 }}>{title}</strong> {desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div style={{ background: 'linear-gradient(135deg,rgba(57,255,110,0.06),rgba(57,255,110,0.02))', border: '1px solid rgba(57,255,110,0.12)', borderRadius: 16, padding: '28px 24px', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, marginBottom: 6 }}>Stáhněte si průvodce zdarma</div>
              <div style={{ fontSize: 14, color: '#8888aa', marginBottom: 20 }}>Zadejte email a pošleme vám PDF rovnou do schránky.</div>

              {error && (
                <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff6666', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Vaše jméno"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', background: '#0a0a12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', fontSize: 16, color: '#f0f0f5', fontFamily: 'inherit', outline: 'none', marginBottom: 10 }}
                />
                <input
                  type="email"
                  placeholder="vas@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', background: '#0a0a12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', fontSize: 16, color: '#f0f0f5', fontFamily: 'inherit', outline: 'none', marginBottom: 12 }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '16px 24px', background: '#39ff6e', color: '#0a0a12', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1, position: 'relative', overflow: 'hidden' }}
                >
                  {loading ? 'Odesílám...' : '📥 Stáhnout průvodce zdarma'}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#8888aa', marginTop: 8 }}>
                🔒 Žádný spam. Email použijeme jen pro zaslání průvodce a občasné tipy.
              </p>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex' }}>
                  {[['#667eea','#764ba2','MK'],['#f093fb','#f5576c','JP'],['#4facfe','#00f2fe','TR'],['#43e97b','#38f9d7','PH']].map(([c1,c2,init],i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #0a0a12', marginLeft: i>0?-8:0, background: `linear-gradient(135deg,${c1},${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>{init}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: '#8888aa' }}>
                  Už <strong style={{ color: '#39ff6e', fontWeight: 600 }}>847+ lidí</strong> si průvodce stáhlo
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
              {[['10','stran průvodce'],['5','kroků k práci'],['30+','CHF/hod průměr']].map(([n,l],i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px 8px', background: '#111122', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: '#39ff6e' }}>{n}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(57,255,110,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 40 }}>✅</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 12 }}>Průvodce je na cestě!</h2>
            <p style={{ color: '#8888aa', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Zkontrolujte si email — průvodce <strong style={{ color: '#f0f0f5' }}>"5 kroků k práci ve Švýcarsku"</strong> je na cestě do vaší schránky.
              <br /><br />
              Pokud ho nevidíte, zkontrolujte spam složku.
            </p>
            <p style={{ color: '#ccccdd', fontSize: 14, marginBottom: 8 }}>
              Chcete ještě víc? S Woker Premium získáte:
            </p>
            <p style={{ color: '#ccccdd', fontSize: 14, lineHeight: 1.8 }}>
              ✓ 1 007+ přímých kontaktů na zaměstnavatele<br />
              ✓ Najděte si parťáka — ušetřete 40–60 % na bydlení<br />
              ✓ Zdravotní pojištění za 200 CHF/měs<br />
              ✓ 24/7 AI asistent
            </p>
            <br />
            <a href="/#cenik" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#39ff6e', color: '#0a0a12', textDecoration: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
              Prozkoumat Woker Premium →
            </a>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ color: '#39ff6e', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>WOKER</div>
          <p style={{ fontSize: 12, color: '#8888aa', marginTop: 8 }}>Tvůj průvodce za prací ve Švýcarsku</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
            <a href="/" style={{ color: '#8888aa', textDecoration: 'none', fontSize: 12 }}>Hlavní stránka</a>
            <a href="https://tiktok.com/@vasicenko" target="_blank" style={{ color: '#8888aa', textDecoration: 'none', fontSize: 12 }}>TikTok</a>
            <a href="https://instagram.com/vasicenko" target="_blank" style={{ color: '#8888aa', textDecoration: 'none', fontSize: 12 }}>Instagram</a>
          </div>
        </div>
      </div>
    </>
  );
}
