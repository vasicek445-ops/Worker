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
  experience: Array<{
    period: string
    title: string
    company: string
    location?: string
    tasks: string[]
  }>
  education: Array<{
    period: string
    school: string
    degree: string
    location?: string
  }>
  languages: Array<{
    language: string
    level: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
  certifications?: string[]
}

interface CVPreviewProps {
  data: CVData
  photo: string | null
  template: 'klassisch' | 'modern' | 'kreativ'
  accentColor: string
}

function getLangLevel(level: string): number {
  const l = level.toLowerCase()
  if (l.includes('mutter') || l.includes('c2')) return 5
  if (l.includes('c1') || l.includes('verhandlung')) return 5
  if (l.includes('b2') || l.includes('fließend')) return 4
  if (l.includes('b1') || l.includes('fortgeschritten')) return 3
  if (l.includes('a2') || l.includes('grund')) return 2
  return 1
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
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      } as any).from(cvRef.current).save()
    } catch (err) {
      console.error('PDF error:', err)
      alert('Chyba při generování PDF.')
    } finally {
      setDownloading(false)
    }
  }

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
        <div ref={cvRef}>
          {template === 'klassisch' && <KlassischTemplate data={data} photo={photo} color={accentColor} />}
          {template === 'modern' && <ModernTemplate data={data} photo={photo} color={accentColor} />}
          {template === 'kreativ' && <KreativTemplate data={data} photo={photo} color={accentColor} />}
        </div>
      </div>

      <p className="text-gray-500 text-xs text-center mt-4">💡 PDF ve formátu A4, připravený k tisku nebo odeslání emailem</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE 1: KLASSISCH – Dark sidebar (stávající design)
   ═══════════════════════════════════════════════════════════ */
function KlassischTemplate({ data, photo, color }: { data: CVData; photo: string | null; color: string }) {
  const p = data.personalData
  const muted = '#95a5a6'

  return (
    <div style={{ width: '210mm', minHeight: '297mm', display: 'flex', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '9.5pt', lineHeight: '1.45' }}>
      {/* Sidebar */}
      <div style={{ width: '75mm', backgroundColor: color, color: '#ecf0f1', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 22px 20px', textAlign: 'center' }}>
          {photo ? (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.3)' }}>
              <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px', backgroundColor: 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '32pt', color: 'rgba(255,255,255,0.3)' }}>👤</span>
            </div>
          )}
          <h1 style={{ fontSize: '18pt', fontWeight: 700, margin: '0 0 2px', color: '#fff' }}>{p.name}</h1>
          <p style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />

        <SidebarSection title="Kontakt">
          {p.address && <SidebarItem icon="📍" text={p.address} />}
          <SidebarItem icon="📞" text={p.phone} />
          <SidebarItem icon="✉️" text={p.email} small />
        </SidebarSection>

        <SidebarDivider />

        <SidebarSection title="Persönliche Daten">
          <p style={{ margin: '0 0 5px', fontSize: '8.5pt', color: '#ddd' }}>Geburtsdatum: {p.birthdate}</p>
          <p style={{ margin: '0 0 5px', fontSize: '8.5pt', color: '#ddd' }}>Nationalität: {p.nationality}</p>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ margin: 0, fontSize: '8.5pt', color: '#ddd' }}>Führerschein: {p.drivingLicense}</p>}
        </SidebarSection>

        <SidebarDivider />
        <LanguageBars languages={data.languages} style="light" />
        <SidebarDivider />

        {data.skills.soft.length > 0 && (
          <SidebarSection title="Kompetenzen">
            {data.skills.soft.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                <span style={{ fontSize: '8.5pt', color: '#ddd' }}>{s}</span>
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '28px 28px 28px 30px', color: '#333', backgroundColor: '#fff' }}>
        {data.profil && <ProfilSection text={data.profil} color={color} />}
        <ExperienceSection data={data} color={color} />
        <EducationSection data={data} color={color} />
        <SkillTags skills={data.skills.technical} color={color} />
        {data.certifications && data.certifications.length > 0 && <CertSection certs={data.certifications} color={color} />}
        <RefSection color={color} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE 2: MODERN – Clean white, color accent top bar
   ═══════════════════════════════════════════════════════════ */
function ModernTemplate({ data, photo, color }: { data: CVData; photo: string | null; color: string }) {
  const p = data.personalData

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      {/* Top accent bar */}
      <div style={{ height: '8px', backgroundColor: color }} />

      {/* Header */}
      <div style={{ padding: '30px 35px 24px', display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '1px solid #eee' }}>
        {photo && (
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${color}`, flexShrink: 0 }}>
            <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px', letterSpacing: '-0.5px' }}>{p.name}</h1>
          <p style={{ fontSize: '11pt', color: color, margin: '0 0 8px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '8.5pt', color: '#888' }}>
            {p.address && <span>📍 {p.address}</span>}
            <span>📞 {p.phone}</span>
            <span>✉️ {p.email}</span>
            {p.drivingLicense && p.drivingLicense !== 'žádný' && <span>🚗 {p.drivingLicense}</span>}
          </div>
        </div>
      </div>

      {/* Profil */}
      {data.profil && (
        <div style={{ padding: '20px 35px', borderBottom: '1px solid #eee', backgroundColor: '#fafbfc' }}>
          <p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>{data.profil}</p>
        </div>
      )}

      {/* Two column body */}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        {/* Left - main */}
        <div style={{ flex: 1 }}>
          <ModernSectionTitle title="Berufserfahrung" color={color} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: '#aaa', whiteSpace: 'nowrap', fontWeight: 500 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: color, margin: '1px 0 6px', fontWeight: 500 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => (
                <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ color: color, fontSize: '6pt', marginTop: '4px', flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span>
                </div>
              ))}
            </div>
          ))}

          <ModernSectionTitle title="Ausbildung" color={color} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
                <span style={{ fontSize: '8pt', color: '#aaa', whiteSpace: 'nowrap', fontWeight: 500 }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: color, margin: '1px 0 0', fontWeight: 500 }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
            </div>
          ))}

          {data.certifications && data.certifications.length > 0 && (
            <>
              <ModernSectionTitle title="Zertifikate" color={color} />
              {data.certifications.map((c, i) => (
                <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {c}</p>
              ))}
            </>
          )}
        </div>

        {/* Right - sidebar */}
        <div style={{ width: '155px', flexShrink: 0 }}>
          <ModernSectionTitle title="Sprachen" color={color} />
          {data.languages.map((lang, i) => {
            const lv = getLangLevel(lang.level)
            return (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: '#333' }}>{lang.language}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: d <= lv ? color : '#e8e8e8' }} />
                  ))}
                </div>
                <span style={{ fontSize: '7pt', color: '#aaa' }}>{lang.level}</span>
              </div>
            )
          })}

          <ModernSectionTitle title="Fachkenntnisse" color={color} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {data.skills.technical.map((s, i) => (
              <span key={i} style={{ fontSize: '7.5pt', backgroundColor: `${color}12`, color: color, padding: '3px 8px', borderRadius: '12px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>

          {data.skills.soft.length > 0 && (
            <>
              <ModernSectionTitle title="Kompetenzen" color={color} />
              {data.skills.soft.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '8pt', color: '#666' }}>{s}</span>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '7.5pt', color: '#999', margin: '0 0 3px' }}>Geburtsdatum: {data.personalData.birthdate}</p>
            <p style={{ fontSize: '7.5pt', color: '#999', margin: 0 }}>Nationalität: {data.personalData.nationality}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 35px', borderTop: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TEMPLATE 3: KREATIV – Bold header banner
   ═══════════════════════════════════════════════════════════ */
function KreativTemplate({ data, photo, color }: { data: CVData; photo: string | null; color: string }) {
  const p = data.personalData

  return (
    <div style={{ width: '210mm', minHeight: '297mm', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      {/* Hero banner */}
      <div style={{ backgroundColor: color, padding: '35px 35px 30px', display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: '60px', bottom: '-30px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }} />

        {photo && (
          <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <img src={photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28pt', fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{p.name}</h1>
          <p style={{ fontSize: '12pt', color: 'rgba(255,255,255,0.8)', margin: '0 0 10px', fontWeight: 300, letterSpacing: '3px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '8.5pt', color: 'rgba(255,255,255,0.7)' }}>
            {p.address && <span>📍 {p.address}</span>}
            <span>📞 {p.phone}</span>
            <span>✉️ {p.email}</span>
          </div>
        </div>
      </div>

      {/* Profil bar */}
      {data.profil && (
        <div style={{ padding: '16px 35px', backgroundColor: '#f8f9fa', borderBottom: `2px solid ${color}` }}>
          <p style={{ fontSize: '9.5pt', color: '#555', lineHeight: '1.6', margin: 0 }}>"{data.profil}"</p>
        </div>
      )}

      {/* Body - 2 columns */}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <KreativSectionTitle title="Berufserfahrung" color={color} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '18px', position: 'relative', paddingLeft: '20px' }}>
              <div style={{ position: 'absolute', left: 0, top: '4px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: i === 0 ? color : '#ddd', border: `2px solid ${i === 0 ? color : '#ddd'}` }} />
              {i < data.experience.length - 1 && <div style={{ position: 'absolute', left: '4px', top: '18px', width: '2px', height: 'calc(100% + 4px)', backgroundColor: '#eee' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: '#aaa', whiteSpace: 'nowrap', fontWeight: 500, backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: color, margin: '2px 0 6px', fontWeight: 600 }}>{exp.company}</p>
              {exp.tasks.map((t, j) => (
                <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ color: color, fontSize: '8pt', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span>
                </div>
              ))}
            </div>
          ))}

          <KreativSectionTitle title="Ausbildung" color={color} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px', paddingLeft: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: '4px', width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ddd' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
                <span style={{ fontSize: '8pt', color: '#aaa', fontWeight: 500, backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0' }}>{edu.school}</p>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ width: '160px', flexShrink: 0 }}>
          <KreativSectionTitle title="Sprachen" color={color} />
          {data.languages.map((lang, i) => {
            const lv = getLangLevel(lang.level)
            return (
              <div key={i} style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '8.5pt', fontWeight: 700, color: '#333' }}>{lang.language}</span>
                <div style={{ display: 'flex', gap: '4px', margin: '4px 0 2px' }}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <div key={d} style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: d <= lv ? color : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {d <= lv && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '7pt', color: '#aaa' }}>{lang.level}</span>
              </div>
            )
          })}

          <KreativSectionTitle title="Skills" color={color} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {data.skills.technical.map((s, i) => (
              <span key={i} style={{ fontSize: '7.5pt', backgroundColor: color, color: '#fff', padding: '4px 10px', borderRadius: '14px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>

          {data.skills.soft.length > 0 && (
            <>
              <KreativSectionTitle title="Stärken" color={color} />
              {data.skills.soft.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <span style={{ color: color, fontSize: '10pt' }}>✦</span>
                  <span style={{ fontSize: '8pt', color: '#555' }}>{s}</span>
                </div>
              ))}
            </>
          )}

          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: color, borderRadius: '10px', color: '#fff' }}>
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

/* ═══════════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 22px' }}>
      <h2 style={{ fontSize: '8pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '12px', color: '#95a5a6' }}>{title}</h2>
      {children}
    </div>
  )
}

function SidebarItem({ icon, text, small }: { icon: string; text: string; small?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
      <span style={{ flexShrink: 0, width: '14px', textAlign: 'center', fontSize: '9pt' }}>{icon}</span>
      <span style={{ color: '#ddd', fontSize: small ? '8pt' : '8.5pt', wordBreak: small ? 'break-all' as const : undefined }}>{text}</span>
    </div>
  )
}

function SidebarDivider() {
  return <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 22px' }} />
}

function LanguageBars({ languages, style }: { languages: CVData['languages']; style: 'light' | 'dark' }) {
  const isLight = style === 'light'
  return (
    <SidebarSection title="Sprachen">
      {languages.map((lang, i) => {
        const lv = getLangLevel(lang.level)
        return (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '8.5pt', color: isLight ? '#fff' : '#333' }}>{lang.language}</span>
              <span style={{ fontSize: '7.5pt', color: isLight ? '#95a5a6' : '#aaa' }}>{lang.level}</span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1, 2, 3, 4, 5].map((d) => (
                <div key={d} style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: d <= lv ? (isLight ? '#fff' : '#333') : (isLight ? 'rgba(255,255,255,0.15)' : '#e8e8e8') }} />
              ))}
            </div>
          </div>
        )
      })}
    </SidebarSection>
  )
}

function ProfilSection({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Profil</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '12px', borderRadius: '2px' }} />
      <p style={{ fontSize: '9pt', color: '#666', lineHeight: '1.6', margin: 0 }}>{text}</p>
    </div>
  )
}

function ExperienceSection({ data, color }: { data: CVData; color: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Berufserfahrung</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
      {data.experience.map((exp, i) => (
        <div key={i} style={{ marginBottom: '18px', paddingLeft: '14px', borderLeft: `2px solid ${i === 0 ? color : '#e0e0e0'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{exp.title}</h3>
            <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap', marginLeft: '10px', fontWeight: 500 }}>{exp.period}</span>
          </div>
          <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 7px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
          {exp.tasks.map((t, j) => (
            <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
              <span style={{ color, fontSize: '7pt', marginTop: '3px', flexShrink: 0 }}>●</span>
              <span style={{ fontSize: '8.5pt', color: '#555' }}>{t}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function EducationSection({ data, color }: { data: CVData; color: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Ausbildung</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
      {data.education.map((edu, i) => (
        <div key={i} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: '2px solid #e0e0e0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#2c3e50' }}>{edu.degree}</h3>
            <span style={{ fontSize: '8pt', color: '#999', whiteSpace: 'nowrap', fontWeight: 500 }}>{edu.period}</span>
          </div>
          <p style={{ fontSize: '8.5pt', color: '#888', margin: '1px 0 0', fontStyle: 'italic' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
        </div>
      ))}
    </div>
  )
}

function SkillTags({ skills, color }: { skills: string[]; color: string }) {
  if (!skills.length) return null
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Fachkenntnisse</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '18px', borderRadius: '2px' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
        {skills.map((s, i) => (
          <span key={i} style={{ fontSize: '8pt', backgroundColor: '#f4f6f7', color: '#2c3e50', padding: '5px 12px', borderRadius: '20px', fontWeight: 500, border: '1px solid #e8ecee' }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function CertSection({ certs, color }: { certs: string[]; color: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Zertifikate</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '14px', borderRadius: '2px' }} />
      {certs.map((c, i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {c}</p>)}
    </div>
  )
}

function RefSection({ color }: { color: string }) {
  return (
    <div>
      <h2 style={{ fontSize: '11pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px' }}>Referenzen</h2>
      <div style={{ height: '2.5px', backgroundColor: color, width: '40px', marginBottom: '14px', borderRadius: '2px' }} />
      <p style={{ fontSize: '9pt', color: '#999', fontStyle: 'italic' }}>Auf Anfrage erhältlich</p>
    </div>
  )
}

function ModernSectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ marginBottom: '14px', marginTop: '16px' }}>
      <h2 style={{ fontSize: '10pt', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>{title}</h2>
      <div style={{ height: '2px', backgroundColor: color, width: '30px', borderRadius: '1px' }} />
    </div>
  )
}

function KreativSectionTitle({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ marginBottom: '12px', marginTop: '18px' }}>
      <h2 style={{ fontSize: '10pt', fontWeight: 800, color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{title}</h2>
      <div style={{ height: '3px', backgroundColor: color, width: '25px', borderRadius: '2px' }} />
    </div>
  )
}
