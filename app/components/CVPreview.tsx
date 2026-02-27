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
        <div ref={cvRef} style={{ width: '210mm', minHeight: '297mm', padding: '20mm 18mm', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#1a1a1a', backgroundColor: '#ffffff', fontSize: '10pt', lineHeight: '1.5', boxSizing: 'border-box' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '3px solid #2c3e50', paddingBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '26pt', fontWeight: 700, color: '#2c3e50', margin: '0 0 2px 0', letterSpacing: '-0.5px' }}>{p.name}</h1>
              <p style={{ fontSize: '11pt', color: '#7f8c8d', margin: 0, fontWeight: 400 }}>{data.experience[0]?.title || 'Fachkraft'}</p>
            </div>
            {photo && (
              <div style={{ width: '90px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #ecf0f1', flexShrink: 0, marginLeft: '20px' }}>
                <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Two columns */}
          <div style={{ display: 'flex', gap: '30px' }}>

            {/* Left sidebar */}
            <div style={{ width: '170px', flexShrink: 0 }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1.5px solid #bdc3c7' }}>Kontakt</h2>
                <div style={{ fontSize: '9pt', color: '#555' }}>
                  <p style={{ margin: '0 0 4px 0' }}>📍 {p.address}</p>
                  <p style={{ margin: '0 0 4px 0' }}>📞 {p.phone}</p>
                  <p style={{ margin: '0 0 4px 0', wordBreak: 'break-all' }}>✉️ {p.email}</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1.5px solid #bdc3c7' }}>Persönliche Daten</h2>
                <div style={{ fontSize: '9pt', color: '#555' }}>
                  <p style={{ margin: '0 0 4px 0' }}>Geburtsdatum: {p.birthdate}</p>
                  <p style={{ margin: '0 0 4px 0' }}>Nationalität: {p.nationality}</p>
                  {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ margin: '0 0 4px 0' }}>Führerschein: {p.drivingLicense}</p>}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '9pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1.5px solid #bdc3c7' }}>Sprachen</h2>
                <div style={{ fontSize: '9pt', color: '#555' }}>
                  {data.languages.map((lang, i) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600 }}>{lang.language}</span>
                      <br />
                      <span style={{ fontSize: '8pt', color: '#888' }}>{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {data.skills.soft.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '9pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '4px', borderBottom: '1.5px solid #bdc3c7' }}>Kompetenzen</h2>
                  <div style={{ fontSize: '9pt', color: '#555' }}>
                    {data.skills.soft.map((s, i) => (
                      <p key={i} style={{ margin: '0 0 3px 0' }}>• {s}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right main */}
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', paddingBottom: '6px', borderBottom: '1.5px solid #bdc3c7' }}>Berufserfahrung</h2>
                {data.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
                      <span style={{ fontSize: '8.5pt', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.period}</span>
                    </div>
                    <p style={{ fontSize: '9pt', color: '#7f8c8d', margin: '1px 0 6px 0', fontStyle: 'italic' }}>{exp.company}</p>
                    {exp.tasks.map((task, j) => (
                      <p key={j} style={{ fontSize: '9pt', color: '#555', margin: '0 0 2px 0', paddingLeft: '10px' }}>• {task}</p>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', paddingBottom: '6px', borderBottom: '1.5px solid #bdc3c7' }}>Ausbildung</h2>
                {data.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
                      <span style={{ fontSize: '8.5pt', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.period}</span>
                    </div>
                    <p style={{ fontSize: '9pt', color: '#7f8c8d', margin: '1px 0 0 0', fontStyle: 'italic' }}>{edu.school}</p>
                  </div>
                ))}
              </div>

              {data.skills.technical.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', paddingBottom: '6px', borderBottom: '1.5px solid #bdc3c7' }}>Fachkenntnisse</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {data.skills.technical.map((s, i) => (
                      <span key={i} style={{ fontSize: '8.5pt', backgroundColor: '#f0f3f5', color: '#2c3e50', padding: '3px 10px', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1.5px solid #bdc3c7' }}>Referenzen</h2>
                <p style={{ fontSize: '9pt', color: '#888', fontStyle: 'italic' }}>Auf Anfrage erhältlich</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-xs text-center mt-4">
        💡 PDF bude ve formátu A4, připravený k tisku nebo odeslání emailem
      </p>
    </div>
  )
}
