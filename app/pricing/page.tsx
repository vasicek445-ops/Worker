"use client"

import { useState } from 'react'
import { supabase } from '../supabase'
import { Navbar, Footer } from '../page'
import TrustpilotWidget from '../components/TrustpilotWidget'

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleCheckout = async (planKey: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      try { localStorage.setItem('woker_pending_plan', planKey) } catch {}
      window.location.href = '/login?tab=register&plan=' + planKey
      return
    }
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.error) { alert(data.error); return }
      window.location.href = data.url
    } catch {
      alert('Něco se pokazilo')
    } finally {
      setLoading(null)
    }
  }

  const featureGroups = [
    {
      category: 'Hledání & oslovení firem',
      items: [
        { name: '1 007+ přímých kontaktů na Temporärbüra', desc: 'Oslovují firmy za tebe — bez provize, nástup v řádu dní.', value: '1 007+' },
        { name: 'Smart Apply', desc: 'Odešle tvé CV, motivační dopis i oslovení v němčině přímo firmě.', value: 'Beta' },
        { name: 'Smart Outreach', desc: 'Přímé oslovení firem mimo agentury.', value: true },
        { name: 'Denní nové nabídky', desc: 'Čerstvé pozice každý den, bez limitu.', value: true },
        { name: 'Tracking přihlášek', desc: 'Všechny tvé přihlášky na jednom místě.', value: true },
      ],
    },
    {
      category: 'AI nástroje & dokumenty',
      items: [
        { name: 'AI asistent 24/7', desc: 'Pomůže s CV, dopisy i otázkami.', value: true },
        { name: 'Bewerbungsdossier + šablony CV', desc: 'Kompletní složka optimalizovaná pro CH trh.', value: true },
        { name: 'Smart Interview', desc: 'Příprava na pohovor v němčině (A1–C1).', value: true },
        { name: 'Analýza pracovní smlouvy', desc: 'AI ti rozebere smlouvu před podpisem.', value: true },
        { name: 'Analýza inzerátu', desc: 'Zjistíš, zda se pozice k tobě hodí.', value: true },
      ],
    },
    {
      category: 'Život ve Švýcarsku',
      items: [
        { name: 'Smart Housing', desc: 'Zautomatizuje hledání dostupného bydlení a ušetří ti hodiny.', value: true },
        { name: 'Smart Wooky', desc: 'Povolení, daně, pojištění — vyřešíš s AI.', value: true },
        { name: 'Průvodce procesem', desc: 'Provede tě celým přesunem krok za krokem.', value: 'Beta' },
      ],
    },
    {
      category: 'Podpora & záruky',
      items: [
        { name: 'Přímá podpora od Václava', desc: 'Osobní odpověď na tvé dotazy.', value: 'do 48 h' },
        { name: 'Zkušební doba zdarma', desc: 'Vyzkoušej vše 7 dní zdarma, bez rizika.', value: '7 dní' },
        { name: 'Zrušení kdykoliv', desc: 'Žádné závazky, zrušíš jedním klikem.', value: true },
      ],
    },
  ]

  const faqs = [
    { q: 'Jak Woker funguje?', a: 'Po přihlášení získáš přístup k 1 007+ kontaktům na švýcarské firmy, AI asistentovi pro CV a motivační dopisy, a krok-za-krokem průvodci celým procesem nástupu do CH.' },
    { q: 'Jak funguje 7denní trial?', a: 'Prvních 7 dní máš plný přístup ke všemu — zdarma. Kartu zadáš při registraci, ale 7 dní se nic nestrhne. Pokud tě Woker nepřesvědčí, zrušíš jedním klikem a nezaplatíš nic. Po 7 dnech ti běží předplatné za CHF 9/měsíc.' },
    { q: 'Můžu zrušit kdykoliv?', a: 'Ano. Předplatné zrušíš jedním klikem ve svém účtu. Žádné výpovědní lhůty, žádné skryté poplatky.' },
    { q: 'Proč ne pracovní agentura?', a: 'Agentury si často berou 400–600 € z první výplaty a mají skryté provize. Woker je transparentní fixní cena CHF 9/měsíc — a prvních 7 dní zdarma. Kontakty na firmy získáš napřímo.' },
    { q: 'V jakém jazyce to funguje?', a: 'Woker mluví 10 jazyky — čeština, slovenština, polština, němčina, angličtina, ukrajinština, maďarština, rumunština, chorvatština a bulharština.' },
    { q: 'Co když nenajdu práci?', a: 'Woker ti hledání práce výrazně zjednoduší a zrychlí — kontakty, AI a přihlášky na jednom místě — ale práci ti nikdo garantovat nemůže, záleží i na tobě. Proto máš 7 dní zdarma: vyzkoušíš si to, pošleš první přihlášky, a teprve když uvidíš že ti to dává smysl, začneš platit.' },
    { q: 'Jak je to s platbou?', a: 'Platba přes Stripe (karta, Apple Pay, Google Pay). Žádné platby předem agenturám, žádné kauce.' },
  ]

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Caveat:wght@500;700&display=swap');
      `}</style>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: '#0a0a12',
        paddingTop: '64px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
          top: '-200px', left: '-100px',
          background: 'radial-gradient(circle, rgba(251,146,60,0.12), transparent 70%)',
        }} />
        <div style={{
          position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
          bottom: '-300px', right: '-200px',
          background: 'radial-gradient(circle, rgba(100,60,255,0.1), transparent 70%)',
        }} />

        {/* HERO */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '1080px', margin: '0 auto',
          padding: '48px 24px 24px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'inline-block', marginBottom: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              color: '#0a0a12',
              fontSize: '32px',
              fontWeight: 800,
              padding: '6px 24px',
              borderRadius: '12px',
              letterSpacing: '4px',
              transform: 'rotate(-2deg)',
              boxShadow: '0 8px 32px rgba(251,146,60,0.3)',
            }}>PRO</div>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            color: 'white',
            marginBottom: '16px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            Tvůj první{' '}
            <span style={{
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>švýcarský plat</span>
            <br/>začíná právě tady.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '17px',
            maxWidth: '720px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            S Wokerem ušetříte <span style={{ color: '#fb923c', fontWeight: 700 }}>stovky franků měsíčně</span> za jiné aplikace a nástroje. A taky ušetříte <span style={{ color: '#fb923c', fontWeight: 700 }}>hodiny času</span> — tvorbou CV, psaním a odesíláním emailů i neúnavným čekáním na odpovědi z facebookových skupin. Všechno v jednom jednoduchém <span style={{ color: '#fb923c', fontWeight: 700 }}>AI nástroji</span>.
          </p>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '4px',
              background: '#111120', borderRadius: '14px', padding: '4px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => setBilling('monthly')}
                style={{
                  padding: '12px 28px', borderRadius: '10px', border: 'none',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: billing === 'monthly' ? '#fb923c' : 'transparent',
                  color: billing === 'monthly' ? '#0a0a12' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >Měsíčně</button>
              <button
                onClick={() => setBilling('quarterly')}
                style={{
                  padding: '12px 28px', borderRadius: '10px', border: 'none',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: billing === 'quarterly' ? '#fb923c' : 'transparent',
                  color: billing === 'quarterly' ? '#0a0a12' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
              >Kvartálně</button>
            </div>

            {/* handwritten SAVE note — coolors signature */}
            <div style={{
              position: 'absolute',
              right: '-120px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', gap: '4px',
              pointerEvents: 'none',
            }}>
              <svg width="40" height="36" viewBox="0 0 40 36" fill="none" style={{ transform: 'translateY(2px)' }}>
                <path d="M2 4 Q 10 4, 18 10 T 36 24 L 30 22 M 36 24 L 32 30"
                  stroke="#fb923c" strokeWidth="2" strokeLinecap="round" fill="none"/>
              </svg>
              <span style={{
                fontFamily: "'Caveat', cursive",
                color: '#fb923c',
                fontSize: '24px',
                fontWeight: 700,
                transform: 'rotate(-6deg)',
                whiteSpace: 'nowrap',
              }}>UŠETŘÍŠ 30%</span>
            </div>
          </div>
        </div>

        {/* PRICING CARD */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '460px', margin: '0 auto',
          padding: '48px 24px 0',
        }}>
          <div>
            {/* PRO */}
            <div style={{
              background: '#111120',
              border: '2px solid #fb923c',
              borderRadius: '20px',
              padding: '36px 32px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 12px 48px rgba(251,146,60,0.12)',
            }}>
              <div style={{
                position: 'absolute', top: '-80px', right: '-80px',
                width: '240px', height: '240px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,146,60,0.15), transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    color: '#fb923c',
                    fontSize: '14px', fontWeight: 700,
                    letterSpacing: '1px', textTransform: 'uppercase',
                  }}>Woker Pro</div>
                  <span style={{
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    color: '#0a0a12', fontSize: '10px', fontWeight: 800,
                    padding: '4px 10px', borderRadius: '100px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>⭐ Populární</span>
                </div>

                {billing === 'monthly' ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 600, marginRight: '6px' }}>CHF</span>
                    <span style={{ color: 'white', fontSize: '52px', fontWeight: 800, letterSpacing: '-0.02em' }}>9</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginLeft: '6px' }}>/měsíc</span>
                  </div>
                ) : (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        color: 'rgba(255,255,255,0.35)', fontSize: '20px',
                        fontWeight: 600, textDecoration: 'line-through',
                        marginRight: '6px',
                      }}>CHF 27</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', fontWeight: 600, marginRight: '6px' }}>CHF</span>
                      <span style={{ color: 'white', fontSize: '52px', fontWeight: 800, letterSpacing: '-0.02em' }}>19</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginLeft: '6px' }}>/3 měsíce</span>
                    </div>
                  </div>
                )}

                <p style={{
                  color: 'rgba(255,255,255,0.5)', fontSize: '14px',
                  marginBottom: '28px', lineHeight: 1.5,
                }}>
                  Při 30 CHF/h to máš zpět za <span style={{ color: '#fb923c', fontWeight: 700 }}>{billing === 'monthly' ? '18 minut' : '38 minut'}</span> práce.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px', flex: 1 }}>
                  {[
                    '1 007+ přímých kontaktů na Temporärbüro',
                    'Smart Apply — auto-emaily z Gmailu',
                    'Smart Outreach — přímý kontakt na firmy',
                    'Smart Housing — bydlení s přímými kontakty',
                    'AI asistent 24/7 — CV, dopisy, otázky',
                    'Smart Interview — příprava v DE (A1–C1)',
                    'Smart Wooky — povolení, daně, pojištění',
                    'Bewerbungsdossier + šablony CV',
                    'Analýza pracovní smlouvy',
                    'Analýza inzerátu zda se ti hodí',
                    'Tracking přihlášek na jednom místě',
                    'Průvodce procesem krok za krokem',
                    'Denní nové nabídky bez limitu',
                    ...(billing === 'quarterly' ? ['⭐ Přímá podpora od Václava'] : []),
                  ].map((t) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(251,146,60,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleCheckout(billing)}
                  disabled={loading !== null}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    color: '#0a0a12',
                    border: 'none',
                    padding: '18px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 8px 28px rgba(251,146,60,0.3)',
                  }}
                >
                  {loading ? 'Načítání…' : 'Vyzkoušet 7 dní zdarma →'}
                </button>

                <p style={{
                  textAlign: 'center', marginTop: '12px',
                  color: 'rgba(255,255,255,0.35)', fontSize: '12px',
                }}>
                  🔒 Prvních 7 dní zdarma · zrušíš kdykoliv
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PRO FEATURES — seskupená tabulka */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '720px', margin: '0 auto',
          padding: '96px 24px 0',
        }}>
          <h2 style={{
            color: 'white', fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800, textAlign: 'center', marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>Co je v Pro</h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '16px',
            textAlign: 'center', maxWidth: '560px',
            margin: '0 auto 48px',
          }}>Všechno, co potřebuješ k práci ve Švýcarsku — na jednom místě.</p>

          {featureGroups.map((group) => (
            <div key={group.category} style={{ marginBottom: '36px' }}>
              <div style={{
                color: '#fb923c', fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: '2px',
              }}>{group.category}</div>
              {group.items.map((item) => (
                <div key={item.name} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '24px', padding: '18px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '3px' }}>{item.desc}</div>
                  </div>
                  {item.value === true ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="11" fill="rgba(251,146,60,0.12)" />
                      <path d="M7 12.4L10.4 15.8L17 9" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : item.value === 'Beta' ? (
                    <span style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Beta</span>
                  ) : (
                    <span style={{ color: '#fb923c', fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* SAVINGS COMPARISON — "Ve Wokeru vždy dostáváte více za méně" */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '760px', margin: '0 auto',
          padding: '96px 24px 0',
        }}>
          <h2 style={{
            color: 'white', fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800, textAlign: 'center', marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>Ve Wokeru vždy dostáváte <span style={{
            background: 'linear-gradient(135deg, #fb923c, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>více za méně</span>.</h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '16px',
            textAlign: 'center', maxWidth: '520px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>8 placených nástrojů v jednom předplatném — tady je konkrétní matematika.</p>

          <div style={{
            background: '#111120',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { tool: 'Smart Apply', replaces: 'Sonara, LoopCV', price: 29 },
                { tool: 'Smart CV & Bewerbungsdossier', replaces: 'Canva Pro, Rezi', price: 34 },
                { tool: 'AI motivační dopisy', replaces: 'ChatGPT Plus', price: 16 },
                { tool: 'Smart Interview', replaces: 'Yoodli Pro', price: 6 },
                { tool: 'Smart Housing', replaces: 'Homegate', price: 30 },
                { tool: 'Překlady DE/EN ↔ CZ', replaces: 'DeepL Pro', price: 8 },
                { tool: 'Smart Outreach', replaces: 'Lemlist', price: 62 },
                { tool: 'Sledování přihlášek', replaces: 'Huntr', price: 31 },
              ].map((row) => (
                <div key={row.tool} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  gap: '16px', alignItems: 'center',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>{row.tool}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>
                      Nahrazuje: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{row.replaces}</span>
                    </div>
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.4)', fontSize: '15px',
                    fontWeight: 600, textDecoration: 'line-through',
                    whiteSpace: 'nowrap',
                  }}>CHF {row.price}</div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '24px', paddingTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Co bys normálně platil</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: 700, textDecoration: 'line-through' }}>CHF 216/měs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>S Wokerem</span>
                <span style={{ color: 'white', fontSize: '22px', fontWeight: 800 }}>CHF 9/měs</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(249,115,22,0.08))',
                border: '1px solid rgba(251,146,60,0.25)',
                borderRadius: '12px',
                padding: '14px 18px',
                marginTop: '6px',
              }}>
                <span style={{ color: '#fb923c', fontSize: '15px', fontWeight: 700 }}>Ušetříš</span>
                <span style={{ color: '#fb923c', fontSize: '24px', fontWeight: 800 }}>CHF 207/měs</span>
              </div>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS — "Přidej se k nám" */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '1080px', margin: '0 auto',
          padding: '96px 24px 0',
        }}>
          <h2 style={{
            color: 'white', fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800, textAlign: 'center', marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>Přidej se k <span style={{ color: '#fb923c' }}>nám</span>.</h2>
          <p style={{
            color: 'white', fontSize: '17px',
            textAlign: 'center', maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
            fontWeight: 500,
          }}>Mohli bychom psát o tom, jak jsme <span style={{ color: '#fb923c', fontWeight: 700 }}>super</span>.<br/>Místo toho ti to řeknou <span style={{ color: '#fb923c', fontWeight: 700 }}>naši klienti</span>.</p>

          {/* reálné recenze — screenshoty */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px',
            alignItems: 'start',
          }}>
            <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reviews/recenze-1.jpg" alt="Recenze od člena Wokeru" style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
            </div>
            <div style={{ background: '#111120', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/reviews/recenze-2.jpg" alt="Recenze od člena Wokeru" style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
            </div>
          </div>

          {/* Trustpilot + osobní kontakt */}
          <div style={{
            borderRadius: '16px',
            border: '1px solid rgba(251,146,60,0.2)',
            background: 'linear-gradient(135deg, rgba(251,146,60,0.08), transparent)',
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <h3 style={{ color: 'white', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Máš zkušenost s Wokerem?</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Ohodnoť nás na Trustpilotu — tvoje zpětná vazba nám pomáhá zlepšovat poskytované služby.
            </p>
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              <TrustpilotWidget />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '24px 0 0' }}>Nebo nám napiš osobně na:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
              <a href="https://instagram.com/vasicenko" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Instagram</a>
              <a href="https://www.facebook.com/vasicenko" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>Facebook</a>
              <a href="https://tiktok.com/@vasicenko" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>TikTok</a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '760px', margin: '0 auto',
          padding: '96px 24px 0',
        }}>
          <h2 style={{
            color: 'white', fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800, textAlign: 'center', marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>Časté otázky</h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '16px',
            textAlign: 'center', marginBottom: '40px',
          }}>Něco ti není jasné? Napiš mi na <a href="mailto:info@gowoker.com" style={{ color: '#fb923c', textDecoration: 'none' }}>info@gowoker.com</a></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} style={{
                  background: '#111120',
                  border: `1px solid ${open ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '20px 24px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    <span>{f.q}</span>
                    <span style={{
                      color: '#fb923c',
                      fontSize: '20px',
                      transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0, marginLeft: '12px',
                    }}>+</span>
                  </button>
                  {open && (
                    <div style={{
                      padding: '0 24px 20px',
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                    }}>{f.a}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* FINAL CTA */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '900px', margin: '0 auto',
          padding: '96px 24px 80px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,146,60,0.08), rgba(100,60,255,0.05))',
            border: '1px solid rgba(251,146,60,0.2)',
            borderRadius: '24px',
            padding: '56px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
              width: '400px', height: '400px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251,146,60,0.1), transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                color: 'white', fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 800, marginBottom: '14px',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}>
                Najdi si práci <span style={{
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>ještě dnes</span><br/>a <span style={{
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>změň svůj život</span>.
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.55)', fontSize: '16px',
                marginBottom: '32px', maxWidth: '460px',
                margin: '0 auto 32px',
              }}>Připoj se k 50+ lidem, co teď hledají práci přes Woker.</p>
              <button
                onClick={() => handleCheckout(billing)}
                disabled={loading !== null}
                style={{
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                  color: '#0a0a12',
                  border: 'none',
                  padding: '18px 40px',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 8px 28px rgba(251,146,60,0.3)',
                }}
              >Vyzkoušet 7 dní zdarma →</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
