'use client'

import { useRef, useState } from 'react'

/* ═══ DATA TYPES ═══ */
interface LetterData {
  senderName: string
  senderAddress: string
  senderPhone: string
  senderEmail: string
  recipientName: string
  recipientAddress: string
  date: string
  subject: string
  salutation: string
  bodyParagraphs: string[]
  closing: string
  signature: string
}

interface LetterPreviewProps {
  data: LetterData
  template: string
  accentColor: string
  onSave?: (html: string) => void
  saving?: boolean
  saved?: boolean
}

/* ═══ TEMPLATE CATALOG ═══ */
export const LETTER_TEMPLATES: Array<{ id: string; name: string; desc: string; icon: string; category: string }> = [
  // Klassisch
  { id: 'letter-classic', name: 'Classic', desc: 'Formální bílý, tmavá hlavička', icon: '🏢', category: 'Klassisch' },
  { id: 'letter-formal', name: 'Formal', desc: 'Tradiční obchodní dopis', icon: '📜', category: 'Klassisch' },
  { id: 'letter-swiss', name: 'Swiss', desc: 'Oficiální švýcarský formát', icon: '🇨🇭', category: 'Klassisch' },
  { id: 'letter-elegant', name: 'Elegant', desc: 'Jemný sidebar, elegantní', icon: '💎', category: 'Klassisch' },
  // Modern
  { id: 'letter-modern', name: 'Modern', desc: 'Barevný banner, moderní', icon: '✨', category: 'Modern' },
  { id: 'letter-minimal', name: 'Minimal', desc: 'Ultra-čistý, hodně bílé', icon: '📐', category: 'Modern' },
  { id: 'letter-bold', name: 'Bold', desc: 'Velké jméno, gradient', icon: '🔥', category: 'Modern' },
  { id: 'letter-clean', name: 'Clean', desc: 'Světlé sekce, zaoblené', icon: '🧊', category: 'Modern' },
  // Professional
  { id: 'letter-executive', name: 'Executive', desc: 'Tmavá hlavička, korporátní', icon: '👔', category: 'Professional' },
  { id: 'letter-corporate', name: 'Corporate', desc: 'Dvousloupcová hlavička', icon: '🏛️', category: 'Professional' },
  { id: 'letter-business', name: 'Business', desc: 'Horní accent bar', icon: '💼', category: 'Professional' },
  { id: 'letter-premium', name: 'Premium', desc: 'Prémiová typografie', icon: '👑', category: 'Professional' },
  // Creative
  { id: 'letter-creative', name: 'Creative', desc: 'Barevný sidebar', icon: '🎨', category: 'Creative' },
  { id: 'letter-accent', name: 'Accent', desc: 'Velký barevný blok', icon: '🎯', category: 'Creative' },
  { id: 'letter-sidebar', name: 'Sidebar', desc: 'Plný levý sidebar', icon: '📊', category: 'Creative' },
  { id: 'letter-artistic', name: 'Artistic', desc: 'Dekorativní hlavička', icon: '🎭', category: 'Creative' },
  // Dark
  { id: 'letter-dark', name: 'Dark', desc: 'Tmavé pozadí, světlý text', icon: '🌙', category: 'Dark' },
  { id: 'letter-night', name: 'Night', desc: 'Tmavá hlavička, bílé tělo', icon: '🌃', category: 'Dark' },
  { id: 'letter-shadow', name: 'Shadow', desc: 'Bílá se stíny', icon: '🖤', category: 'Dark' },
  { id: 'letter-contrast', name: 'Contrast', desc: 'Černá a akcentová barva', icon: '⚡', category: 'Dark' },
]

/* ═══ HELPERS ═══ */
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const SERIF = "Georgia, 'Times New Roman', serif"
const W = '210mm'
const MIN_H = '297mm'

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/* ═══ SHARED BODY RENDERER ═══ */
function LetterBody({ data, font, color, lineHeight }: { data: LetterData; font: string; color: string; lineHeight: string }) {
  return (
    <>
      <p style={{ margin: '0 0 24px 0', fontWeight: 600, fontSize: '11pt', fontFamily: font, color }}>{data.subject}</p>
      <p style={{ margin: '0 0 18px 0', fontFamily: font, color, lineHeight }}>{data.salutation}</p>
      {data.bodyParagraphs.map((p, i) => (
        <p key={i} style={{ margin: '0 0 14px 0', fontFamily: font, color, lineHeight, textAlign: 'justify' as const }}>{p}</p>
      ))}
      <p style={{ margin: '28px 0 6px 0', fontFamily: font, color, lineHeight }}>{data.closing}</p>
      <p style={{ margin: '0', fontWeight: 600, fontFamily: font, color }}>{data.signature}</p>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   KLASSISCH TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterClassic({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>{data.senderName}</div>
          <div style={{ fontSize: '9pt', color: hexToRgba(c, 0.9), marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' as const }}>Bewerbungsschreiben</div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ height: '3px', background: c }} />
      {/* Body */}
      <div style={{ padding: '40px 48px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6', color: '#333' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, marginBottom: '32px', fontSize: '9.5pt', color: '#666' }}>{data.date}</div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterFormal({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, padding: '52px 56px' }}>
      {/* Sender */}
      <div style={{ borderBottom: `2px solid ${c}`, paddingBottom: '16px', marginBottom: '36px' }}>
        <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a', fontFamily: SERIF }}>{data.senderName}</div>
        <div style={{ fontSize: '9pt', color: '#666', marginTop: '6px', fontFamily: SANS }}>
          {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
        </div>
      </div>
      {/* Recipient & date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '10pt', color: '#666' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
    </div>
  )
}

function LetterSwiss({ data, c }: { data: LetterData; c: string }) {
  const red = c || '#E8302A'
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Red top line */}
      <div style={{ height: '4px', background: red }} />
      <div style={{ padding: '40px 52px' }}>
        {/* Sender top right */}
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#666', lineHeight: '1.6', marginBottom: '28px' }}>
          <div style={{ fontWeight: 700, fontSize: '10pt', color: '#1a1a1a' }}>{data.senderName}</div>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} &middot; {data.senderEmail}</div>
        </div>
        {/* Recipient */}
        <div style={{ marginBottom: '12px', fontSize: '10pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        {/* Date right */}
        <div style={{ textAlign: 'right' as const, marginBottom: '36px', fontSize: '9.5pt', color: '#666' }}>{data.date}</div>
        {/* Separator */}
        <div style={{ height: '1px', background: '#ddd', marginBottom: '28px' }} />
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
      {/* Footer line */}
      <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: '4px', background: red }} />
    </div>
  )
}

function LetterElegant({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Left sidebar */}
      <div style={{ width: '68px', background: '#f5f5f5', borderRight: `3px solid ${c}`, padding: '40px 14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '24px' }}>
        <div style={{ writingMode: 'vertical-rl' as const, transform: 'rotate(180deg)', fontSize: '8pt', color: '#999', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Bewerbung</div>
      </div>
      {/* Main content */}
      <div style={{ flex: 1, padding: '40px 44px' }}>
        {/* Sender */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: '#888', marginTop: '4px' }}>
            {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
          </div>
        </div>
        <div style={{ height: '1px', background: '#eee', marginBottom: '24px' }} />
        {/* Recipient + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MODERN TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterModern({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Colored header */}
      <div style={{ background: c, padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '22pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
          <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>
            {data.senderAddress}
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
      </div>
    </div>
  )
}

function LetterMinimal({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#444', background: '#fff', boxSizing: 'border-box' as const, padding: '60px 64px' }}>
      {/* Thin accent line */}
      <div style={{ width: '40px', height: '2px', background: c, marginBottom: '32px' }} />
      {/* Name */}
      <div style={{ fontSize: '14pt', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>{data.senderName}</div>
      <div style={{ fontSize: '8.5pt', color: '#aaa', marginBottom: '40px' }}>
        {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
      </div>
      {/* Recipient */}
      <div style={{ marginBottom: '8px', fontSize: '9.5pt', lineHeight: '1.6' }}>
        <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
        <div>{data.recipientAddress}</div>
      </div>
      {/* Date */}
      <div style={{ textAlign: 'right' as const, marginBottom: '40px', fontSize: '9.5pt', color: '#aaa' }}>{data.date}</div>
      <LetterBody data={data} font={SANS} color="#444" lineHeight="1.7" />
    </div>
  )
}

function LetterBold({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Large name header */}
      <div style={{ padding: '44px 48px 28px', borderBottom: `4px solid transparent`, backgroundImage: `linear-gradient(#fff,#fff), linear-gradient(90deg, ${c}, ${darkenHex(c, 40)})`, backgroundClip: 'padding-box, border-box', backgroundOrigin: 'border-box' }}>
        <div style={{ fontSize: '28pt', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', lineHeight: '1.1' }}>{data.senderName}</div>
        <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '8px', letterSpacing: '0.5px' }}>
          {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
      </div>
    </div>
  )
}

function LetterClean({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fafbfc', boxSizing: 'border-box' as const }}>
      {/* Header card */}
      <div style={{ margin: '24px 32px 0', background: '#fff', borderRadius: '12px', padding: '28px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#888', lineHeight: '1.6' }}>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ width: '50px', height: '3px', background: c, borderRadius: '2px', margin: '20px auto' }} />
      {/* Body card */}
      <div style={{ margin: '0 32px 24px', background: '#fff', borderRadius: '12px', padding: '32px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#aaa' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PROFESSIONAL TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterExecutive({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Dark header */}
      <div style={{ background: '#0d0d1a', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{data.senderName}</div>
          <div style={{ width: '40px', height: '3px', background: c, marginTop: '8px', borderRadius: '2px' }} />
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '40px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterCorporate({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Two-column header */}
      <div style={{ display: 'flex', borderBottom: `3px solid ${c}` }}>
        <div style={{ flex: 1, padding: '32px 40px', background: '#f8f9fa' }}>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: '#888', marginTop: '6px', lineHeight: '1.6' }}>
            <div>{data.senderAddress}</div>
            <div>{data.senderPhone}</div>
          </div>
        </div>
        <div style={{ width: '200px', padding: '32px 28px', background: '#fff', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '8.5pt', color: '#888', textAlign: 'right' as const, lineHeight: '1.6' }}>
            <div>{data.senderEmail}</div>
            <div style={{ marginTop: '8px', fontSize: '7.5pt', color: c, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Bewerbung</div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '36px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterBusiness({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Top accent bar */}
      <div style={{ height: '6px', background: `linear-gradient(90deg, ${c}, ${darkenHex(c, 30)})` }} />
      <div style={{ padding: '36px 48px' }}>
        {/* Sender */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <div>
            <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
          </div>
          <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#888', lineHeight: '1.6' }}>
            <div>{data.senderPhone}</div>
            <div>{data.senderEmail}</div>
          </div>
        </div>
        {/* Recipient + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterPremium({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, position: 'relative' as const }}>
      {/* Subtle pattern overlay */}
      <div style={{ position: 'absolute' as const, top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle at top right, ${hexToRgba(c, 0.04)} 0%, transparent 70%)`, pointerEvents: 'none' as const }} />
      <div style={{ padding: '48px 52px', position: 'relative' as const }}>
        {/* Sender */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '20pt', fontWeight: 300, color: '#1a1a1a', letterSpacing: '1px' }}>{data.senderName}</div>
          <div style={{ width: '28px', height: '2px', background: c, margin: '12px 0' }} />
          <div style={{ fontSize: '8pt', color: '#999', letterSpacing: '0.5px', lineHeight: '1.7' }}>
            {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
          </div>
        </div>
        {/* Recipient + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#999' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.7" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   CREATIVE TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterCreative({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Colored sidebar */}
      <div style={{ width: '200px', background: c, padding: '40px 24px', color: '#fff', flexShrink: 0 }}>
        <div style={{ fontSize: '15pt', fontWeight: 700, marginBottom: '20px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Adresse</div>
          <div>{data.senderAddress}</div>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '16px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Kontakt</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: '40px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterAccent({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Large accent block */}
      <div style={{ background: c, padding: '48px 48px 36px', position: 'relative' as const }}>
        <div style={{ fontSize: '24pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
        <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.75)', marginTop: '8px', lineHeight: '1.6' }}>
          {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
        </div>
        {/* Angled bottom */}
        <div style={{ position: 'absolute' as const, bottom: '-1px', left: 0, right: 0, height: '20px', background: '#fff', clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
      </div>
      {/* Body */}
      <div style={{ padding: '24px 48px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterSidebar({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Full left sidebar */}
      <div style={{ width: '220px', background: '#1a1a2e', padding: '44px 24px', color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column' as const }}>
        <div style={{ fontSize: '16pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '3px', background: c, marginBottom: '24px', borderRadius: '2px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: '8px', color: c }}>Persoenliche Daten</div>
          <div style={{ marginBottom: '4px' }}>{data.senderAddress}</div>
          <div style={{ marginBottom: '4px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: '7pt', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Bewerbungsschreiben</div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: '44px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterArtistic({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Decorative header */}
      <div style={{ display: 'flex', height: '100px' }}>
        <div style={{ width: '45%', background: c }} />
        <div style={{ width: '10%', background: darkenHex(c, 20) }} />
        <div style={{ width: '45%', background: '#1a1a2e' }} />
      </div>
      <div style={{ padding: '32px 48px' }}>
        {/* Name over blocks */}
        <div style={{ marginTop: '-52px', marginBottom: '28px', position: 'relative' as const }}>
          <div style={{ fontSize: '22pt', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '28px', lineHeight: '1.6' }}>
          {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
        </div>
        <div style={{ height: '1px', background: '#eee', marginBottom: '24px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DARK TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterDark({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#e0e0e0', background: '#1a1a2e', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '44px 48px' }}>
        {/* Sender */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ width: '40px', height: '3px', background: c, marginTop: '10px', borderRadius: '2px' }} />
          <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', marginTop: '10px', lineHeight: '1.6' }}>
            {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
          </div>
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '24px' }} />
        {/* Recipient + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6', color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.4)' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#e0e0e0" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterNight({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Dark header */}
      <div style={{ background: '#0d0d1a', padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: c, marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Motivationsschreiben</div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${c}, transparent)` }} />
      {/* White body */}
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterShadow({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f0f0', boxSizing: 'border-box' as const, padding: '28px' }}>
      {/* Main card with shadow */}
      <div style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', padding: '44px 48px', minHeight: 'calc(297mm - 56px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '20px', borderBottom: `2px solid ${c}` }}>
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
          </div>
          <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#888', lineHeight: '1.6' }}>
            <div>{data.senderPhone}</div>
            <div>{data.senderEmail}</div>
          </div>
        </div>
        {/* Recipient + date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterContrast({ data, c }: { data: LetterData; c: string }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Black + accent header */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, background: '#0a0a0a', padding: '36px 40px' }}>
          <div style={{ fontSize: '20pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', marginTop: '6px', lineHeight: '1.6' }}>
            {data.senderAddress}
          </div>
        </div>
        <div style={{ width: '180px', background: c, padding: '36px 24px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' }}>
          <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.9)', lineHeight: '1.8' }}>
            <div>{data.senderPhone}</div>
            <div>{data.senderEmail}</div>
          </div>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '36px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE MAP & MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

const TEMPLATE_MAP: Record<string, React.FC<{ data: LetterData; c: string }>> = {
  // Klassisch
  'letter-classic': LetterClassic,
  'letter-formal': LetterFormal,
  'letter-swiss': LetterSwiss,
  'letter-elegant': LetterElegant,
  // Modern
  'letter-modern': LetterModern,
  'letter-minimal': LetterMinimal,
  'letter-bold': LetterBold,
  'letter-clean': LetterClean,
  // Professional
  'letter-executive': LetterExecutive,
  'letter-corporate': LetterCorporate,
  'letter-business': LetterBusiness,
  'letter-premium': LetterPremium,
  // Creative
  'letter-creative': LetterCreative,
  'letter-accent': LetterAccent,
  'letter-sidebar': LetterSidebar,
  'letter-artistic': LetterArtistic,
  // Dark
  'letter-dark': LetterDark,
  'letter-night': LetterNight,
  'letter-shadow': LetterShadow,
  'letter-contrast': LetterContrast,
}

export default function LetterPreview({ data, template, accentColor, onSave, saving, saved }: LetterPreviewProps) {
  const letterRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!letterRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const el = letterRef.current
      const inner = el.firstElementChild as HTMLElement | null
      const origMinH = inner?.style.minHeight || ''
      if (inner) inner.style.minHeight = 'auto'
      await html2pdf().set({
        margin: 0,
        filename: `Bewerbungsschreiben_${data.senderName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).from(el).save()
      if (inner) inner.style.minHeight = origMinH
    } catch { alert('Chyba pri generovani PDF.') }
    finally { setDownloading(false) }
  }

  const TemplateComponent = TEMPLATE_MAP[template] || LetterClassic

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={handleDownload} disabled={downloading} className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {downloading ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generuji PDF...</span>) : 'Stahnout jako PDF'}
        </button>
        {onSave && (
          saved ? (
            <div className="flex-1 bg-[#39ff6e]/10 border border-[#39ff6e]/30 text-[#39ff6e] font-bold py-3 px-6 rounded-xl text-center">
              Ulozeno
            </div>
          ) : (
            <button onClick={() => { if (letterRef.current) onSave(letterRef.current.innerHTML) }} disabled={saving} className="flex-1 bg-gradient-to-r from-[#39ff6e] to-[#2bcc58] text-[#0a0a12] font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
              {saving ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />Ukladam...</span>) : 'Ulozit pro prihlasky'}
            </button>
          )
        )}
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ overflowX: 'auto' }}>
        <div ref={letterRef}>
          <TemplateComponent data={data} c={accentColor} />
        </div>
      </div>
      <p className="text-gray-500 text-xs text-center mt-4">PDF ve formatu A4</p>
    </div>
  )
}
