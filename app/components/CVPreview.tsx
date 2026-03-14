'use client'

import { useRef, useState } from 'react'

interface CVData {
  profil?: string
  personalData: {
    name: string
    birthdate: string
    nationality: string
    address: string
    phone: string
    email: string
    drivingLicense?: string
  }
  experience: Array<{ period: string; title: string; company: string; location?: string; tasks: string[] }>
  education: Array<{ period: string; school: string; degree: string; location?: string }>
  languages: Array<{ language: string; level: string }>
  skills: { technical: string[]; soft: string[] }
  certifications?: string[]
}

interface CVPreviewProps {
  data: CVData
  photo: string | null
  template: 'klassisch' | 'modern' | 'kreativ' | 'elegant' | 'minimal' | 'executive' | 'swiss' | 'timeline' | 'corporate' | 'bold'
  accentColor: string
}

function getLvl(level: string): number {
  const l = level.toLowerCase()
  if (l.includes('mutter') || l.includes('c2')) return 5
  if (l.includes('c1') || l.includes('verhandlung')) return 5
  if (l.includes('b2') || l.includes('fließend')) return 4
  if (l.includes('b1') || l.includes('fortgeschritten')) return 3
  if (l.includes('a2') || l.includes('grund')) return 2
  return 1
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CVPreview({ data, photo, template, accentColor }: CVPreviewProps) {
  const cvRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cvRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().set({
        margin: 0,
        filename: `Lebenslauf_${data.personalData.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0, windowWidth: 794 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any).from(cvRef.current).save()
    } catch { alert('Chyba při generování PDF.') }
    finally { setDownloading(false) }
  }

  const T = { klassisch: KlassischT, modern: ModernT, kreativ: KreativT, elegant: ElegantT, minimal: MinimalT, executive: ExecutiveT, swiss: SwissT, timeline: TimelineT, corporate: CorporateT, bold: BoldT }
  const Template = T[template]

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={handleDownload} disabled={downloading} className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {downloading ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generuji PDF...</span>) : '📥 Stáhnout jako PDF'}
        </button>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ overflowX: 'auto' }}>
        <div ref={cvRef}><Template data={data} photo={photo} c={accentColor} /></div>
      </div>
      <p className="text-gray-500 text-xs text-center mt-4">💡 PDF ve formátu A4</p>
    </div>
  )
}

/* ═══ HELPERS ═══ */
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const W = '210mm'

function LangBars({ langs, c, light }: { langs: CVData['languages']; c: string; light?: boolean }) {
  return <>{langs.map((l, i) => {
    const lv = getLvl(l.level)
    return (<div key={i} style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontWeight: 600, fontSize: '8.5pt', color: light ? '#fff' : '#333' }}>{l.language}</span>
        <span style={{ fontSize: '7pt', color: light ? 'rgba(255,255,255,0.5)' : '#aaa' }}>{l.level}</span>
      </div>
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1,2,3,4,5].map(d => <div key={d} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: d <= lv ? (light ? '#fff' : c) : (light ? 'rgba(255,255,255,0.15)' : '#e8e8e8') }} />)}
      </div>
    </div>)
  })}</>
}

function LangDots({ langs, c }: { langs: CVData['languages']; c: string }) {
  return <>{langs.map((l, i) => {
    const lv = getLvl(l.level)
    return (<div key={i} style={{ marginBottom: '10px' }}>
      <span style={{ fontSize: '8.5pt', fontWeight: 700, color: '#333' }}>{l.language}</span>
      <div style={{ display: 'flex', gap: '4px', margin: '3px 0 1px' }}>
        {[1,2,3,4,5].map(d => <div key={d} style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: d <= lv ? c : '#eee' }} />)}
      </div>
      <span style={{ fontSize: '7pt', color: '#aaa' }}>{l.level}</span>
    </div>)
  })}</>
}

function SkillPills({ skills, c, filled }: { skills: string[]; c: string; filled?: boolean }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
    {skills.map((s, i) => <span key={i} style={{ fontSize: '7.5pt', backgroundColor: filled ? c : hexToRgba(c, 0.08), color: filled ? '#fff' : c, padding: '4px 10px', borderRadius: '14px', fontWeight: 500, border: filled ? 'none' : `1px solid ${hexToRgba(c, 0.2)}` }}>{s}</span>)}
  </div>
}

function SoftList({ skills, c, light }: { skills: string[]; c: string; light?: boolean }) {
  return <>{skills.map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: light ? 'rgba(255,255,255,0.4)' : c, flexShrink: 0 }} />
    <span style={{ fontSize: '8pt', color: light ? '#ddd' : '#666' }}>{s}</span>
  </div>)}</>
}

/* ═══ TEMPLATE 1: KLASSISCH ═══ */
function KlassischT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', display: 'flex', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45' }}>
      <div style={{ width: '75mm', backgroundColor: c, color: '#ecf0f1', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 22px 20px', textAlign: 'center' }}>
          {photo ? <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.3)' }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          : <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px', backgroundColor: 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '32pt', color: 'rgba(255,255,255,0.3)' }}>👤</span></div>}
          <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: '0 0 2px', color: '#fff' }}>{p.name}</h1>
          <p style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />
        <div style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '10px', color: 'rgba(255,255,255,0.5)' }}>Kontakt</h2>
          {p.address && <p style={{ fontSize: '8.5pt', color: '#ddd', margin: '0 0 6px' }}>📍 {p.address}</p>}
          <p style={{ fontSize: '8.5pt', color: '#ddd', margin: '0 0 6px' }}>📞 {p.phone}</p>
          <p style={{ fontSize: '8pt', color: '#ddd', margin: 0, wordBreak: 'break-all' }}>✉️ {p.email}</p>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />
        <div style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '10px', color: 'rgba(255,255,255,0.5)' }}>Persönliche Daten</h2>
          <p style={{ fontSize: '8.5pt', color: '#ddd', margin: '0 0 4px' }}>Geburtsdatum: {p.birthdate}</p>
          <p style={{ fontSize: '8.5pt', color: '#ddd', margin: '0 0 4px' }}>Nationalität: {p.nationality}</p>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '8.5pt', color: '#ddd', margin: 0 }}>Führerschein: {p.drivingLicense}</p>}
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />
        <div style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '12px', color: 'rgba(255,255,255,0.5)' }}>Sprachen</h2>
          <LangBars langs={data.languages} c={c} light />
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />
        {data.skills.soft.length > 0 && <div style={{ padding: '18px 22px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '10px', color: 'rgba(255,255,255,0.5)' }}>Kompetenzen</h2>
          <SoftList skills={data.skills.soft} c={c} light />
        </div>}
      </div>
      <div style={{ flex: 1, padding: '28px 28px 28px 30px', color: '#333', backgroundColor: '#fff' }}>
        {data.profil && <><SectionH t="Profil" c={c} /><p style={{ fontSize: '9pt', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>{data.profil}</p></>}
        <SectionH t="Berufserfahrung" c={c} /><ExpList data={data} c={c} />
        <SectionH t="Ausbildung" c={c} /><EduList data={data} c={c} />
        {data.skills.technical.length > 0 && <><SectionH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /><div style={{ marginBottom: '24px' }} /></>}
        {data.certifications && data.certifications.length > 0 && <><SectionH t="Zertifikate" c={c} />{data.certifications.map((x,i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {x}</p>)}<div style={{ marginBottom: '24px' }} /></>}
        <SectionH t="Referenzen" c={c} /><p style={{ fontSize: '9pt', color: '#999', fontStyle: 'italic' }}>Auf Anfrage erhältlich</p>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 2: MODERN ═══ */
function ModernT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      <div style={{ height: '8px', backgroundColor: c }} />
      <div style={{ padding: '30px 35px 24px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid #eee' }}>
        {photo && <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</h1>
          <p style={{ fontSize: '11pt', color: c, margin: '0 0 8px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '8.5pt', color: '#888' }}>
            {p.address && <span>📍 {p.address}</span>}<span>📞 {p.phone}</span><span>✉️ {p.email}</span>
          </div>
        </div>
      </div>
      {data.profil && <div style={{ padding: '20px 35px', backgroundColor: '#fafbfc', borderBottom: '1px solid #eee' }}><p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>{data.profil}</p></div>}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <ModH t="Berufserfahrung" c={c} /><ExpList data={data} c={c} />
          <ModH t="Ausbildung" c={c} /><EduList data={data} c={c} />
          {data.certifications && data.certifications.length > 0 && <><ModH t="Zertifikate" c={c} />{data.certifications.map((x,i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {x}</p>)}</>}
        </div>
        <div style={{ width: '155px', flexShrink: 0 }}>
          <ModH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
          {data.skills.technical.length > 0 && <><ModH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
          {data.skills.soft.length > 0 && <><ModH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '7.5pt', color: '#999', margin: '0 0 3px' }}>Geburtsdatum: {p.birthdate}</p>
            <p style={{ fontSize: '7.5pt', color: '#999', margin: 0 }}>Nationalität: {p.nationality}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 35px', borderTop: '1px solid #eee', textAlign: 'center' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 3: KREATIV ═══ */
function KreativT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      <div style={{ backgroundColor: c, padding: '35px 35px 30px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        {photo && <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0, position: 'relative', zIndex: 1 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28pt', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{p.name}</h1>
          <p style={{ fontSize: '12pt', color: 'rgba(255,255,255,0.8)', margin: '0 0 10px', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '8.5pt', color: 'rgba(255,255,255,0.7)' }}>
            {p.address && <span>📍 {p.address}</span>}<span>📞 {p.phone}</span><span>✉️ {p.email}</span>
          </div>
        </div>
      </div>
      {data.profil && <div style={{ padding: '16px 35px', backgroundColor: '#f8f9fa', borderBottom: `2px solid ${c}` }}><p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.6', margin: 0 }}>&laquo;{data.profil}&raquo;</p></div>}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <KrH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '18px', position: 'relative', paddingLeft: '20px' }}>
              <div style={{ position: 'absolute', left: 0, top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: i === 0 ? c : '#ddd' }} />
              {i < data.experience.length - 1 && <div style={{ position: 'absolute', left: '4px', top: '18px', width: '2px', height: 'calc(100% + 4px)', backgroundColor: '#eee' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: '#aaa', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: c, margin: '2px 0 6px', fontWeight: 600 }}>{exp.company}</p>
              {exp.tasks.map((t, j) => <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: c, fontSize: '8pt', flexShrink: 0 }}>→</span><span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span></div>)}
            </div>
          ))}
          <KrH t="Ausbildung" c={c} /><EduList data={data} c={c} />
        </div>
        <div style={{ width: '160px', flexShrink: 0 }}>
          <KrH t="Sprachen" c={c} /><LangDots langs={data.languages} c={c} />
          {data.skills.technical.length > 0 && <><KrH t="Skills" c={c} /><SkillPills skills={data.skills.technical} c={c} filled /></>}
          {data.skills.soft.length > 0 && <><KrH t="Stärken" c={c} />{data.skills.soft.map((s,i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}><span style={{ color: c, fontSize: '10pt' }}>✦</span><span style={{ fontSize: '8pt', color: '#555' }}>{s}</span></div>)}</>}
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: c, borderRadius: '10px', color: '#fff' }}>
            <p style={{ fontSize: '7pt', margin: '0 0 3px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Info</p>
            <p style={{ fontSize: '7.5pt', margin: '0 0 2px' }}>{p.birthdate}</p>
            <p style={{ fontSize: '7.5pt', margin: '0 0 2px' }}>{p.nationality}</p>
            {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '7.5pt', margin: 0 }}>Führerschein {p.drivingLicense}</p>}
          </div>
          <p style={{ fontSize: '7.5pt', color: '#bbb', fontStyle: 'italic', marginTop: '16px' }}>Referenzen auf Anfrage</p>
        </div>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 4: ELEGANT – thin accent sidebar ═══ */
function ElegantT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: '9.5pt', lineHeight: '1.5', backgroundColor: '#fff', display: 'flex' }}>
      {/* Thin accent bar */}
      <div style={{ width: '6px', backgroundColor: c, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 35px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '6px' }}>
          {photo && <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          <div>
            <h1 style={{ fontSize: '28pt', fontWeight: 400, color: '#1a1a1a', margin: 0, letterSpacing: '1px' }}>{p.name}</h1>
            <p style={{ fontSize: '10pt', color: c, margin: '2px 0 0', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          </div>
        </div>

        {/* Contact line */}
        <div style={{ display: 'flex', gap: '20px', padding: '10px 0', borderTop: `1px solid ${hexToRgba(c, 0.3)}`, borderBottom: `1px solid ${hexToRgba(c, 0.3)}`, marginBottom: '20px', fontSize: '8.5pt', color: '#777' }}>
          {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
          <span>{p.birthdate} · {p.nationality}</span>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <span>Führerschein {p.drivingLicense}</span>}
        </div>

        {/* Profil */}
        {data.profil && <div style={{ marginBottom: '22px', paddingLeft: '16px', borderLeft: `2px solid ${c}` }}><p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>{data.profil}</p></div>}

        {/* 2 columns */}
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: 1 }}>
            <ElegH t="Berufserfahrung" c={c} />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50', fontFamily: F }}>{exp.title}</h3>
                  <span style={{ fontSize: '8pt', color: c, fontWeight: 500 }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: '8.5pt', color: '#999', margin: '1px 0 5px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 2px', paddingLeft: '12px' }}>– {t}</p>)}
              </div>
            ))}

            <ElegH t="Ausbildung" c={c} />
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50', fontFamily: F }}>{edu.degree}</h3>
                  <span style={{ fontSize: '8pt', color: c, fontWeight: 500 }}>{edu.period}</span>
                </div>
                <p style={{ fontSize: '8.5pt', color: '#999', margin: '1px 0 0', fontStyle: 'italic' }}>{edu.school}</p>
              </div>
            ))}

            {data.certifications && data.certifications.length > 0 && <><ElegH t="Zertifikate" c={c} />{data.certifications.map((x,i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 3px' }}>– {x}</p>)}</>}
          </div>

          {/* Right */}
          <div style={{ width: '150px', flexShrink: 0 }}>
            <ElegH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
            {data.skills.technical.length > 0 && <><ElegH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
            {data.skills.soft.length > 0 && <><ElegH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          </div>
        </div>

        <div style={{ marginTop: '20px', borderTop: `1px solid ${hexToRgba(c, 0.2)}`, paddingTop: '8px' }}>
          <p style={{ fontSize: '8pt', color: '#bbb', fontStyle: 'italic', margin: 0 }}>Referenzen auf Anfrage erhältlich</p>
        </div>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 5: MINIMAL – pure typography ═══ */
function MinimalT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.5', backgroundColor: '#fff', padding: '35px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        {photo && <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: `2px solid ${c}` }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <h1 style={{ fontSize: '30pt', fontWeight: 300, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '4px', textTransform: 'uppercase' }}>{p.name}</h1>
        <p style={{ fontSize: '10pt', color: c, margin: '0 0 10px', letterSpacing: '5px', textTransform: 'uppercase', fontWeight: 500 }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '8pt', color: '#999', flexWrap: 'wrap' }}>
          {p.address && <span>{p.address}</span>}{p.address && <span>·</span>}
          <span>{p.phone}</span><span>·</span><span>{p.email}</span>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <><span>·</span><span>Führerschein {p.drivingLicense}</span></>}
        </div>
      </div>

      <div style={{ height: '2px', backgroundColor: c, margin: '16px 0' }} />

      {/* Profil */}
      {data.profil && <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 30px' }}><p style={{ fontSize: '9.5pt', color: '#666', lineHeight: '1.7', margin: 0 }}>{data.profil}</p></div>}

      {/* 2 columns */}
      <div style={{ display: 'flex', gap: '35px' }}>
        <div style={{ flex: 1 }}>
          <MinH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: '#aaa', margin: '1px 0 5px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 2px', paddingLeft: '10px' }}>· {t}</p>)}
            </div>
          ))}

          <MinH t="Ausbildung" c={c} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{edu.degree}</h3>
                <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: '#aaa', margin: '1px 0 0' }}>{edu.school}</p>
            </div>
          ))}
        </div>

        <div style={{ width: '1px', backgroundColor: '#eee' }} />

        <div style={{ width: '160px', flexShrink: 0 }}>
          <MinH t="Persönliche Daten" c={c} />
          <p style={{ fontSize: '8.5pt', color: '#777', margin: '0 0 3px' }}>{p.birthdate}</p>
          <p style={{ fontSize: '8.5pt', color: '#777', margin: '0 0 12px' }}>{p.nationality}</p>

          <MinH t="Sprachen" c={c} />
          {data.languages.map((l, i) => {
            const lv = getLvl(l.level)
            return <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt' }}>
                <span style={{ fontWeight: 600 }}>{l.language}</span>
              </div>
              <div style={{ display: 'flex', gap: '2px', margin: '3px 0' }}>
                {[1,2,3,4,5].map(d => <div key={d} style={{ width: '22px', height: '3px', backgroundColor: d <= lv ? c : '#e8e8e8' }} />)}
              </div>
              <span style={{ fontSize: '7pt', color: '#bbb' }}>{l.level}</span>
            </div>
          })}

          {data.skills.technical.length > 0 && <><MinH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
          {data.skills.soft.length > 0 && <><MinH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 6: EXECUTIVE – dark header band ═══ */
function ExecutiveT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      {/* Dark header */}
      <div style={{ backgroundColor: '#1a1a2e', padding: '30px 35px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {photo && <div style={{ width: '85px', height: '85px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '26pt', fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '1px' }}>{p.name}</h1>
          <p style={{ fontSize: '11pt', color: c, margin: '0 0 10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '8.5pt', color: 'rgba(255,255,255,0.6)' }}>
            {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
            <span>{p.birthdate} · {p.nationality}</span>
          </div>
        </div>
      </div>
      {/* Accent line */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${c}, ${hexToRgba(c, 0.3)})` }} />
      {/* Profile */}
      {data.profil && <div style={{ padding: '18px 35px', backgroundColor: '#f8f9fa' }}><p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.65', margin: 0 }}>{data.profil}</p></div>}
      {/* Body */}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <ExecH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: i < data.experience.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#1a1a2e' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: '#888', margin: '2px 0 6px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: c, fontSize: '8pt', flexShrink: 0 }}>▸</span><span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span></div>)}
            </div>
          ))}
          <ExecH t="Ausbildung" c={c} /><EduList data={data} c={c} />
          {data.certifications && data.certifications.length > 0 && <><ExecH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>▸ {x}</p>)}</>}
        </div>
        <div style={{ width: '160px', flexShrink: 0 }}>
          <ExecH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
          {data.skills.technical.length > 0 && <><ExecH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
          {data.skills.soft.length > 0 && <><ExecH t="Soft Skills" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <div style={{ marginTop: '14px', fontSize: '8pt', color: '#999' }}>Führerschein: {p.drivingLicense}</div>}
        </div>
      </div>
      <div style={{ padding: '10px 35px', borderTop: '1px solid #eee' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 7: SWISS – formal, structured, Swiss style ═══ */
function SwissT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.5', backgroundColor: '#fff', padding: '30px 35px' }}>
      {/* Header with Swiss cross accent */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '8pt', color: c, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 4px' }}>Lebenslauf</p>
          <h1 style={{ fontSize: '28pt', fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</h1>
          <p style={{ fontSize: '10pt', color: '#666', margin: '0 0 8px', letterSpacing: '1px' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
        {photo && <div style={{ width: '90px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${hexToRgba(c, 0.3)}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
      </div>
      {/* Contact bar */}
      <div style={{ display: 'flex', gap: '20px', padding: '10px 14px', backgroundColor: hexToRgba(c, 0.06), borderRadius: '6px', marginBottom: '20px', fontSize: '8.5pt', color: '#666', border: `1px solid ${hexToRgba(c, 0.12)}` }}>
        {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
        <span>{p.birthdate}</span><span>{p.nationality}</span>
        {p.drivingLicense && p.drivingLicense !== 'žádný' && <span>Kat. {p.drivingLicense}</span>}
      </div>
      {/* Profil */}
      {data.profil && <div style={{ marginBottom: '20px' }}><SwissH t="Profil" c={c} /><p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.65', margin: 0 }}>{data.profil}</p></div>}
      {/* Experience as table-like layout */}
      <SwissH t="Berufserfahrung" c={c} />
      {data.experience.map((exp, i) => (
        <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
          <div style={{ width: '85px', flexShrink: 0, textAlign: 'right' }}>
            <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{exp.period}</span>
          </div>
          <div style={{ flex: 1, paddingLeft: '16px', borderLeft: `2px solid ${hexToRgba(c, 0.2)}` }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{exp.title}</h3>
            <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 5px' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
            {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 2px' }}>– {t}</p>)}
          </div>
        </div>
      ))}
      {/* Education */}
      <SwissH t="Ausbildung" c={c} />
      {data.education.map((edu, i) => (
        <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
          <div style={{ width: '85px', flexShrink: 0, textAlign: 'right' }}>
            <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{edu.period}</span>
          </div>
          <div style={{ flex: 1, paddingLeft: '16px', borderLeft: `2px solid ${hexToRgba(c, 0.2)}` }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{edu.degree}</h3>
            <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0' }}>{edu.school}{edu.location ? `, ${edu.location}` : ''}</p>
          </div>
        </div>
      ))}
      {/* Bottom grid */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '8px' }}>
        <div style={{ flex: 1 }}>
          <SwissH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
        </div>
        <div style={{ flex: 1 }}>
          {data.skills.technical.length > 0 && <><SwissH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
        </div>
        <div style={{ flex: 1 }}>
          {data.skills.soft.length > 0 && <><SwissH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
        </div>
      </div>
      {data.certifications && data.certifications.length > 0 && <div style={{ marginTop: '14px' }}><SwissH t="Zertifikate" c={c} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{data.certifications.map((x, i) => <span key={i} style={{ fontSize: '8pt', color: '#555', backgroundColor: '#f5f5f5', padding: '3px 10px', borderRadius: '4px' }}>{x}</span>)}</div></div>}
      <div style={{ marginTop: '20px', textAlign: 'center' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 8: TIMELINE – visual timeline left ═══ */
function TimelineT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '30px 35px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {photo && <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div>
          <h1 style={{ fontSize: '26pt', fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</h1>
          <p style={{ fontSize: '10pt', color: c, margin: 0, fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
      </div>
      {/* Contact row */}
      <div style={{ padding: '0 35px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '8.5pt', color: '#888' }}>
        {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
        <span>{p.birthdate} · {p.nationality}</span>
        {p.drivingLicense && p.drivingLicense !== 'žádný' && <span>Führerschein {p.drivingLicense}</span>}
      </div>
      <div style={{ height: '2px', backgroundColor: c, margin: '0 35px' }} />
      {/* Profile */}
      {data.profil && <div style={{ padding: '16px 35px' }}><p style={{ fontSize: '9.5pt', color: '#666', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
      {/* Experience timeline */}
      <div style={{ padding: '10px 35px 0' }}>
        <TlH t="Berufserfahrung" c={c} />
        <div style={{ position: 'relative', paddingLeft: '30px', marginLeft: '8px' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '2px', backgroundColor: hexToRgba(c, 0.2) }} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '18px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: i === 0 ? c : '#fff', border: `2px solid ${c}` }} />
              <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{exp.period}</span>
              <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: '2px 0 1px', color: '#1a1a1a' }}>{exp.title}</h3>
              <p style={{ fontSize: '8.5pt', color: '#888', margin: '0 0 5px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 2px', paddingLeft: '10px' }}>· {t}</p>)}
            </div>
          ))}
        </div>
        {/* Education timeline */}
        <TlH t="Ausbildung" c={c} />
        <div style={{ position: 'relative', paddingLeft: '30px', marginLeft: '8px' }}>
          <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '2px', backgroundColor: hexToRgba(c, 0.2) }} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '14px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-26px', top: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#fff', border: `2px solid ${hexToRgba(c, 0.4)}` }} />
              <span style={{ fontSize: '8pt', color: c, fontWeight: 600 }}>{edu.period}</span>
              <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: '2px 0 0', color: '#1a1a1a' }}>{edu.degree}</h3>
              <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Bottom sections */}
      <div style={{ display: 'flex', gap: '24px', padding: '10px 35px 20px' }}>
        <div style={{ flex: 1 }}><TlH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} /></div>
        {data.skills.technical.length > 0 && <div style={{ flex: 1 }}><TlH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></div>}
        {data.skills.soft.length > 0 && <div style={{ flex: 1 }}><TlH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></div>}
      </div>
      {data.certifications && data.certifications.length > 0 && <div style={{ padding: '0 35px 10px' }}><TlH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <span key={i} style={{ fontSize: '8pt', color: '#555', marginRight: '8px' }}>• {x}</span>)}</div>}
      <div style={{ padding: '10px 35px', borderTop: '1px solid #eee' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 9: CORPORATE – right sidebar ═══ */
function CorporateT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', display: 'flex', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45' }}>
      {/* Main content left */}
      <div style={{ flex: 1, padding: '30px 28px 28px 35px', color: '#333', backgroundColor: '#fff' }}>
        <h1 style={{ fontSize: '26pt', fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</h1>
        <p style={{ fontSize: '10pt', color: c, margin: '0 0 14px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        {data.profil && <div style={{ marginBottom: '20px', padding: '12px 14px', backgroundColor: '#fafbfc', borderRadius: '6px', borderLeft: `3px solid ${c}` }}><p style={{ fontSize: '9pt', color: '#666', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
        <CorpH t="Berufserfahrung" c={c} /><ExpList data={data} c={c} />
        <CorpH t="Ausbildung" c={c} /><EduList data={data} c={c} />
        {data.skills.technical.length > 0 && <><CorpH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /><div style={{ marginBottom: '20px' }} /></>}
        {data.certifications && data.certifications.length > 0 && <><CorpH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {x}</p>)}</>}
      </div>
      {/* Right sidebar */}
      <div style={{ width: '72mm', backgroundColor: hexToRgba(c, 0.04), borderLeft: `1px solid ${hexToRgba(c, 0.1)}`, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 20px 20px', textAlign: 'center' }}>
          {photo ? <div style={{ width: '95px', height: '95px', borderRadius: '12px', overflow: 'hidden', margin: '0 auto 14px', border: `2px solid ${hexToRgba(c, 0.3)}` }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          : <div style={{ width: '95px', height: '95px', borderRadius: '12px', margin: '0 auto 14px', backgroundColor: hexToRgba(c, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '28pt', color: hexToRgba(c, 0.3) }}>👤</span></div>}
        </div>
        <div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.1), margin: '0 20px' }} />
        <div style={{ padding: '16px 20px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', color: c }}>Kontakt</h2>
          {p.address && <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 5px' }}>{p.address}</p>}
          <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 5px' }}>{p.phone}</p>
          <p style={{ fontSize: '8pt', color: '#666', margin: 0, wordBreak: 'break-all' }}>{p.email}</p>
        </div>
        <div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.1), margin: '0 20px' }} />
        <div style={{ padding: '16px 20px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', color: c }}>Persönliche Daten</h2>
          <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 3px' }}>{p.birthdate}</p>
          <p style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 3px' }}>{p.nationality}</p>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '8.5pt', color: '#666', margin: 0 }}>Kat. {p.drivingLicense}</p>}
        </div>
        <div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.1), margin: '0 20px' }} />
        <div style={{ padding: '16px 20px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', color: c }}>Sprachen</h2>
          <LangBars langs={data.languages} c={c} />
        </div>
        <div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.1), margin: '0 20px' }} />
        {data.skills.soft.length > 0 && <div style={{ padding: '16px 20px' }}>
          <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', color: c }}>Soft Skills</h2>
          <SoftList skills={data.skills.soft} c={c} />
        </div>}
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 10: BOLD – large typography, gradient accents ═══ */
function BoldT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  const lighter = hexToRgba(c, 0.15)
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff', padding: '0' }}>
      {/* Big header */}
      <div style={{ padding: '35px 35px 25px', background: `linear-gradient(135deg, ${c}, ${hexToRgba(c, 0.7)})`, display: 'flex', alignItems: 'center', gap: '22px' }}>
        {photo && <div style={{ width: '95px', height: '95px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.3)', flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div>
          <h1 style={{ fontSize: '32pt', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{p.name}</h1>
          <p style={{ fontSize: '13pt', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
      </div>
      {/* Contact strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '10px 35px', backgroundColor: '#1a1a1a', fontSize: '8.5pt', color: 'rgba(255,255,255,0.7)' }}>
        {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
        <span>{p.birthdate}</span><span>{p.nationality}</span>
      </div>
      {/* Profile */}
      {data.profil && <div style={{ padding: '20px 35px', backgroundColor: lighter }}><p style={{ fontSize: '10pt', color: '#444', lineHeight: '1.7', margin: 0, textAlign: 'center' }}>{data.profil}</p></div>}
      {/* Body */}
      <div style={{ padding: '24px 35px' }}>
        <BoldH t="Berufserfahrung" c={c} />
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '18px', padding: '14px 16px', backgroundColor: i === 0 ? lighter : 'transparent', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontSize: '11pt', fontWeight: 800, margin: 0, color: '#1a1a1a' }}>{exp.title}</h3>
              <span style={{ fontSize: '8pt', color: '#fff', backgroundColor: c, padding: '2px 10px', borderRadius: '10px', fontWeight: 600 }}>{exp.period}</span>
            </div>
            <p style={{ fontSize: '9pt', color: c, margin: '3px 0 7px', fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
            {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 3px', paddingLeft: '12px' }}>→ {t}</p>)}
          </div>
        ))}
        <BoldH t="Ausbildung" c={c} />
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: `3px solid ${c}` }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{edu.degree}</h3>
            <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''} <span style={{ color: c, fontWeight: 600 }}>{edu.period}</span></p>
          </div>
        ))}
        {/* Skills grid */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
          <div style={{ flex: 1 }}><BoldH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} /></div>
          <div style={{ flex: 1 }}>
            {data.skills.technical.length > 0 && <><BoldH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} filled /></>}
          </div>
          <div style={{ flex: 1 }}>
            {data.skills.soft.length > 0 && <><BoldH t="Stärken" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          </div>
        </div>
        {data.certifications && data.certifications.length > 0 && <div style={{ marginTop: '14px' }}><BoldH t="Zertifikate" c={c} /><SkillPills skills={data.certifications} c={c} /></div>}
      </div>
      <div style={{ textAlign: 'center', padding: '10px 35px', borderTop: '2px solid #eee' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ SECTION HEADERS ═══ */
function SectionH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '14px' }}><h2 style={{ fontSize: '11pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2.5px', backgroundColor: c, width: '40px', borderRadius: '2px' }} /></div>
}
function ModH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '16px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '30px' }} /></div>
}
function KrH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '10px', marginTop: '16px' }}><h2 style={{ fontSize: '10pt', fontWeight: 800, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '3px' }}>{t}</h2><div style={{ height: '3px', backgroundColor: c, width: '25px', borderRadius: '2px' }} /></div>
}
function ElegH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '18px' }}><h2 style={{ fontSize: '10pt', fontWeight: 400, color: c, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '4px', fontFamily: "'Georgia', serif" }}>{t}</h2><div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.3), width: '100%' }} /></div>
}
function MinH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '10px', marginTop: '14px' }}><h2 style={{ fontSize: '8pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '3px' }}>{t}</h2></div>
}
function ExecH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '16px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{t}</h2><div style={{ height: '2px', background: `linear-gradient(90deg, ${c}, transparent)`, width: '60px' }} /></div>
}
function SwissH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '16px' }}><h2 style={{ fontSize: '9pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '6px' }}>{t}</h2><div style={{ height: '1px', backgroundColor: hexToRgba(c, 0.2), width: '100%' }} /></div>
}
function TlH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '14px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '35px', borderRadius: '1px' }} /></div>
}
function CorpH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '16px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '30px' }} /></div>
}
function BoldH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '14px', marginTop: '18px' }}><h2 style={{ fontSize: '12pt', fontWeight: 900, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '4px', backgroundColor: c, width: '40px', borderRadius: '2px' }} /></div>
}

/* ═══ SHARED LISTS ═══ */
function ExpList({ data, c }: { data: CVData; c: string }) {
  return <div style={{ marginBottom: '24px' }}>{data.experience.map((exp, i) => (
    <div key={i} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `2px solid ${i === 0 ? c : '#e0e0e0'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
        <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.period}</span>
      </div>
      <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 6px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
      {exp.tasks.map((t, j) => <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: c, fontSize: '7pt', marginTop: '3px', flexShrink: 0 }}>●</span><span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span></div>)}
    </div>
  ))}</div>
}

function EduList({ data }: { data: CVData; c: string }) {
  return <div style={{ marginBottom: '24px' }}>{data.education.map((edu, i) => (
    <div key={i} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: '2px solid #e0e0e0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
        <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap' }}>{edu.period}</span>
      </div>
      <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0', fontStyle: 'italic' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
    </div>
  ))}</div>
}
