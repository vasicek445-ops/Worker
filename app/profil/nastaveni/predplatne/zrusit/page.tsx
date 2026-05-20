'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const REASONS = [
  { value: 'price',     label: 'Je to pro mě moc drahé' },
  { value: 'unused',    label: 'Nepoužívám to / nemám čas' },
  { value: 'missing',   label: 'Chybí mi funkce / nesplnilo očekávání' },
  { value: 'bug',       label: 'Něco se rozbilo / technické problémy' },
  { value: 'found_job', label: 'Už jsem práci našel(a)' },
  { value: 'alt',       label: 'Našel(a) jsem alternativu' },
  { value: 'other',     label: 'Jiný důvod' },
]

const LOSE_ACCESS = [
  '1000+ kontaktů na agentury a personalisty',
  'AI generování CV a motivačního dopisu',
  'Smart Apply — automatické odesílání přihlášek',
  'Smart Matching — denní napárování pozic na profil',
  'Přístup do komunity a prioritní podpora',
]

export default function CancelSubscriptionPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [reason, setReason] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (!data.user) { router.replace('/prihlaseni'); return }
      setUserId(data.user.id)
    })
    return () => { cancelled = true }
  }, [router])

  async function handleSubmit() {
    if (!userId || !reason) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason, comment: comment.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Něco se pokazilo')
        setSubmitting(false)
        return
      }
      setDone(true)
    } catch {
      setError('Chyba sítě. Zkus to znovu.')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a12', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👋</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Předplatné zrušeno</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
            Máš přístup ke všem funkcím do konce zaplaceného období.
            Pak se účet automaticky přepne na free verzi — žádné další platby.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>
            Díky za zpětnou vazbu. Když si to rozmyslíš, můžeš se kdykoli vrátit.
          </p>
          <button
            onClick={() => router.push('/profil')}
            style={{ background: '#fb923c', color: '#0a0a12', fontWeight: 700, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
          >
            Zpět na profil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <button
          onClick={() => router.push('/profil/nastaveni/predplatne')}
          style={{ background: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 24, padding: 0 }}
        >
          ← Zpět
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Rušíš předplatné</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, lineHeight: 1.6 }}>
          Mrzí mě to. Než to potvrdím, řekni mi prosím v krátkosti proč — pomáhá mi to Woker zlepšovat.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>— Václav, zakladatel</span>
        </p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Co ztratíš</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOSE_ACCESS.map((item) => (
              <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Proč rušíš?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REASONS.map((r) => (
              <label
                key={r.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: reason === r.value ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${reason === r.value ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  style={{ accentColor: '#fb923c' }}
                />
                <span style={{ fontSize: 14 }}>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Co bys vylepšil? <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(volitelné)</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 12 }}>
            Konkrétní zpětná vazba mi pomůže nejvíc. Pište klidně osobně.
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Co tě nejvíc štvalo? Co chybělo? Co bys změnil?"
            maxLength={2000}
            rows={4}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 12,
              color: 'white',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
            ℹ️ Předplatné běží <strong>do konce zaplaceného období</strong>. Pak skončí — žádné další platby.
            Mezitím máš plný přístup ke všem funkcím.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, marginBottom: 16, color: '#fca5a5', fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => router.push('/profil/nastaveni/predplatne')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}
          >
            Nechat předplatné
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            style={{
              background: reason ? '#fb923c' : 'rgba(255,255,255,0.05)',
              color: reason ? '#0a0a12' : 'rgba(255,255,255,0.3)',
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: reason ? 'pointer' : 'not-allowed',
              fontSize: 14,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Ruším...' : 'Potvrdit zrušení'}
          </button>
        </div>
      </div>
    </div>
  )
}
