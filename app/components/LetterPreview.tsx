'use client'

// LetterPreview — A4 Anschreiben renderer (3 templates: klassisch / modern / minimal).
// Mirrors app/components/CVPreview.tsx pattern: inline styles for html2canvas/PDF fidelity.
// Data shape: LetterData from lib/letter/types.ts.

import type { LetterData } from '@/lib/letter/types'
import { getLetterTemplateById, LETTER_TEMPLATES } from '@/lib/letter/templates'

interface LetterPreviewProps {
  data: LetterData
  accentColor?: string
  template?: string
}

const A4_WIDTH = '210mm'
const A4_MIN_HEIGHT = '297mm'
const A4_PADDING = '25mm' // Swiss DIN 5008 margins

const SERIF = "'Lora', 'Times New Roman', Times, serif"
const SANS = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const BODY_FONT_SIZE = '11pt'
const BODY_LINE_HEIGHT = '1.4'
const PARA_GAP = '13px'

function formatSenderLine(s: LetterData['sender']): string {
  const left = s.address?.trim() || ''
  const right = [s.postalCode, s.city].filter(Boolean).join(' ').trim()
  return [left, right].filter(Boolean).join(' · ')
}

function formatRecipientLines(r: LetterData['recipient']): string[] {
  const lines: string[] = []
  if (r.company) lines.push(r.company)
  if (r.contactPerson) lines.push(r.contactPerson)
  if (r.address) lines.push(r.address)
  const cityLine = [r.postalCode, r.city].filter(Boolean).join(' ').trim()
  if (cityLine) lines.push(cityLine)
  return lines
}

function formatPlaceDate(meta: LetterData['meta']): string {
  const place = meta.place?.trim()
  const date = meta.date?.trim()
  if (place && date) return `${place}, ${date}`
  return date || place || ''
}

/* ───── KLASSISCH (DIN 5008, serif) ───── */
function LetterKlassisch({ data, accent }: { data: LetterData; accent: string }) {
  const { sender, recipient, meta, body } = data
  const senderContact = [sender.phone, sender.email].filter(Boolean).join(' · ')
  const senderAddrLine = formatSenderLine(sender)

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_MIN_HEIGHT,
        padding: A4_PADDING,
        backgroundColor: '#ffffff',
        fontFamily: SERIF,
        fontSize: BODY_FONT_SIZE,
        lineHeight: BODY_LINE_HEIGHT,
        color: '#1a1a1a',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'right', marginBottom: '24mm', fontSize: '10pt', lineHeight: '1.35' }}>
        <div style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '2px' }}>{sender.fullName}</div>
        {senderAddrLine && <div>{senderAddrLine}</div>}
        {senderContact && <div>{senderContact}</div>}
      </div>

      <div style={{ marginBottom: '16mm', fontSize: '11pt', lineHeight: '1.45' }}>
        {formatRecipientLines(recipient).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginBottom: '10mm', fontSize: '11pt' }}>
        {formatPlaceDate(meta)}
      </div>

      <div style={{ fontWeight: 700, marginBottom: '8mm', fontSize: '11pt' }}>
        {meta.subject}
        {meta.reference && (
          <div style={{ fontWeight: 400, fontSize: '9.5pt', color: '#525252', marginTop: '2px' }}>
            Referenz: {meta.reference}
          </div>
        )}
      </div>

      <div style={{ marginBottom: PARA_GAP }}>{body.opening}</div>

      {body.paragraphs.map((p) => (
        <div key={p.id} style={{ marginBottom: PARA_GAP, textAlign: 'justify' }}>
          {p.text}
        </div>
      ))}

      <div style={{ marginTop: '8mm', marginBottom: '14mm' }}>{body.signOff}</div>

      <div style={{ fontWeight: 600 }}>{sender.fullName}</div>

      <div
        style={{
          marginTop: '14mm',
          fontSize: '9.5pt',
          color: '#525252',
          borderTop: `1px solid ${accent}33`,
          paddingTop: '4mm',
        }}
      >
        Beilagen: Lebenslauf
      </div>
    </div>
  )
}

/* ───── MODERN (colored band, sans) ───── */
function LetterModern({ data, accent }: { data: LetterData; accent: string }) {
  const { sender, recipient, meta, body } = data
  const senderContact = [
    sender.address,
    [sender.postalCode, sender.city].filter(Boolean).join(' '),
    sender.phone,
    sender.email,
  ]
    .filter((s) => s && s.trim())
    .join(' · ')

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_MIN_HEIGHT,
        backgroundColor: '#ffffff',
        fontFamily: SANS,
        fontSize: BODY_FONT_SIZE,
        lineHeight: BODY_LINE_HEIGHT,
        color: '#1a1a1a',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div
        style={{
          backgroundColor: accent,
          color: '#ffffff',
          padding: '14mm 25mm 12mm 25mm',
          marginBottom: '10mm',
        }}
      >
        <div style={{ fontSize: '18pt', fontWeight: 700, letterSpacing: '0.3px', marginBottom: '4px' }}>
          {sender.fullName}
        </div>
        {senderContact && (
          <div style={{ fontSize: '9.5pt', opacity: 0.95, lineHeight: '1.4' }}>{senderContact}</div>
        )}
      </div>

      <div style={{ padding: `0 ${A4_PADDING} ${A4_PADDING} ${A4_PADDING}` }}>
        <div style={{ marginBottom: '10mm', fontSize: '11pt', lineHeight: '1.45' }}>
          {formatRecipientLines(recipient).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div style={{ textAlign: 'right', marginBottom: '8mm', fontSize: '11pt', color: '#525252' }}>
          {formatPlaceDate(meta)}
        </div>

        <div style={{ fontWeight: 700, marginBottom: '6mm', fontSize: '12pt', color: accent }}>
          {meta.subject}
          {meta.reference && (
            <div style={{ fontWeight: 400, fontSize: '9.5pt', color: '#525252', marginTop: '2px' }}>
              Referenz: {meta.reference}
            </div>
          )}
        </div>

        <div style={{ marginBottom: PARA_GAP }}>{body.opening}</div>

        {body.paragraphs.map((p) => (
          <div key={p.id} style={{ marginBottom: PARA_GAP, textAlign: 'justify' }}>
            {p.text}
          </div>
        ))}

        <div style={{ marginTop: '8mm', marginBottom: '14mm' }}>{body.signOff}</div>

        <div style={{ fontWeight: 600, fontSize: '11.5pt' }}>{sender.fullName}</div>

        <div
          style={{
            marginTop: '14mm',
            fontSize: '9.5pt',
            color: '#525252',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: accent,
              display: 'inline-block',
            }}
          />
          Beilagen: Lebenslauf
        </div>
      </div>
    </div>
  )
}

/* ───── MINIMAL (centered name, thin divider) ───── */
function LetterMinimal({ data, accent }: { data: LetterData; accent: string }) {
  const { sender, recipient, meta, body } = data

  return (
    <div
      style={{
        width: A4_WIDTH,
        minHeight: A4_MIN_HEIGHT,
        padding: A4_PADDING,
        backgroundColor: '#ffffff',
        fontFamily: SANS,
        fontSize: BODY_FONT_SIZE,
        lineHeight: BODY_LINE_HEIGHT,
        color: '#3f3f46',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '14mm' }}>
        <div
          style={{
            fontSize: '16pt',
            fontWeight: 300,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: '#171717',
          }}
        >
          {sender.fullName}
        </div>
        <div
          style={{
            width: '40px',
            height: '1px',
            backgroundColor: accent,
            margin: '8px auto 0',
          }}
        />
      </div>

      <div style={{ marginBottom: '10mm', fontSize: '10.5pt', lineHeight: '1.5', color: '#525252' }}>
        {formatRecipientLines(recipient).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div style={{ marginBottom: '10mm', fontSize: '10.5pt', color: '#737373' }}>
        {formatPlaceDate(meta)}
      </div>

      <div style={{ marginBottom: '8mm' }}>
        <div style={{ fontWeight: 700, fontSize: '11pt', color: '#171717', marginBottom: '4mm' }}>
          {meta.subject}
        </div>
        {meta.reference && (
          <div style={{ fontWeight: 400, fontSize: '9.5pt', color: '#737373', marginBottom: '4mm' }}>
            Referenz: {meta.reference}
          </div>
        )}
        <div style={{ height: '1px', backgroundColor: '#e5e5e5', width: '100%' }} />
      </div>

      <div style={{ marginBottom: PARA_GAP, color: '#3f3f46' }}>{body.opening}</div>

      {body.paragraphs.map((p) => (
        <div key={p.id} style={{ marginBottom: PARA_GAP, textAlign: 'justify', color: '#3f3f46' }}>
          {p.text}
        </div>
      ))}

      <div style={{ marginTop: '10mm', marginBottom: '14mm', color: '#3f3f46' }}>{body.signOff}</div>

      <div style={{ fontWeight: 500, color: '#171717' }}>{sender.fullName}</div>

      <div
        style={{
          marginTop: '16mm',
          fontSize: '9pt',
          color: '#a3a3a3',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        Beilagen — Lebenslauf
      </div>
    </div>
  )
}

export default function LetterPreview({ data, accentColor, template }: LetterPreviewProps) {
  const templateId = template || data.design?.templateId || 'klassisch'
  const tpl = getLetterTemplateById(templateId)

  const accent =
    accentColor || data.design?.accentColor || tpl?.defaultColor || '#1a1a1a'

  const outerClass = `letter-preview letter-template-${templateId}`

  let inner: React.ReactNode
  switch (templateId) {
    case 'modern':
      inner = <LetterModern data={data} accent={accent} />
      break
    case 'minimal':
      inner = <LetterMinimal data={data} accent={accent} />
      break
    case 'klassisch':
    default:
      inner = <LetterKlassisch data={data} accent={accent} />
      break
  }

  return <div className={outerClass}>{inner}</div>
}

export { LETTER_TEMPLATES }
