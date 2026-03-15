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
  photo?: string | null
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
  // Pro Series
  { id: 'letter-pro-classic', name: 'Pro Classic', desc: 'Profesionální sidebar', icon: '💼', category: 'Profesionální' },
  { id: 'letter-pro-light', name: 'Pro Light', desc: 'Světlý sidebar', icon: '☀️', category: 'Profesionální' },
  { id: 'letter-pro-serif', name: 'Pro Serif', desc: 'Patkové písmo', icon: '📖', category: 'Profesionální' },
  { id: 'letter-pro-gradient', name: 'Pro Gradient', desc: 'Gradientový sidebar', icon: '🌈', category: 'Profesionální' },
  { id: 'letter-pro-compact', name: 'Pro Compact', desc: 'Kompaktní sidebar', icon: '📦', category: 'Profesionální' },
  { id: 'letter-pro-cards', name: 'Pro Cards', desc: 'Kartičkové sekce', icon: '🃏', category: 'Profesionální' },
  { id: 'letter-pro-dots', name: 'Pro Dots', desc: 'Tečkové nadpisy', icon: '⚫', category: 'Profesionální' },
  { id: 'letter-pro-slim', name: 'Pro Slim', desc: 'Štíhlá hlavička', icon: '📏', category: 'Profesionální' },
  { id: 'letter-pro-rounded', name: 'Pro Rounded', desc: 'Zaoblené prvky', icon: '🔲', category: 'Profesionální' },
  { id: 'letter-pro-square', name: 'Pro Square', desc: 'Čtvercová fotka', icon: '⬛', category: 'Profesionální' },
  // Right Panel
  { id: 'letter-right-classic', name: 'Right Classic', desc: 'Pravý svetlý', icon: '▶️', category: 'Pravý panel' },
  { id: 'letter-right-dark', name: 'Right Dark', desc: 'Pravý barevný', icon: '◀️', category: 'Pravý panel' },
  { id: 'letter-right-serif', name: 'Right Serif', desc: 'Pravý patkový', icon: '📓', category: 'Pravý panel' },
  { id: 'letter-right-gradient', name: 'Right Gradient', desc: 'Pravý gradient', icon: '🎆', category: 'Pravý panel' },
  { id: 'letter-right-modern', name: 'Right Modern', desc: 'Pravý moderní', icon: '🔷', category: 'Pravý panel' },
  { id: 'letter-right-compact', name: 'Right Compact', desc: 'Pravý kompakt', icon: '📎', category: 'Pravý panel' },
  { id: 'letter-right-cards', name: 'Right Cards', desc: 'Pravý kartičky', icon: '🎴', category: 'Pravý panel' },
  { id: 'letter-right-dots', name: 'Right Dots', desc: 'Pravý tečky', icon: '🔘', category: 'Pravý panel' },
  { id: 'letter-right-accent', name: 'Right Accent', desc: 'Pravý barevný', icon: '🎯', category: 'Pravý panel' },
  { id: 'letter-right-slim', name: 'Right Slim', desc: 'Pravý štíhlý', icon: '📏', category: 'Pravý panel' },
  // Top Header
  { id: 'letter-top-dark', name: 'Top Dark', desc: 'Tmavá hlavička', icon: '⬆️', category: 'Horní hlavička' },
  { id: 'letter-top-gradient', name: 'Top Gradient', desc: 'Gradient hlavička', icon: '🌅', category: 'Horní hlavička' },
  { id: 'letter-top-accent', name: 'Top Accent', desc: 'Barevná hlavička', icon: '🎯', category: 'Horní hlavička' },
  { id: 'letter-top-serif', name: 'Top Serif', desc: 'Patkový horní', icon: '📜', category: 'Horní hlavička' },
  { id: 'letter-top-modern', name: 'Top Modern', desc: 'Moderní horní', icon: '🔺', category: 'Horní hlavička' },
  { id: 'letter-top-compact', name: 'Top Compact', desc: 'Kompaktní horní', icon: '📌', category: 'Horní hlavička' },
  { id: 'letter-top-cards', name: 'Top Cards', desc: 'Kartičky horní', icon: '🎪', category: 'Horní hlavička' },
  { id: 'letter-top-light', name: 'Top Light', desc: 'Světlá hlavička', icon: '💡', category: 'Horní hlavička' },
  { id: 'letter-top-slim', name: 'Top Slim', desc: 'Štíhlá hlavička', icon: '➖', category: 'Horní hlavička' },
  { id: 'letter-top-dots', name: 'Top Dots', desc: 'Tečkový horní', icon: '🔵', category: 'Horní hlavička' },
  // Twin Column
  { id: 'letter-twin-classic', name: 'Twin Classic', desc: 'Klasické dva sloupce', icon: '📰', category: 'Dva sloupce' },
  { id: 'letter-twin-dark', name: 'Twin Dark', desc: 'Tmavé dva sloupce', icon: '🌑', category: 'Dva sloupce' },
  { id: 'letter-twin-serif', name: 'Twin Serif', desc: 'Patkové dva sloupce', icon: '📖', category: 'Dva sloupce' },
  { id: 'letter-twin-modern', name: 'Twin Modern', desc: 'Moderní dva sloupce', icon: '🔷', category: 'Dva sloupce' },
  { id: 'letter-twin-compact', name: 'Twin Compact', desc: 'Kompaktní dva sloupce', icon: '📦', category: 'Dva sloupce' },
  { id: 'letter-twin-cards', name: 'Twin Cards', desc: 'Kartičkové dva sloupce', icon: '🃏', category: 'Dva sloupce' },
  { id: 'letter-twin-accent', name: 'Twin Accent', desc: 'Barevné dva sloupce', icon: '🎯', category: 'Dva sloupce' },
  { id: 'letter-twin-dots', name: 'Twin Dots', desc: 'Tečkové dva sloupce', icon: '⚫', category: 'Dva sloupce' },
  { id: 'letter-twin-gradient', name: 'Twin Gradient', desc: 'Gradientové dva sloupce', icon: '🌈', category: 'Dva sloupce' },
  { id: 'letter-twin-slim', name: 'Twin Slim', desc: 'Štíhlé dva sloupce', icon: '📏', category: 'Dva sloupce' },
  // Single Column
  { id: 'letter-single-classic', name: 'Single Classic', desc: 'Klasický jednosloupec', icon: '📄', category: 'Jednosloupec' },
  { id: 'letter-single-dark', name: 'Single Dark', desc: 'Tmavý jednosloupec', icon: '🌙', category: 'Jednosloupec' },
  { id: 'letter-single-serif', name: 'Single Serif', desc: 'Patkový jednosloupec', icon: '📜', category: 'Jednosloupec' },
  { id: 'letter-single-modern', name: 'Single Modern', desc: 'Moderní jednosloupec', icon: '✨', category: 'Jednosloupec' },
  { id: 'letter-single-compact', name: 'Single Compact', desc: 'Kompaktní jednosloupec', icon: '📌', category: 'Jednosloupec' },
  { id: 'letter-single-cards', name: 'Single Cards', desc: 'Kartičkový jednosloupec', icon: '🎴', category: 'Jednosloupec' },
  { id: 'letter-single-gradient', name: 'Single Gradient', desc: 'Gradientový jednosloupec', icon: '🌅', category: 'Jednosloupec' },
  { id: 'letter-single-accent', name: 'Single Accent', desc: 'Barevný jednosloupec', icon: '🎨', category: 'Jednosloupec' },
  { id: 'letter-single-dots', name: 'Single Dots', desc: 'Tečkový jednosloupec', icon: '🔘', category: 'Jednosloupec' },
  { id: 'letter-single-slim', name: 'Single Slim', desc: 'Štíhlý jednosloupec', icon: '➖', category: 'Jednosloupec' },
  // Tmavý motiv
  { id: 'letter-dark-sidebar-pro', name: 'Dark Sidebar Pro', desc: 'Tmavý sidebar profesionální', icon: '🌑', category: 'Tmavý motiv' },
  { id: 'letter-dark-right-pro', name: 'Dark Right Pro', desc: 'Tmavý pravý panel', icon: '🌒', category: 'Tmavý motiv' },
  { id: 'letter-dark-top-pro', name: 'Dark Top Pro', desc: 'Tmavá horní hlavička', icon: '🌓', category: 'Tmavý motiv' },
  { id: 'letter-dark-twin-pro', name: 'Dark Twin Pro', desc: 'Tmavé dva sloupce', icon: '🌔', category: 'Tmavý motiv' },
  { id: 'letter-dark-single-pro', name: 'Dark Single Pro', desc: 'Tmavý jednosloupec', icon: '🌕', category: 'Tmavý motiv' },
  { id: 'letter-dark-serif-pro', name: 'Dark Serif Pro', desc: 'Tmavý patkový', icon: '🌖', category: 'Tmavý motiv' },
  { id: 'letter-dark-modern-pro', name: 'Dark Modern Pro', desc: 'Tmavý moderní', icon: '🌗', category: 'Tmavý motiv' },
  { id: 'letter-dark-compact-pro', name: 'Dark Compact Pro', desc: 'Tmavý kompaktní', icon: '🌘', category: 'Tmavý motiv' },
  { id: 'letter-dark-cards-pro', name: 'Dark Cards Pro', desc: 'Tmavé kartičky', icon: '🃏', category: 'Tmavý motiv' },
  { id: 'letter-dark-gradient-pro', name: 'Dark Gradient Pro', desc: 'Tmavý gradient', icon: '🌊', category: 'Tmavý motiv' },
  // Patkové
  { id: 'letter-serif-classic', name: 'Serif Classic', desc: 'Klasický patkový', icon: '📜', category: 'Patkové' },
  { id: 'letter-serif-top', name: 'Serif Top', desc: 'Patkový horní', icon: '📖', category: 'Patkové' },
  { id: 'letter-serif-single', name: 'Serif Single', desc: 'Patkový jednosloupec', icon: '📕', category: 'Patkové' },
  { id: 'letter-serif-dark', name: 'Serif Dark', desc: 'Patkový tmavý', icon: '📗', category: 'Patkové' },
  { id: 'letter-serif-twin', name: 'Serif Twin', desc: 'Patkové dva sloupce', icon: '📘', category: 'Patkové' },
  { id: 'letter-serif-sidebar', name: 'Serif Sidebar', desc: 'Patkový sidebar', icon: '📙', category: 'Patkové' },
  { id: 'letter-serif-right', name: 'Serif Right', desc: 'Patkový pravý', icon: '📓', category: 'Patkové' },
  { id: 'letter-serif-accent', name: 'Serif Accent', desc: 'Patkový barevný', icon: '📔', category: 'Patkové' },
  { id: 'letter-serif-compact', name: 'Serif Compact', desc: 'Patkový kompaktní', icon: '📒', category: 'Patkové' },
  { id: 'letter-serif-modern', name: 'Serif Modern', desc: 'Patkový moderní', icon: '📚', category: 'Patkové' },
  // Moderní
  { id: 'letter-modern-square', name: 'Modern Square', desc: 'Moderní čtvercový', icon: '⬛', category: 'Moderní' },
  { id: 'letter-modern-rounded', name: 'Modern Rounded', desc: 'Moderní zaoblený', icon: '🔵', category: 'Moderní' },
  { id: 'letter-modern-cards', name: 'Modern Cards', desc: 'Moderní kartičky', icon: '🎴', category: 'Moderní' },
  { id: 'letter-modern-dots', name: 'Modern Dots', desc: 'Moderní tečky', icon: '🔘', category: 'Moderní' },
  { id: 'letter-modern-accent', name: 'Modern Accent', desc: 'Moderní barevný', icon: '🎯', category: 'Moderní' },
  { id: 'letter-modern-gradient', name: 'Modern Gradient', desc: 'Moderní gradient', icon: '🌈', category: 'Moderní' },
  { id: 'letter-modern-compact', name: 'Modern Compact', desc: 'Moderní kompaktní', icon: '📦', category: 'Moderní' },
  { id: 'letter-modern-slim', name: 'Modern Slim', desc: 'Moderní štíhlý', icon: '📏', category: 'Moderní' },
  { id: 'letter-modern-twin', name: 'Modern Twin', desc: 'Moderní dva sloupce', icon: '🔷', category: 'Moderní' },
  { id: 'letter-modern-dark', name: 'Modern Dark', desc: 'Moderní tmavý', icon: '🖤', category: 'Moderní' },
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

function LetterClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
          <div>
          <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>{data.senderName}</div>
          <div style={{ fontSize: '9pt', color: hexToRgba(c, 0.9), marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' as const }}>Bewerbungsschreiben</div>
          </div>
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

function LetterFormal({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, padding: '52px 56px' }}>
      {/* Sender */}
      <div style={{ borderBottom: `2px solid ${c}`, paddingBottom: '16px', marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
        <div>
        <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a', fontFamily: SERIF }}>{data.senderName}</div>
        <div style={{ fontSize: '9pt', color: '#666', marginTop: '6px', fontFamily: SANS }}>
          {data.senderAddress} &middot; {data.senderPhone} &middot; {data.senderEmail}
        </div>
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

function LetterSwiss({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  const red = c || '#E8302A'
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Red top line */}
      <div style={{ height: '4px', background: red }} />
      <div style={{ padding: '40px 52px' }}>
        {/* Sender top right */}
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#666', lineHeight: '1.6', marginBottom: '28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
          <div>
          <div style={{ fontWeight: 700, fontSize: '10pt', color: '#1a1a1a' }}>{data.senderName}</div>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} &middot; {data.senderEmail}</div>
          </div>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
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

function LetterElegant({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Left sidebar */}
      <div style={{ width: '68px', background: '#f5f5f5', borderRight: `3px solid ${c}`, padding: '40px 14px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '24px' }}>
        {photo && <img src={photo} style={{width:'46px',height:'46px',borderRadius:'50%',objectFit:'cover' as const}} />}
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

function LetterModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Colored header */}
      <div style={{ background: c, padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'3px solid rgba(255,255,255,0.3)'}} />}
          <div>
          <div style={{ fontSize: '22pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
          <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>
            {data.senderAddress}
          </div>
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

function LetterMinimal({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#444', background: '#fff', boxSizing: 'border-box' as const, padding: '60px 64px' }}>
      {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
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

function LetterBold({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Large name header */}
      <div style={{ padding: '44px 48px 28px', borderBottom: `4px solid transparent`, backgroundImage: `linear-gradient(#fff,#fff), linear-gradient(90deg, ${c}, ${darkenHex(c, 40)})`, backgroundClip: 'padding-box, border-box', backgroundOrigin: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
          <div style={{ fontSize: '28pt', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1px', lineHeight: '1.1' }}>{data.senderName}</div>
        </div>
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

function LetterClean({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fafbfc', boxSizing: 'border-box' as const }}>
      {/* Header card */}
      <div style={{ margin: '24px 32px 0', background: '#fff', borderRadius: '12px', padding: '28px 36px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
          <div>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
          </div>
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

function LetterExecutive({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Dark header */}
      <div style={{ background: '#0d0d1a', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'2px solid rgba(255,255,255,0.2)'}} />}
          <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{data.senderName}</div>
          <div style={{ width: '40px', height: '3px', background: c, marginTop: '8px', borderRadius: '2px' }} />
          </div>
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

function LetterCorporate({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Two-column header */}
      <div style={{ display: 'flex', borderBottom: `3px solid ${c}` }}>
        <div style={{ flex: 1, padding: '32px 40px', background: '#f8f9fa', display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
          <div>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8.5pt', color: '#888', marginTop: '6px', lineHeight: '1.6' }}>
            <div>{data.senderAddress}</div>
            <div>{data.senderPhone}</div>
          </div>
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

function LetterBusiness({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Top accent bar */}
      <div style={{ height: '6px', background: `linear-gradient(90deg, ${c}, ${darkenHex(c, 30)})` }} />
      <div style={{ padding: '36px 48px' }}>
        {/* Sender */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
            <div>
              <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
              <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
            </div>
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

function LetterPremium({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, position: 'relative' as const }}>
      {/* Subtle pattern overlay */}
      <div style={{ position: 'absolute' as const, top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle at top right, ${hexToRgba(c, 0.04)} 0%, transparent 70%)`, pointerEvents: 'none' as const }} />
      <div style={{ padding: '48px 52px', position: 'relative' as const }}>
        {/* Sender */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
            <div style={{ fontSize: '20pt', fontWeight: 300, color: '#1a1a1a', letterSpacing: '1px' }}>{data.senderName}</div>
          </div>
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

function LetterCreative({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Colored sidebar */}
      <div style={{ width: '200px', background: c, padding: '40px 24px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.3)'}} />}
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

function LetterAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Large accent block */}
      <div style={{ background: c, padding: '48px 48px 36px', position: 'relative' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'3px solid rgba(255,255,255,0.3)'}} />}
          <div style={{ fontSize: '24pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
        </div>
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

function LetterSidebar({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Full left sidebar */}
      <div style={{ width: '220px', background: '#1a1a2e', padding: '44px 24px', color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column' as const }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'2px solid rgba(255,255,255,0.2)'}} />}
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

function LetterArtistic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
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
        <div style={{ marginTop: '-52px', marginBottom: '28px', position: 'relative' as const, display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'3px solid rgba(255,255,255,0.5)'}} />}
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

function LetterDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#e0e0e0', background: '#1a1a2e', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '44px 48px' }}>
        {/* Sender */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'2px solid rgba(255,255,255,0.2)'}} />}
            <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          </div>
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

function LetterNight({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Dark header */}
      <div style={{ background: '#0d0d1a', padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'2px solid rgba(255,255,255,0.2)'}} />}
          <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: c, marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Motivationsschreiben</div>
          </div>
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

function LetterShadow({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f0f0', boxSizing: 'border-box' as const, padding: '28px' }}>
      {/* Main card with shadow */}
      <div style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', padding: '44px 48px', minHeight: 'calc(297mm - 56px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '20px', borderBottom: `2px solid ${c}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const}} />}
            <div>
              <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
              <div style={{ fontSize: '8.5pt', color: '#999', marginTop: '4px' }}>{data.senderAddress}</div>
            </div>
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

function LetterContrast({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Black + accent header */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, background: '#0a0a0a', padding: '36px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,border:'2px solid rgba(255,255,255,0.2)'}} />}
            <div style={{ fontSize: '20pt', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{data.senderName}</div>
          </div>
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
   PRO SERIES TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterProClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Left sidebar */}
      <div style={{ width: '210px', background: '#2c3e50', padding: '40px 24px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.2)'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: c, marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', color: c }}>Adresse</div>
          <div>{data.senderAddress}</div>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '16px', marginBottom: '6px', color: c }}>Kontakt</div>
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

function LetterProLight({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      {/* Light sidebar */}
      <div style={{ width: '210px', background: '#f7f8fa', borderRight: `3px solid ${c}`, padding: '40px 24px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: c, marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#666' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', color: c }}>Adresse</div>
          <div>{data.senderAddress}</div>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '16px', marginBottom: '6px', color: c }}>Kontakt</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
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

function LetterProSerif({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '210px', background: '#f5f0eb', borderRight: `3px solid ${c}`, padding: '40px 24px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, color: '#2c2c2c', marginBottom: '8px', lineHeight: '1.3', fontFamily: SERIF }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '1px', background: c, marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#666', fontFamily: SANS }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '40px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
      </div>
    </div>
  )
}

function LetterProGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '210px', background: `linear-gradient(180deg, ${c}, ${darkenHex(c, 40)})`, padding: '40px 24px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.3)'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
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

function LetterProCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '180px', background: '#1e293b', padding: '32px 20px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'60px',height:'60px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'10px'}} />}
        <div style={{ fontSize: '13pt', fontWeight: 700, marginBottom: '6px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '24px', height: '2px', background: c, marginBottom: '16px' }} />
        <div style={{ fontSize: '7.5pt', lineHeight: '1.7', color: 'rgba(255,255,255,0.7)' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
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

function LetterProCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f2f5', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '210px', padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center' as const }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'10px'}} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a', lineHeight: '1.3' }}>{data.senderName}</div>
          <div style={{ width: '30px', height: '2px', background: c, margin: '10px auto' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: '8pt', color: '#666', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', color: c, marginBottom: '6px' }}>Kontakt</div>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 32px 32px 12px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
    </div>
  )
}

function LetterProDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '210px', background: '#fafafa', borderRight: '1px solid #eee', padding: '40px 24px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.5) }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.2) }} />
        </div>
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#666' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
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

function LetterProSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      {/* Slim header bar */}
      <div style={{ background: '#f8f9fa', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{width:'50px',height:'50px',borderRadius:'50%',objectFit:'cover' as const}} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '8pt', color: '#888', textAlign: 'right' as const, lineHeight: '1.6' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} &middot; {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '36px 48px' }}>
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

function LetterProRounded({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f5f6f8', boxSizing: 'border-box' as const, padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', minHeight: 'calc(297mm - 48px)' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '200px', background: c, borderRadius: '0 0 20px 0', padding: '36px 22px', color: '#fff', flexShrink: 0 }}>
            {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.3)'}} />}
            <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
            <div style={{ width: '28px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '18px' }} />
            <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
              <div>{data.senderAddress}</div>
              <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
              <div>{data.senderEmail}</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: '36px 32px' }}>
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
      </div>
    </div>
  )
}

function LetterProSquare({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '210px', background: '#1a1a2e', padding: '40px 24px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'80px',height:'80px',borderRadius:'8px',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '3px', background: c, marginBottom: '20px', borderRadius: '2px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: '8px', color: c }}>Kontaktdaten</div>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
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

/* ═══════════════════════════════════════════════════════════
   RIGHT PANEL TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterRightClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: '#f7f8fa', borderLeft: `3px solid ${c}`, padding: '40px 22px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '28px', height: '2px', background: c, marginBottom: '18px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#666' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: '#1a1a2e', padding: '40px 22px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'2px solid rgba(255,255,255,0.2)'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '28px', height: '3px', background: c, marginBottom: '18px', borderRadius: '2px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', color: c }}>Kontakt</div>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightSerif({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ flex: 1, padding: '40px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
      </div>
      <div style={{ width: '200px', background: '#faf8f5', borderLeft: `2px solid ${c}`, padding: '40px 22px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, color: '#2c2c2c', marginBottom: '8px', lineHeight: '1.3', fontFamily: SERIF }}>{data.senderName}</div>
        <div style={{ width: '24px', height: '1px', background: c, marginBottom: '18px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#888', fontFamily: SANS }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: `linear-gradient(180deg, ${c}, ${darkenHex(c, 50)})`, padding: '40px 22px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.3)'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '28px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '18px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: '#fff', borderLeft: `4px solid ${c}`, padding: '40px 22px', flexShrink: 0, boxShadow: '-4px 0 16px rgba(0,0,0,0.04)' }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.3', letterSpacing: '-0.3px' }}>{data.senderName}</div>
        <div style={{ width: '28px', height: '3px', background: c, marginBottom: '18px', borderRadius: '2px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#999' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ flex: 1, padding: '36px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
            <div>{data.recipientAddress}</div>
          </div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
      </div>
      <div style={{ width: '170px', background: '#f0f2f5', borderLeft: `2px solid ${c}`, padding: '32px 18px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'60px',height:'60px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'10px'}} />}
        <div style={{ fontSize: '12pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '20px', height: '2px', background: c, marginBottom: '14px' }} />
        <div style={{ fontSize: '7.5pt', lineHeight: '1.7', color: '#777' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f5f6f8', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ flex: 1, padding: '32px 28px 32px 32px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
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
      <div style={{ width: '200px', padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '22px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' as const, marginBottom: '14px' }}>
          {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'10px'}} />}
          <div style={{ fontSize: '13pt', fontWeight: 700, color: '#1a1a1a', lineHeight: '1.3' }}>{data.senderName}</div>
          <div style={{ width: '28px', height: '2px', background: c, margin: '8px auto' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: '8pt', color: '#666', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: '#fafafa', borderLeft: '1px solid #eee', padding: '40px 22px', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '18px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.5) }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.2) }} />
        </div>
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#666' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '8px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '200px', background: c, padding: '40px 22px', color: '#fff', flexShrink: 0 }}>
        {photo && <img src={photo} style={{width:'70px',height:'70px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'12px',border:'3px solid rgba(255,255,255,0.3)'}} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '28px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '18px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Adresse</div>
          <div>{data.senderAddress}</div>
          <div style={{ fontWeight: 600, fontSize: '7pt', textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '14px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Kontakt</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

function LetterRightSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
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
      <div style={{ width: '160px', borderLeft: `3px solid ${c}`, padding: '40px 18px', flexShrink: 0, background: '#fdfdfd' }}>
        {photo && <img src={photo} style={{width:'56px',height:'56px',borderRadius:'50%',objectFit:'cover' as const,marginBottom:'10px'}} />}
        <div style={{ fontSize: '12pt', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px', lineHeight: '1.3' }}>{data.senderName}</div>
        <div style={{ width: '20px', height: '2px', background: c, marginBottom: '14px' }} />
        <div style={{ fontSize: '7.5pt', lineHeight: '1.7', color: '#888' }}>
          <div>{data.senderAddress}</div>
          <div style={{ marginTop: '6px' }}>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TOP HEADER TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterTopDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#1a1a1a', padding: '36px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: c, marginTop: '4px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8pt', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ height: '3px', background: c }} />
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: `linear-gradient(135deg, ${c}, ${darkenHex(c, 60)})`, padding: '38px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const, border: '2px solid rgba(255,255,255,0.5)' }} />}
          <div>
            <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: c, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '8px', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '19pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8pt', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#666' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopSerif({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ borderBottom: `3px solid ${c}`, padding: '36px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '62px', height: '62px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 700, fontFamily: SERIF, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '8.5pt', color: '#888', fontFamily: SANS, marginTop: '4px', letterSpacing: '1px', textTransform: 'uppercase' as const }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8.5pt', color: '#666', lineHeight: '1.7', fontFamily: SANS }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '36px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '10pt', color: '#666' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
      </div>
    </div>
  )
}

function LetterTopModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f8f8f8', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#fff', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {photo && <img src={photo} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '17pt', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.3px' }}>{data.senderName}</div>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '8pt', color: '#888' }}>
          <span>{data.senderPhone}</span>
          <span>{data.senderEmail}</span>
        </div>
      </div>
      <div style={{ padding: '32px 48px' }}>
        <div style={{ fontSize: '8pt', color: '#aaa', marginBottom: '6px' }}>{data.senderAddress}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#2d2d2d', padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '13pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '7.5pt', color: 'rgba(255,255,255,0.7)' }}>
          <span>{data.senderAddress}</span>
          <span>{data.senderPhone}</span>
          <span>{data.senderEmail}</span>
        </div>
      </div>
      <div style={{ height: '2px', background: c }} />
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f0f0', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#fff', margin: '0', padding: '32px 48px', borderBottom: `3px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ background: hexToRgba(c, 0.1), padding: '4px 12px', borderRadius: '6px', fontSize: '7.5pt', color: c }}>{data.senderAddress}</span>
          <span style={{ background: hexToRgba(c, 0.1), padding: '4px 12px', borderRadius: '6px', fontSize: '7.5pt', color: c }}>{data.senderPhone}</span>
          <span style={{ background: hexToRgba(c, 0.1), padding: '4px 12px', borderRadius: '6px', fontSize: '7.5pt', color: c }}>{data.senderEmail}</span>
        </div>
      </div>
      <div style={{ background: '#fff', margin: '16px 20px', borderRadius: '12px', padding: '32px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopLight({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: hexToRgba(c, 0.08), padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${hexToRgba(c, 0.2)}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '8.5pt', color: c, marginTop: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8pt', color: '#666', lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '36px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '13pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ width: '3px', height: '20px', background: c, marginLeft: '6px' }} />
        </div>
        <div style={{ display: 'flex', gap: '18px', fontSize: '7.5pt', color: '#999' }}>
          <span>{data.senderAddress}</span>
          <span>{data.senderPhone}</span>
          <span>{data.senderEmail}</span>
        </div>
      </div>
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTopDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '32px 48px', borderBottom: `3px dotted ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          {photo && <img src={photo} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px dotted ${c}` }} />}
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '7.5pt', color: '#666' }}>● {data.senderAddress}</span>
              <span style={{ fontSize: '7.5pt', color: '#666' }}>● {data.senderPhone}</span>
              <span style={{ fontSize: '7.5pt', color: '#666' }}>● {data.senderEmail}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TWIN COLUMN TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterTwinClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', padding: '40px 28px 40px 44px', borderRight: `2px solid ${hexToRgba(c, 0.15)}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div>
            <div style={{ fontSize: '15pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '7.5pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '1px', marginTop: '2px' }}>Absender</div>
          </div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#666', marginBottom: '24px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ width: '40px', height: '2px', background: c, marginBottom: '24px' }} />
        <div style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '8px' }}>
          <div style={{ fontWeight: 600, color: '#333' }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '9pt', color: '#999', marginTop: '16px' }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '40px 44px 40px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', background: '#1c1c1c', padding: '40px 28px 40px 44px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
        </div>
        <div style={{ width: '30px', height: '2px', background: c, marginBottom: '20px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.6)', marginBottom: '28px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{data.recipientName}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.4)', marginTop: '14px' }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '40px 44px 40px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinSerif({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', padding: '44px 28px 44px 48px', borderRight: `1px solid #ddd` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '17pt', fontWeight: 700, fontFamily: SERIF, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ borderTop: `2px solid ${c}`, paddingTop: '14px', fontSize: '8.5pt', lineHeight: '1.8', color: '#888', fontFamily: SANS, marginBottom: '28px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '9pt', color: '#aaa', marginTop: '18px', fontStyle: 'italic' as const }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '44px 48px 44px 28px' }}>
        <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
      </div>
    </div>
  )
}

function LetterTwinModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fafafa', boxSizing: 'border-box' as const }}>
      <div style={{ height: '4px', background: c }} />
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%', padding: '36px 24px 36px 44px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            {photo && <img src={photo} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' as const }} />}
            <div>
              <div style={{ fontSize: '15pt', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.3px' }}>{data.senderName}</div>
              <div style={{ fontSize: '7pt', color: '#bbb', textTransform: 'uppercase' as const, letterSpacing: '2px', marginTop: '2px' }}>Bewerbung</div>
            </div>
          </div>
          <div style={{ fontSize: '8pt', lineHeight: '1.7', color: '#999', marginBottom: '20px' }}>
            {data.senderAddress} · {data.senderPhone} · {data.senderEmail}
          </div>
          <div style={{ padding: '12px 14px', background: hexToRgba(c, 0.06), borderRadius: '8px', fontSize: '9pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 600, color: '#333' }}>{data.recipientName}</div>
            <div style={{ color: '#666' }}>{data.recipientAddress}</div>
            <div style={{ color: '#999', marginTop: '8px', fontSize: '8.5pt' }}>{data.date}</div>
          </div>
        </div>
        <div style={{ width: '50%', padding: '36px 44px 36px 24px', background: '#fff', borderLeft: `1px solid #eee` }}>
          <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
        </div>
      </div>
    </div>
  )
}

function LetterTwinCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '9.5pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '48%', padding: '32px 20px 32px 40px', borderRight: `3px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          {photo && <img src={photo} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '13pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '7.5pt', lineHeight: '1.7', color: '#888', marginBottom: '20px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#aaa', marginTop: '12px' }}>{data.date}</div>
      </div>
      <div style={{ width: '52%', padding: '32px 40px 32px 20px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
      </div>
    </div>
  )
}

function LetterTwinCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#efefef', boxSizing: 'border-box' as const, padding: '24px', display: 'flex', gap: '16px' }}>
      <div style={{ width: '48%', background: '#fff', borderRadius: '14px', padding: '32px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          {photo && <img src={photo} style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover' as const }} />}
          <div>
            <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '7pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '1.5px' }}>Absender</div>
          </div>
        </div>
        <div style={{ background: hexToRgba(c, 0.08), borderRadius: '8px', padding: '12px 14px', fontSize: '8pt', lineHeight: '1.7', color: '#666', marginBottom: '20px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#aaa', marginTop: '14px' }}>{data.date}</div>
      </div>
      <div style={{ width: '52%', background: '#fff', borderRadius: '14px', padding: '32px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', background: hexToRgba(c, 0.05), padding: '40px 28px 40px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '15pt', fontWeight: 700, color: c }}>{data.senderName}</div>
            <div style={{ fontSize: '7pt', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginTop: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ borderLeft: `3px solid ${c}`, paddingLeft: '14px', fontSize: '8.5pt', lineHeight: '1.8', color: '#666', marginBottom: '24px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#aaa', marginTop: '14px' }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '40px 44px 40px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', padding: '40px 28px 40px 44px', borderRight: `3px dotted ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px dotted ${c}` }} />}
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#666', marginBottom: '24px' }}>
          <div>● {data.senderAddress}</div>
          <div>● {data.senderPhone}</div>
          <div>● {data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#aaa', marginTop: '14px' }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '40px 44px 40px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '50%', background: `linear-gradient(180deg, ${hexToRgba(c, 0.1)}, ${hexToRgba(c, 0.03)})`, padding: '40px 28px 40px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div>
            <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ width: '32px', height: '2px', background: `linear-gradient(90deg, ${c}, transparent)`, marginTop: '6px' }} />
          </div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#666', marginBottom: '24px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#666' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8.5pt', color: '#aaa', marginTop: '14px' }}>{data.date}</div>
      </div>
      <div style={{ width: '50%', padding: '40px 44px 40px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterTwinSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, display: 'flex' }}>
      <div style={{ width: '46%', padding: '36px 18px 36px 40px', borderRight: `1px solid #e0e0e0` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          {photo && <img src={photo} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '13pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ width: '24px', height: '2px', background: c, marginBottom: '14px' }} />
        <div style={{ fontSize: '7.5pt', lineHeight: '1.7', color: '#999', marginBottom: '20px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.6' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div style={{ color: '#777' }}>{data.recipientAddress}</div>
        </div>
        <div style={{ fontSize: '8pt', color: '#bbb', marginTop: '12px' }}>{data.date}</div>
      </div>
      <div style={{ width: '54%', padding: '36px 40px 36px 18px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SINGLE COLUMN TEMPLATES
   ═══════════════════════════════════════════════════════════ */

function LetterSingleClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const }} />}
        <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
      </div>
      <div style={{ fontSize: '8.5pt', color: '#666', lineHeight: '1.6', marginBottom: '8px' }}>
        {data.senderAddress} · {data.senderPhone} · {data.senderEmail}
      </div>
      <div style={{ height: '2px', background: c, marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

function LetterSingleDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#e0e0e0', background: '#1a1a1a', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '7.5pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '2px', marginTop: '2px' }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6', marginBottom: '8px' }}>
        {data.senderAddress} · {data.senderPhone} · {data.senderEmail}
      </div>
      <div style={{ height: '2px', background: c, marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{data.recipientName}</div><div style={{ color: 'rgba(255,255,255,0.5)' }}>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.4)' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#e0e0e0" lineHeight="1.65" />
    </div>
  )
}

function LetterSingleSerif({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#222', background: '#fff', boxSizing: 'border-box' as const, padding: '52px 60px' }}>
      <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
        {photo && <img src={photo} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' as const, marginBottom: '10px' }} />}
        <div style={{ fontSize: '22pt', fontWeight: 700, fontFamily: SERIF, color: '#1a1a1a' }}>{data.senderName}</div>
        <div style={{ fontSize: '8.5pt', color: '#888', fontFamily: SANS, marginTop: '6px' }}>
          {data.senderAddress} · {data.senderPhone} · {data.senderEmail}
        </div>
      </div>
      <div style={{ height: '1px', background: c, marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '10pt', color: '#888', fontStyle: 'italic' as const }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#222" lineHeight="1.7" />
    </div>
  )
}

function LetterSingleModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f8f8f8', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#fff', padding: '36px 52px', borderBottom: `4px solid ${c}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {photo && <img src={photo} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' as const }} />}
            <div style={{ fontSize: '17pt', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.3px' }}>{data.senderName}</div>
          </div>
          <div style={{ fontSize: '8pt', color: '#999' }}>{data.senderPhone} · {data.senderEmail}</div>
        </div>
        <div style={{ fontSize: '8pt', color: '#bbb', marginTop: '6px' }}>{data.senderAddress}</div>
      </div>
      <div style={{ padding: '32px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterSingleCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '9.5pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '36px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {photo && <img src={photo} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '7.5pt', color: '#999' }}>{data.senderPhone} · {data.senderEmail}</div>
      </div>
      <div style={{ fontSize: '7.5pt', color: '#aaa', marginBottom: '6px' }}>{data.senderAddress}</div>
      <div style={{ height: '2px', background: c, marginBottom: '24px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
    </div>
  )
}

function LetterSingleCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f0f0', boxSizing: 'border-box' as const, padding: '28px 32px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '28px 32px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {photo && <img src={photo} style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover' as const }} />}
          <div>
            <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: '#999', marginTop: '2px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '32px 36px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ borderLeft: `3px solid ${c}`, paddingLeft: '14px', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9pt', color: '#aaa', marginTop: '8px' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterSingleGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: `linear-gradient(135deg, ${c}, ${darkenHex(c, 50)})`, padding: '36px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const, border: '2px solid rgba(255,255,255,0.4)' }} />}
          <div>
            <div style={{ fontSize: '19pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{data.senderAddress}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, fontSize: '8pt', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7' }}>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '36px 52px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterSingleAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: c }}>{data.senderName}</div>
          <div style={{ fontSize: '7.5pt', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginTop: '2px' }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ borderLeft: `3px solid ${c}`, paddingLeft: '16px', fontSize: '8.5pt', color: '#666', lineHeight: '1.7', marginBottom: '10px' }}>
        <span>{data.senderAddress}</span> · <span>{data.senderPhone}</span> · <span>{data.senderEmail}</span>
      </div>
      <div style={{ height: '1px', background: hexToRgba(c, 0.2), marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

function LetterSingleDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px dotted ${c}` }} />}
        <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '8pt', color: '#666', marginBottom: '10px' }}>
        <span>● {data.senderAddress}</span>
        <span>● {data.senderPhone}</span>
        <span>● {data.senderEmail}</span>
      </div>
      <div style={{ borderBottom: `3px dotted ${c}`, marginBottom: '32px', paddingBottom: '4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

function LetterSingleSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '40px 52px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {photo && <img src={photo} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ width: '3px', height: '18px', background: c, marginLeft: '4px' }} />
        </div>
        <div style={{ fontSize: '7.5pt', color: '#aaa' }}>{data.senderPhone} · {data.senderEmail}</div>
      </div>
      <div style={{ fontSize: '7.5pt', color: '#bbb', marginBottom: '6px' }}>{data.senderAddress}</div>
      <div style={{ height: '1px', background: '#e0e0e0', marginBottom: '28px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

/* ═══ DARK MODE SERIES (Tmavý motiv) ═══ */

function LetterDarkSidebarPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SANS, fontSize: '10pt' }}>
      <div style={{ width: '220px', background: '#1a1a2e', color: '#e0e0e0', padding: '48px 24px', boxSizing: 'border-box' as const }}>
        {photo && <img src={photo} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '20px', display: 'block' }} />}
        <div style={{ fontSize: '14pt', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{data.senderName}</div>
        <div style={{ width: '40px', height: '3px', background: c, marginBottom: '18px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8', color: '#aaa' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ marginTop: '28px', fontSize: '8pt', color: '#888' }}>{data.date}</div>
      </div>
      <div style={{ flex: 1, background: '#16213e', color: '#d0d0d0', padding: '48px 44px', boxSizing: 'border-box' as const }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '32px' }}>
          <div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#d0d0d0" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterDarkRightPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SANS, fontSize: '10pt' }}>
      <div style={{ flex: 1, background: '#0d1117', color: '#c9d1d9', padding: '48px 44px', boxSizing: 'border-box' as const }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '32px' }}>
          <div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#c9d1d9" lineHeight="1.65" />
      </div>
      <div style={{ width: '210px', background: '#161b22', color: '#8b949e', padding: '48px 22px', boxSizing: 'border-box' as const, borderLeft: `3px solid ${c}` }}>
        {photo && <img src={photo} style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '18px', display: 'block' }} />}
        <div style={{ fontSize: '13pt', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: c, marginBottom: '16px' }} />
        <div style={{ fontSize: '8pt', lineHeight: '1.8' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ marginTop: '24px', fontSize: '8pt', color: '#484f58' }}>{data.date}</div>
      </div>
    </div>
  )
}

function LetterDarkTopPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: '#121212', color: '#e0e0e0', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#1e1e2f', padding: '36px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: '#888', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ fontSize: '8pt', color: '#888', textAlign: 'right' as const, lineHeight: '1.8' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#666' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#d0d0d0" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterDarkTwinPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SANS, fontSize: '10pt' }}>
      <div style={{ width: '50%', background: '#1a1a2e', color: '#ccc', padding: '48px 32px', boxSizing: 'border-box' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          {photo && <img src={photo} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '15pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '7.5pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Bewerber/in</div>
          </div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#999', borderTop: `1px solid ${hexToRgba(c, 0.3)}`, paddingTop: '16px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
          <div style={{ marginTop: '12px', color: '#666' }}>{data.date}</div>
        </div>
      </div>
      <div style={{ width: '50%', background: '#0f3460', color: '#d0d8e8', padding: '48px 32px', boxSizing: 'border-box' as const }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '28px' }}>
          <div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#d0d8e8" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterDarkSinglePro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: '#0d1117', color: '#c9d1d9', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#484f58', marginTop: '2px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ height: '2px', background: `linear-gradient(to right, ${c}, transparent)`, marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#484f58' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#c9d1d9" lineHeight="1.65" />
    </div>
  )
}

function LetterDarkSerifPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', background: '#1a1a2e', color: '#d4c5a9', boxSizing: 'border-box' as const, padding: '52px 60px' }}>
      <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
        {photo && <img src={photo} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '12px' }} />}
        <div style={{ fontSize: '20pt', fontWeight: 700, color: '#fff', fontStyle: 'italic' as const }}>{data.senderName}</div>
        <div style={{ fontSize: '8pt', color: '#8a7e6b', letterSpacing: '3px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Bewerbungsschreiben</div>
      </div>
      <div style={{ height: '1px', background: hexToRgba(c, 0.4), marginBottom: '8px' }} />
      <div style={{ fontSize: '8pt', color: '#7a6f5e', textAlign: 'center' as const, marginBottom: '28px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#e8d8b8' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#7a6f5e' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#d4c5a9" lineHeight="1.7" />
    </div>
  )
}

function LetterDarkModernPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: '#121212', color: '#e0e0e0', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '32px 56px', background: `linear-gradient(135deg, ${c}, ${darkenHex(c, 60)})`, display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '12px', objectFit: 'cover' as const, border: '2px solid rgba(255,255,255,0.3)' }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 800, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#666' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#e0e0e0" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterDarkCompactPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '9.5pt', background: '#1e1e2f', color: '#bbb', boxSizing: 'border-box' as const, padding: '36px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '7.5pt', color: '#666' }}>{data.senderPhone} · {data.senderEmail}</div>
      </div>
      <div style={{ fontSize: '7.5pt', color: '#555', marginBottom: '4px' }}>{data.senderAddress}</div>
      <div style={{ height: '2px', background: c, marginBottom: '24px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#ddd' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9pt', color: '#555' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#bbb" lineHeight="1.6" />
    </div>
  )
}

function LetterDarkCardsPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: '#0d1117', color: '#c9d1d9', boxSizing: 'border-box' as const, padding: '44px 52px' }}>
      <div style={{ background: '#161b22', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px', border: `1px solid ${hexToRgba(c, 0.3)}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photo && <img src={photo} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#484f58', marginTop: '4px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ background: '#161b22', borderRadius: '12px', padding: '20px 28px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#484f58' }}>{data.date}</div>
      </div>
      <div style={{ background: '#161b22', borderRadius: '12px', padding: '28px 28px' }}>
        <LetterBody data={data} font={SANS} color="#c9d1d9" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterDarkGradientPro({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: `linear-gradient(180deg, #0d1117 0%, #1a1a2e 50%, ${darkenHex(c, 180)} 100%)`, color: '#d0d0d0', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        {photo && <img src={photo} style={{ width: '62px', height: '62px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '19pt', fontWeight: 700, color: '#fff' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ fontSize: '8pt', color: '#666', marginBottom: '10px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ height: '2px', background: `linear-gradient(to right, ${c}, transparent)`, marginBottom: '32px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#555' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#d0d0d0" lineHeight="1.65" />
    </div>
  )
}

/* ═══ SERIF SERIES (Patkové) ═══ */

function LetterSerifClassic({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#2c2c2c', background: '#fffef8', boxSizing: 'border-box' as const, padding: '52px 64px' }}>
      <div style={{ textAlign: 'center' as const, marginBottom: '28px' }}>
        {photo && <img src={photo} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '12px' }} />}
        <div style={{ fontSize: '22pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        <div style={{ fontSize: '8.5pt', color: '#888', letterSpacing: '3px', textTransform: 'uppercase' as const, marginTop: '4px' }}>Bewerbungsschreiben</div>
      </div>
      <div style={{ height: '2px', background: c, width: '60px', margin: '0 auto 10px' }} />
      <div style={{ fontSize: '8.5pt', color: '#999', textAlign: 'center' as const, marginBottom: '32px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#2c2c2c" lineHeight="1.75" />
    </div>
  )
}

function LetterSerifTop({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#2c2c2c', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: c, padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' as const, border: '2px solid rgba(255,255,255,0.5)' }} />}
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#fff', fontStyle: 'italic' as const }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.8)', textAlign: 'right' as const, lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '40px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#2c2c2c" lineHeight="1.75" />
      </div>
    </div>
  )
}

function LetterSerifSingle({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#333', background: '#faf8f2', boxSizing: 'border-box' as const, padding: '48px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 700, color: '#1a1a1a', fontStyle: 'italic' as const }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Bewerbung</div>
        </div>
      </div>
      <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '8px', borderBottom: `2px solid ${c}`, paddingBottom: '10px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
    </div>
  )
}

function LetterSerifDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#d4c5a9', background: '#2b2520', boxSizing: 'border-box' as const, padding: '52px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        {photo && <img src={photo} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 700, color: '#f0e6d2', fontStyle: 'italic' as const }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#8a7e6b', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ fontSize: '8.5pt', color: '#7a6f5e', marginBottom: '12px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ height: '1px', background: hexToRgba(c, 0.4), marginBottom: '28px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#f0e6d2' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '10pt', color: '#7a6f5e' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#d4c5a9" lineHeight="1.75" />
    </div>
  )
}

function LetterSerifTwin({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SERIF, fontSize: '10.5pt' }}>
      <div style={{ width: '50%', background: '#f5f0e8', color: '#4a3f35', padding: '48px 32px', boxSizing: 'border-box' as const }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
          {photo && <img src={photo} style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '10px' }} />}
          <div style={{ fontSize: '16pt', fontWeight: 700, fontStyle: 'italic' as const }}>{data.senderName}</div>
        </div>
        <div style={{ height: '1px', background: c, marginBottom: '16px' }} />
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#8a7e6b' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
          <div style={{ marginTop: '14px' }}>{data.date}</div>
        </div>
      </div>
      <div style={{ width: '50%', background: '#fffef8', color: '#333', padding: '48px 32px', boxSizing: 'border-box' as const, borderLeft: `3px solid ${c}` }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6', marginBottom: '28px' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
      </div>
    </div>
  )
}

function LetterSerifSidebar({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SERIF, fontSize: '10.5pt' }}>
      <div style={{ width: '210px', background: c, color: '#fff', padding: '48px 24px', boxSizing: 'border-box' as const }}>
        {photo && <img src={photo} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid rgba(255,255,255,0.5)', marginBottom: '20px', display: 'block' }} />}
        <div style={{ fontSize: '15pt', fontWeight: 700, fontStyle: 'italic' as const, marginBottom: '6px' }}>{data.senderName}</div>
        <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.5)', marginBottom: '18px' }} />
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ marginTop: '28px', fontSize: '8.5pt', color: 'rgba(255,255,255,0.6)' }}>{data.date}</div>
      </div>
      <div style={{ flex: 1, background: '#fffef8', color: '#333', padding: '48px 44px', boxSizing: 'border-box' as const }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6', marginBottom: '32px' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
      </div>
    </div>
  )
}

function LetterSerifRight({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SERIF, fontSize: '10.5pt' }}>
      <div style={{ flex: 1, background: '#fffef8', color: '#333', padding: '48px 44px', boxSizing: 'border-box' as const }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6', marginBottom: '32px' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
      </div>
      <div style={{ width: '200px', background: '#f5f0e8', color: '#4a3f35', padding: '48px 22px', boxSizing: 'border-box' as const, borderLeft: `3px solid ${c}` }}>
        {photo && <img src={photo} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}`, marginBottom: '16px', display: 'block' }} />}
        <div style={{ fontSize: '13pt', fontWeight: 700, fontStyle: 'italic' as const, marginBottom: '6px' }}>{data.senderName}</div>
        <div style={{ width: '30px', height: '2px', background: c, marginBottom: '16px' }} />
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#8a7e6b' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
        </div>
        <div style={{ marginTop: '24px', fontSize: '8.5pt', color: '#b0a898' }}>{data.date}</div>
      </div>
    </div>
  )
}

function LetterSerifAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '48px 60px', borderTop: `6px solid ${c}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '19pt', fontWeight: 700, color: c, fontStyle: 'italic' as const }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Bewerbung</div>
        </div>
      </div>
      <div style={{ fontSize: '8.5pt', color: '#999', marginBottom: '10px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ height: '2px', background: hexToRgba(c, 0.3), marginBottom: '28px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
    </div>
  )
}

function LetterSerifCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '36px 52px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '14pt', fontWeight: 700, fontStyle: 'italic' as const }}>{data.senderName}</div>
        </div>
        <div style={{ fontSize: '7.5pt', color: '#aaa' }}>{data.senderPhone} · {data.senderEmail}</div>
      </div>
      <div style={{ fontSize: '7.5pt', color: '#bbb', marginBottom: '4px' }}>{data.senderAddress}</div>
      <div style={{ height: '2px', background: c, marginBottom: '22px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.7" />
    </div>
  )
}

function LetterSerifModern({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SERIF, fontSize: '10.5pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: hexToRgba(c, 0.08), padding: '36px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '17pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '7.5pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ fontSize: '8pt', color: '#888', textAlign: 'right' as const, lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '40px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '10pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SERIF} color="#333" lineHeight="1.75" />
      </div>
    </div>
  )
}

/* ═══ MODERN SERIES (Moderní) ═══ */

function LetterModernSquare({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: c, padding: '36px 56px', display: 'flex', alignItems: 'center', gap: '18px' }}>
        {photo && <img src={photo} style={{ width: '64px', height: '64px', borderRadius: '4px', objectFit: 'cover' as const, border: '3px solid rgba(255,255,255,0.4)' }} />}
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', textTransform: 'uppercase' as const }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '6px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        <div style={{ height: '3px', background: c, width: '50px', marginBottom: '28px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernRounded({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f8f9fa', boxSizing: 'border-box' as const, padding: '44px 52px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photo && <img src={photo} style={{ width: '62px', height: '62px', borderRadius: '16px', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '17pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#aaa', marginTop: '2px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px 32px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '32px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernCards({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#f0f2f5', boxSizing: 'border-box' as const, padding: '44px 48px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px 28px', marginBottom: '16px', borderLeft: `4px solid ${c}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
        {photo && <img src={photo} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' as const }} />}
        <div>
          <div style={{ fontSize: '16pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: '#999', marginTop: '2px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 28px', marginBottom: '16px', borderLeft: `4px solid ${hexToRgba(c, 0.4)}`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px 28px' }}>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernDots({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '48px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
        {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px dotted ${c}` }} />}
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 800, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.5), display: 'inline-block' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hexToRgba(c, 0.2), display: 'inline-block' }} />
          </div>
        </div>
      </div>
      <div style={{ fontSize: '8.5pt', color: '#888', marginBottom: '8px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ borderBottom: `3px dotted ${c}`, marginBottom: '28px', paddingBottom: '4px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

function LetterModernAccent({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, borderLeft: `6px solid ${c}` }}>
      <div style={{ padding: '48px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '19pt', fontWeight: 800, color: c }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>Bewerbungsschreiben</div>
          </div>
        </div>
        <div style={{ background: hexToRgba(c, 0.08), borderRadius: '8px', padding: '12px 16px', fontSize: '8.5pt', color: '#666', marginBottom: '28px' }}>
          {data.senderAddress} · {data.senderPhone} · {data.senderEmail}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernGradient({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const }}>
      <div style={{ background: `linear-gradient(135deg, ${c}, ${darkenHex(c, 40)})`, padding: '36px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {photo && <img src={photo} style={{ width: '58px', height: '58px', borderRadius: '50%', objectFit: 'cover' as const, border: '3px solid rgba(255,255,255,0.4)' }} />}
          <div>
            <div style={{ fontSize: '19pt', fontWeight: 800, color: '#fff' }}>{data.senderName}</div>
            <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase' as const }}>Bewerbung</div>
          </div>
        </div>
        <div style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.8)', textAlign: 'right' as const, lineHeight: '1.7' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone} · {data.senderEmail}</div>
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernCompact({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '9.5pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '36px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '14pt', fontWeight: 800, color: '#1a1a1a' }}>{data.senderName}</div>
          <div style={{ width: '3px', height: '20px', background: c, borderRadius: '2px' }} />
        </div>
        <div style={{ fontSize: '7.5pt', color: '#aaa' }}>{data.senderPhone} · {data.senderEmail}</div>
      </div>
      <div style={{ fontSize: '7.5pt', color: '#bbb', marginBottom: '4px' }}>{data.senderAddress}</div>
      <div style={{ height: '3px', background: `linear-gradient(to right, ${c}, transparent)`, marginBottom: '22px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div style={{ fontSize: '9pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.6" />
    </div>
  )
}

function LetterModernSlim({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', color: '#333', background: '#fff', boxSizing: 'border-box' as const, padding: '40px 52px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {photo && <img src={photo} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' as const }} />}
          <div style={{ fontSize: '15pt', fontWeight: 700, color: '#1a1a1a' }}>{data.senderName}</div>
        </div>
        <div style={{ background: c, color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '7.5pt', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>Bewerbung</div>
      </div>
      <div style={{ fontSize: '8pt', color: '#bbb', marginBottom: '4px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
      <div style={{ height: '1px', background: '#e8e8e8', marginBottom: '28px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600 }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
        <div style={{ fontSize: '9.5pt', color: '#888' }}>{data.date}</div>
      </div>
      <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
    </div>
  )
}

function LetterModernTwin({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, display: 'flex', fontFamily: SANS, fontSize: '10pt' }}>
      <div style={{ width: '50%', background: '#fff', color: '#333', padding: '48px 32px', boxSizing: 'border-box' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' as const, border: `3px solid ${c}` }} />}
          <div>
            <div style={{ fontSize: '15pt', fontWeight: 800, color: '#1a1a1a' }}>{data.senderName}</div>
            <div style={{ fontSize: '7.5pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '1.5px', fontWeight: 600 }}>Bewerber/in</div>
          </div>
        </div>
        <div style={{ fontSize: '8.5pt', lineHeight: '1.8', color: '#888', borderTop: `2px solid ${c}`, paddingTop: '14px' }}>
          <div>{data.senderAddress}</div>
          <div>{data.senderPhone}</div>
          <div>{data.senderEmail}</div>
          <div style={{ marginTop: '12px', color: '#bbb' }}>{data.date}</div>
        </div>
      </div>
      <div style={{ width: '50%', background: '#f8f9fa', color: '#333', padding: '48px 32px', boxSizing: 'border-box' as const, borderLeft: `4px solid ${c}` }}>
        <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '28px' }}>
          <div style={{ fontWeight: 600 }}>{data.recipientName}</div>
          <div>{data.recipientAddress}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#333" lineHeight="1.65" />
      </div>
    </div>
  )
}

function LetterModernDark({ data, c, photo }: { data: LetterData; c: string; photo?: string | null }) {
  return (
    <div style={{ width: W, minHeight: MIN_H, fontFamily: SANS, fontSize: '10pt', background: '#1a1a1a', color: '#e0e0e0', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '36px 56px', borderBottom: `4px solid ${c}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
        {photo && <img src={photo} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' as const, border: `2px solid ${c}` }} />}
        <div>
          <div style={{ fontSize: '20pt', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>{data.senderName}</div>
          <div style={{ fontSize: '8pt', color: c, textTransform: 'uppercase' as const, letterSpacing: '3px', fontWeight: 600 }}>Bewerbungsschreiben</div>
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ fontSize: '8.5pt', color: '#666', marginBottom: '24px' }}>{data.senderAddress} · {data.senderPhone} · {data.senderEmail}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}><div style={{ fontWeight: 600, color: '#fff' }}>{data.recipientName}</div><div>{data.recipientAddress}</div></div>
          <div style={{ fontSize: '9.5pt', color: '#555' }}>{data.date}</div>
        </div>
        <LetterBody data={data} font={SANS} color="#e0e0e0" lineHeight="1.65" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE MAP & MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

const TEMPLATE_MAP: Record<string, React.FC<{ data: LetterData; c: string; photo?: string | null }>> = {
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
  // Pro Series
  'letter-pro-classic': LetterProClassic,
  'letter-pro-light': LetterProLight,
  'letter-pro-serif': LetterProSerif,
  'letter-pro-gradient': LetterProGradient,
  'letter-pro-compact': LetterProCompact,
  'letter-pro-cards': LetterProCards,
  'letter-pro-dots': LetterProDots,
  'letter-pro-slim': LetterProSlim,
  'letter-pro-rounded': LetterProRounded,
  'letter-pro-square': LetterProSquare,
  // Right Panel
  'letter-right-classic': LetterRightClassic,
  'letter-right-dark': LetterRightDark,
  'letter-right-serif': LetterRightSerif,
  'letter-right-gradient': LetterRightGradient,
  'letter-right-modern': LetterRightModern,
  'letter-right-compact': LetterRightCompact,
  'letter-right-cards': LetterRightCards,
  'letter-right-dots': LetterRightDots,
  'letter-right-accent': LetterRightAccent,
  'letter-right-slim': LetterRightSlim,
  // Top Header
  'letter-top-dark': LetterTopDark,
  'letter-top-gradient': LetterTopGradient,
  'letter-top-accent': LetterTopAccent,
  'letter-top-serif': LetterTopSerif,
  'letter-top-modern': LetterTopModern,
  'letter-top-compact': LetterTopCompact,
  'letter-top-cards': LetterTopCards,
  'letter-top-light': LetterTopLight,
  'letter-top-slim': LetterTopSlim,
  'letter-top-dots': LetterTopDots,
  // Twin Column
  'letter-twin-classic': LetterTwinClassic,
  'letter-twin-dark': LetterTwinDark,
  'letter-twin-serif': LetterTwinSerif,
  'letter-twin-modern': LetterTwinModern,
  'letter-twin-compact': LetterTwinCompact,
  'letter-twin-cards': LetterTwinCards,
  'letter-twin-accent': LetterTwinAccent,
  'letter-twin-dots': LetterTwinDots,
  'letter-twin-gradient': LetterTwinGradient,
  'letter-twin-slim': LetterTwinSlim,
  // Single Column
  'letter-single-classic': LetterSingleClassic,
  'letter-single-dark': LetterSingleDark,
  'letter-single-serif': LetterSingleSerif,
  'letter-single-modern': LetterSingleModern,
  'letter-single-compact': LetterSingleCompact,
  'letter-single-cards': LetterSingleCards,
  'letter-single-gradient': LetterSingleGradient,
  'letter-single-accent': LetterSingleAccent,
  'letter-single-dots': LetterSingleDots,
  'letter-single-slim': LetterSingleSlim,
  // Tmavý motiv
  'letter-dark-sidebar-pro': LetterDarkSidebarPro,
  'letter-dark-right-pro': LetterDarkRightPro,
  'letter-dark-top-pro': LetterDarkTopPro,
  'letter-dark-twin-pro': LetterDarkTwinPro,
  'letter-dark-single-pro': LetterDarkSinglePro,
  'letter-dark-serif-pro': LetterDarkSerifPro,
  'letter-dark-modern-pro': LetterDarkModernPro,
  'letter-dark-compact-pro': LetterDarkCompactPro,
  'letter-dark-cards-pro': LetterDarkCardsPro,
  'letter-dark-gradient-pro': LetterDarkGradientPro,
  // Patkové
  'letter-serif-classic': LetterSerifClassic,
  'letter-serif-top': LetterSerifTop,
  'letter-serif-single': LetterSerifSingle,
  'letter-serif-dark': LetterSerifDark,
  'letter-serif-twin': LetterSerifTwin,
  'letter-serif-sidebar': LetterSerifSidebar,
  'letter-serif-right': LetterSerifRight,
  'letter-serif-accent': LetterSerifAccent,
  'letter-serif-compact': LetterSerifCompact,
  'letter-serif-modern': LetterSerifModern,
  // Moderní
  'letter-modern-square': LetterModernSquare,
  'letter-modern-rounded': LetterModernRounded,
  'letter-modern-cards': LetterModernCards,
  'letter-modern-dots': LetterModernDots,
  'letter-modern-accent': LetterModernAccent,
  'letter-modern-gradient': LetterModernGradient,
  'letter-modern-compact': LetterModernCompact,
  'letter-modern-slim': LetterModernSlim,
  'letter-modern-twin': LetterModernTwin,
  'letter-modern-dark': LetterModernDark,
}

export default function LetterPreview({ data, template, accentColor, photo, onSave, saving, saved }: LetterPreviewProps) {
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
          <TemplateComponent data={data} c={accentColor} photo={photo} />
        </div>
      </div>
      <p className="text-gray-500 text-xs text-center mt-4">PDF ve formatu A4</p>
    </div>
  )
}
