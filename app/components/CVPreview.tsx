'use client'

import { useRef, useState } from 'react'

interface CVData {
  personalData: {
    name: string
    birthdate: string
    nationality: string
    address: string
    phone: string
    email: string
    drivingLicense?: string
  }
  experience: Array<{
    period: string
    title: string
    company: string
    tasks: string[]
  }>
  education: Array<{
    period: string
    school: string
    degree: string
  }>
  languages: Array<{
    language: string
    level: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
}

interface CVPreviewProps {
  data: CVData
  photo: string | null
}

function getLanguageLevel(level: string): number {
  const l = level.toLowerCase()
  if (l.includes('mutter') || l.includes('c2')) return 5
  if (l.includes('c1') || l.includes('fließend')) return 4
  if (l.includes('b2')) return 4
  if (l.includes('b1')) return 3
  if (l.includes('a2') || l.includes('grund')) return 2
  if (l.includes('a1')) return 1
  return 1
}

export default function CVPreview({ data, photo }: CVPreviewProps) {
  const cvRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cvRef.current) return
    setDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin: 0,
        filename: `Lebenslauf_${data.personalData.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }
      await html2pdf().set(opt as any).from(cvRef.current).save()
    } catch (err) {
      console.error('PDF error:', err)
      alert('Chyba při generování PDF. Zkus to znovu.')
    } finally {
      setDownloading(false)
    }
  }

  const p = data.personalData
  const ACCENT = '#2c3e50'
  const SIDEBAR_BG = '#2c3e50'
  const SIDEBAR_MUTED = '#95a5a6'
  const MAIN_BG = '#ffffff'

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={handleDownload} disabled={downloading} className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {downloading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generuji PDF...
            </span>
          ) : '📥 Stáhnout jako PDF'}
        </button>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ overflowX: 'auto' }}>
        <div ref={cvRef} style={{ width: '210mm', minHeight: '297mm', display: 'flex', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#333', backgroundColor: MAIN_BG, fontSize: '9.5pt', lineHeight: '1.45', boxSizing: 'border-box' }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: '75mm', backgroundColor: SIDEBAR_BG, color: '#ecf0f1', padding: '0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '28px 22px 20px 22px', textAlign: 'center' }}>
              {photo ? (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px auto', border: '3px solid rgba(255,255,255,0.3)' }}>
                  <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px auto', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '32pt', color: 'rgba(255,255,255,0.3)' }}>👤</span>
                </div>
              )}
              <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: '0 0 2px 0', letterSpacing: '0.5px', color: '#fff' }}>{p.name}</h1>
              <p style={{ fontSize: '9.5pt', color: SIDEBAR_MUTED, margin: 0, fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {data.experience[0]?.title || 'Fachkraft'}
              </p>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />

            <div style={{ padding: '18px 22px' }}>
              <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '12px', color: SIDEBAR_MUTED }}>Kontakt</h2>
              <div style={{ fontSize: '8.5pt' }}>
                {p.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: SIDEBAR_MUTED, flexShrink: 0, width: '14px', textAlign: 'center', fontSize: '9pt' }}>📍</span>
                    <span style={{ color: '#ddd' }}>{p.address}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: SIDEBAR_MUTED, flexShrink: 0, width: '14px', textAlign: 'center', fontSize: '9pt' }}>📞</span>
                  <span style={{ color: '#ddd' }}>{p.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: SIDEBAR_MUTED, flexShrink: 0, width: '14px', textAlign: 'center', fontSize: '9pt' }}>✉️</span>
                  <span style={{ color: '#ddd', wordBreak: 'break-all', fontSize: '8pt' }}>{p.email}</span>
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />

            <div style={{ padding: '18px 22px' }}>
              <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '12px', color: SIDEBAR_MUTED }}>Persönliche Daten</h2>
              <div style={{ fontSize: '8.5pt', color: '#ddd' }}>
                <p style={{ margin: '0 0 5px 0' }}>Geburtsdatum: {p.birthdate}</p>
                <p style={{ margin: '0 0 5px 0' }}>Nationalität: {p.nationality}</p>
                {p.drivingLicense && p.drivingLicense !== 'žádný' && (
                  <p style={{ margin: '0 0 5px 0' }}>Führerschein: {p.drivingLicense}</p>
                )}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />

            <div style={{ padding: '18px 22px' }}>
              <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '14px', color: SIDEBAR_MUTED }}>Sprachen</h2>
              {data.languages.map((lang, i) => {
                const level = getLanguageLevel(lang.level)
                return (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '8.5pt', color: '#fff' }}>{lang.language}</span>
                      <span style={{ fontSize: '7.5pt', color: SIDEBAR_MUTED }}>{lang.level}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <div key={dot} style={{
                          width: '100%',
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor: dot <= level ? '#fff' : 'rgba(255,255,255,0.15)',
                        }} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />

            {data.skills.soft.length > 0 && (
              <div style={{ padding: '18px 22px' }}>
                <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '12px', color: SIDEBAR_MUTED }}>Kompetenzen</h2>
                <div style={{ fontSize: '8.5pt', color: '#ddd' }}>
                  {data.skills.soft.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: SIDEBAR_MUTED, flexShrink: 0 }} />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT MAIN CONTENT */}
          <div style={{ flex: 1, padding: '28px 28px 28px 30px' }}>

            <div style={{ marginBottom: '26px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Berufserfahrung</h2>
              <div style={{ height: '2.5px', backgroundColor: ACCENT, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '18px', paddingLeft: '14px', borderLeft: `2px solid ${i === 0 ? ACCENT : '#e0e0e0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
                    <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap', marginLeft: '10px', fontWeight: 500 }}>{exp.period}</span>
                  </div>
                  <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 7px 0', fontStyle: 'italic' }}>{exp.company}</p>
                  {exp.tasks.map((task, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ color: ACCENT, fontSize: '7pt', marginTop: '3px', flexShrink: 0 }}>●</span>
                      <span style={{ fontSize: '8.5pt', color: '#555' }}>{task}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '26px' }}>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Ausbildung</h2>
              <div style={{ height: '2.5px', backgroundColor: ACCENT, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: '2px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
                    <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap', marginLeft: '10px', fontWeight: 500 }}>{edu.period}</span>
                  </div>
                  <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0 0', fontStyle: 'italic' }}>{edu.school}</p>
                </div>
              ))}
            </div>

            {data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '26px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Fachkenntnisse</h2>
                <div style={{ height: '2.5px', backgroundColor: ACCENT, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {data.skills.technical.map((s, i) => (
                    <span key={i} style={{
                      fontSize: '8pt',
                      backgroundColor: '#f4f6f7',
                      color: ACCENT,
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontWeight: 500,
                      border: '1px solid #e8ecee',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '11pt', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Referenzen</h2>
              <div style={{ height: '2.5px', backgroundColor: ACCENT, width: '40px', marginBottom: '14px', borderRadius: '2px' }} />
              <p style={{ fontSize: '9pt', color: '#999', fontStyle: 'italic' }}>Auf Anfrage erhältlich</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-xs text-center mt-4">
        💡 PDF ve formátu A4, připravený k tisku nebo odeslání emailem
      </p>
    </div>
  )
}
