"use client"

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../supabase'

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  const handleCheckout = async (planKey: string) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          userId: user.id,
          email: user.email,
        }),
      })
      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Něco se pokazilo')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>
      <main style={{
        minHeight: '100vh',
        background: '#0a0a12',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background effects */}
        <div style={{
          position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
          top: '-200px', left: '-100px',
          background: 'radial-gradient(circle, rgba(57,255,110,0.12), transparent 70%)',
        }} />
        <div style={{
          position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.4,
          bottom: '-300px', right: '-200px',
          background: 'radial-gradient(circle, rgba(100,60,255,0.1), transparent 70%)',
        }} />

        {/* Navigation */}
        <nav style={{
          padding: '20px 24px',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', color: 'white',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '16px', color: '#0a0a12',
            }}>W</div>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>Woker</span>
          </Link>
        </nav>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: '900px', margin: '0 auto',
          padding: '40px 24px 80px',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(57,255,110,0.1)',
              border: '1px solid rgba(57,255,110,0.2)',
              borderRadius: '100px',
              padding: '6px 16px',
              fontSize: '13px',
              color: '#39ff6e',
              fontWeight: 600,
              marginBottom: '20px',
              letterSpacing: '0.5px',
            }}>
              ✨ PRÉMIOVÝ PŘÍSTUP
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800,
              color: 'white',
              marginBottom: '12px',
              lineHeight: 1.15,
            }}>
              Začni pracovat ve{' '}
              <span style={{
                background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Švýcarsku</span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '16px',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              Bez agentury. Bez provize. Přímo ty a zaměstnavatel.
            </p>
          </div>

          {/* Billing toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '4px', marginBottom: '40px',
            background: '#111120', borderRadius: '14px', padding: '4px',
            width: 'fit-content', margin: '0 auto 40px',
          }}>
            <button
              onClick={() => setBilling('monthly')}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
                background: billing === 'monthly' ? '#39ff6e' : 'transparent',
                color: billing === 'monthly' ? '#0a0a12' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
              }}
            >
              Měsíčně
            </button>
            <button
              onClick={() => setBilling('yearly')}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
                background: billing === 'yearly' ? '#39ff6e' : 'transparent',
                color: billing === 'yearly' ? '#0a0a12' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              Ročně
              <span style={{
                background: billing === 'yearly' ? 'rgba(0,0,0,0.2)' : 'rgba(57,255,110,0.15)',
                color: billing === 'yearly' ? '#0a0a12' : '#39ff6e',
                padding: '2px 8px', borderRadius: '6px',
                fontSize: '11px', fontWeight: 700,
              }}>-17%</span>
            </button>
          </div>

          {/* Plans container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            maxWidth: '760px',
            margin: '0 auto',
          }}>
            {/* Monthly / Yearly Plan */}
            <div style={{
              background: '#111120',
              border: '2px solid rgba(57,255,110,0.3)',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Glow effect */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57,255,110,0.1), transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '24px',
                }}>
                  <span style={{
                    color: 'white', fontSize: '20px', fontWeight: 700,
                  }}>Woker Premium</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
                    color: '#0a0a12', fontSize: '11px', fontWeight: 800,
                    padding: '5px 12px', borderRadius: '100px',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>⭐ Populární</span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '8px' }}>
                  {billing === 'monthly' ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ color: 'white', fontSize: '48px', fontWeight: 800 }}>€9</span>
                      <span style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>.99</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginLeft: '4px' }}>/měsíc</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ color: 'white', fontSize: '48px', fontWeight: 800 }}>€99</span>
                        <span style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>.99</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginLeft: '4px' }}>/rok</span>
                      </div>
                      <span style={{ color: '#39ff6e', fontSize: '13px', fontWeight: 600 }}>
                        Ušetříš 19,89 € ročně
                      </span>
                    </div>
                  )}
                </div>

                <p style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: '13px',
                  marginBottom: '28px',
                }}>
                  Při 30 CHF/h to máš zpět za <span style={{ color: '#39ff6e', fontWeight: 700 }}>20 minut</span>
                </p>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                  {[
                    { text: '1 007+ přímých kontaktů na firmy', highlight: true },
                    { text: 'Neomezený přístup k nabídkám', highlight: true },
                    { text: 'AI asistent 24/7 — CV, dopisy, otázky', highlight: true },
                    { text: 'Průvodce procesem krok za krokem', highlight: false },
                    { text: 'Šablony životopisů pro CH', highlight: false },
                    { text: 'Denní nové nabídky', highlight: false },
                    { text: 'Dostupné v 10 jazycích', highlight: false },
                  ].map((f) => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: f.highlight ? 'rgba(57,255,110,0.15)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke={f.highlight ? '#39ff6e' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: f.highlight ? 'white' : 'rgba(255,255,255,0.55)',
                        fontWeight: f.highlight ? 600 : 400,
                      }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(billing)}
                  disabled={loading !== null}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
                    color: '#0a0a12',
                    border: 'none',
                    padding: '16px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 24px rgba(57,255,110,0.25)',
                  }}
                >
                  {loading ? 'Načítání...' : billing === 'monthly' ? 'ZÍSKAT PŘÍSTUP TEĎ →' : 'ZAČÍT ZA 99,99 €/ROK →'}
                </button>

                <p style={{
                  textAlign: 'center', marginTop: '12px',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                }}>
                  🔒 Bezpečná platba · Zrušíš kdykoliv
                </p>
              </div>
            </div>

            {/* Yearly bonus card - only show if monthly selected */}
            {billing === 'monthly' && (
              <div style={{
                background: '#111120',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '32px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: '100px',
                  padding: '5px 14px',
                  fontSize: '11px',
                  color: '#ffd700',
                  fontWeight: 700,
                  display: 'inline-block',
                  width: 'fit-content',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Roční</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                  <span style={{ color: 'white', fontSize: '42px', fontWeight: 800 }}>€99</span>
                  <span style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>.99</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginLeft: '4px' }}>/rok</span>
                </div>

                <span style={{
                  background: 'rgba(57,255,110,0.1)', color: '#39ff6e',
                  padding: '4px 12px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 700, display: 'inline-block', width: 'fit-content',
                  marginBottom: '24px',
                }}>Ušetříte 20 €</span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {[
                    { text: 'Vše z měsíčního plánu', icon: '✅' },
                    { text: 'Osobní podpora od Václava', icon: '⭐', gold: true },
                    { text: 'Prémiové nabídky jako první', icon: '✅' },
                    { text: 'Šablony životopisů pro CH', icon: '✅' },
                    { text: '3denní zkušební doba', icon: '✅' },
                    { text: '2 měsíce zdarma', icon: '✅' },
                  ].map((f) => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: f.gold ? 'rgba(255,215,0,0.15)' : 'rgba(57,255,110,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke={f.gold ? '#ffd700' : '#39ff6e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: f.gold ? '#ffd700' : 'rgba(255,255,255,0.7)',
                        fontWeight: f.gold ? 700 : 500,
                      }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setBilling('yearly'); handleCheckout('yearly'); }}
                  disabled={loading !== null}
                  style={{
                    width: '100%',
                    background: '#1a1a30',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '16px',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  Začít 3 dny zdarma →
                </button>

                <p style={{
                  textAlign: 'center', marginTop: '12px',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                }}>
                  🔒 Bezpečná platba · Zrušíš kdykoliv
                </p>
              </div>
            )}
          </div>

          {/* Comparison table */}
          <div style={{
            maxWidth: '600px', margin: '48px auto 0',
            background: '#111120', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '28px',
          }}>
            <h3 style={{
              color: 'white', fontWeight: 700, fontSize: '18px',
              textAlign: 'center', marginBottom: '24px',
            }}>Agentura vs Woker</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Cena', agency: '400–600 €', woker: '9,99 €/měs' },
                { label: 'Kontakty na firmy', agency: '❌ Žádné', woker: '✅ 1 007+' },
                { label: 'Transparentnost', agency: '❌ Skryté poplatky', woker: '✅ Plná' },
                { label: 'AI asistent', agency: '❌', woker: '✅ 24/7' },
                { label: 'Zrušení', agency: '❌ Složité', woker: '✅ Kdykoliv' },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px', padding: '12px 0',
                  borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{row.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center' }}>{row.agency}</span>
                  <span style={{ color: '#39ff6e', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{row.woker}</span>
                </div>
              ))}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textAlign: 'center', fontWeight: 600 }}>Agentura</span>
                <span style={{ color: '#39ff6e', fontSize: '11px', textAlign: 'center', fontWeight: 700 }}>Woker ✓</span>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <p style={{
            textAlign: 'center', marginTop: '32px',
            color: 'rgba(255,255,255,0.3)', fontSize: '13px',
          }}>
            Už 50+ lidí hledá práci ve Švýcarsku přes Woker
          </p>
        </div>
      </main>
    </>
  )
}
