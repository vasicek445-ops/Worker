'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../../supabase'
import { useSubscription } from '../../../../../hooks/useSubscription'
import PaywallOverlay from '../../../../components/PaywallOverlay'
import CVBuilderLayout from '../../../../components/cv/CVBuilderLayout'
import BasicsSection from '../../../../components/cv/sections/BasicsSection'
import PositionSection from '../../../../components/cv/sections/PositionSection'
import ExperienceSection from '../../../../components/cv/sections/ExperienceSection'
import EducationSection from '../../../../components/cv/sections/EducationSection'
import LanguagesSection from '../../../../components/cv/sections/LanguagesSection'
import SkillsSection from '../../../../components/cv/sections/SkillsSection'
import AIDropdown from '../../../../components/cv/AIDropdown'
import { getTemplateById } from '../../../../../lib/cv/templates'
import type { CVData, CVFormData, SectionId } from '../../../../../lib/cv/types'

function CVEditorInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initialTemplate = params.get('template') || 'klassisch'
  const documentId = params.get('documentId')

  const { isActive, loading: subLoading } = useSubscription()

  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string>('')
  const [authChecked, setAuthChecked] = useState(false)

  const [formData, setFormData] = useState<CVFormData>({})
  const [photo, setPhoto] = useState<string | null>(null)
  const [template, setTemplate] = useState<string>(initialTemplate)
  const [accentColor, setAccentColor] = useState<string>(() => getTemplateById(initialTemplate)?.defaultColor || '#1e293b')
  const [activeSection, setActiveSection] = useState<SectionId>('basics')
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(documentId)

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Auth + load
  useEffect(() => {
    let cancelled = false
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace(`/prihlaseni?next=/pruvodce/sablony/cv/editor?template=${initialTemplate}`)
        return
      }
      if (cancelled) return
      setUserId(session.user.id)
      setAccessToken(session.access_token)
      setAuthChecked(true)

      // Vzdy nactime profil paralelne — slouzi jako fallback pro pole co nemusi
      // byt v saved CV (hlavne avatar_url -> foto).
      // POZN: profiles tabulka v produkci NEMA sloupec 'email' (auth email je v auth.users).
      // Pro contact email pouzivame session.user.email jako fallback.
      const profilePromise = supabase
        .from('profiles')
        .select('full_name, telefon, datum_narozeni, adresa, nationality, ridicky_prukaz, pozice, obor, zkusenosti, vzdelani, experiences, educations, dovednosti, nemcina_uroven, dalsi_jazyky, dalsi_jazyky_struct, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle()

      // Auto-load: pokud existuje saved CV, načti ho
      if (documentId) {
        try {
          const [docRes, profileRes] = await Promise.all([
            fetch(`/api/documents?id=${documentId}`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }),
            profilePromise,
          ])
          const profile = profileRes.data
          if (docRes.ok) {
            const doc = await docRes.json()
            // DEBUG: log saved doc data + profile fallback
            console.log('[CV Editor] Init documentId branch — saved doc:', doc, 'profile fallback:', profile)
            if (doc?.document_data && !cancelled) {
              const cv: CVData = doc.document_data
              setCvData(cv)
              // Mapuj CVData -> CVFormData aby form fieldy nalevo byly take prefilled,
              // jinak user vidi pravy preview se svym CV ale na leve strane prazdne placeholdery.
              setFormData((f) => ({
                ...f,
                name: cv.personalData?.name || f.name,
                birthdate: cv.personalData?.birthdate || f.birthdate,
                phone: cv.personalData?.phone || f.phone,
                email: cv.personalData?.email || f.email,
                nationality: cv.personalData?.nationality || f.nationality,
                address: cv.personalData?.address || f.address,
                driving: cv.personalData?.drivingLicense || f.driving,
                position: cv.profil || f.position,
                experiences: (cv.experience || []).map((e, i: number) => ({
                  id: `doc-exp-${i}-${Date.now()}`,
                  period: e.period || '',
                  title: e.title || '',
                  company: e.company || '',
                  location: e.location || '',
                  description: (e.tasks || []).join('\n'),
                })),
                educations: (cv.education || []).map((e, i: number) => ({
                  id: `doc-edu-${i}-${Date.now()}`,
                  period: e.period || '',
                  school: e.school || '',
                  degree: e.degree || '',
                  location: e.location || '',
                })),
                german: cv.languages?.find((l) => /n[ěe]m|deutsch|german/i.test(l.language))?.level || f.german,
                other_languages: (cv.languages || [])
                  .filter((l) => !/n[ěe]m|deutsch|german/i.test(l.language))
                  .map((l) => l.level ? `${l.language}-${l.level}` : l.language)
                  .join(', ') || f.other_languages,
                skills: (cv.skills?.technical || []).join(', ') || f.skills,
              }))
              if (doc.template) setTemplate(doc.template)
              if (doc.accent_color) setAccentColor(doc.accent_color)
              // Foto: doc.photo > profile.avatar_url > null
              if (doc.photo) {
                setPhoto(doc.photo)
              } else if (profile?.avatar_url) {
                setPhoto(profile.avatar_url)
              }
            }
          }
        } catch { /* ignore */ }
      } else {
        // Prefill z profilu — pouzivame skutecne nazvy sloupcu z profiles tabulky
        // (full_name, telefon, datum_narozeni, adresa, ...). Mapujeme vsechny dostupne
        // CV-relevantni pole vcetne zkusenosti, vzdelani, jazyku a dovednosti.
        try {
          const { data: profile, error: profErr } = await profilePromise
          // DEBUG: log do console pro autofill debugging (smaz po vyreseni)
          console.log('[CV Editor] Profile autofill data:', profile, 'error:', profErr)
          if (profile && !cancelled) {
            // Auth email jako fallback pro contact email
            const contactEmail = session.user.email || ''
            // Strukturovana data maji prednost; legacy text jako fallback pokud strukt prazdne.
            // CVFormData vyzaduje `id` per radek — pridame ho pri mapping.
            const structExperiences = Array.isArray(profile.experiences)
              ? profile.experiences.map((e, i: number) => ({
                  id: `prof-exp-${i}-${Date.now()}`,
                  period: e.period || '',
                  title: e.title || '',
                  company: e.company || '',
                  location: e.location || '',
                  description: e.description || '',
                }))
              : []
            const structEducations = Array.isArray(profile.educations)
              ? profile.educations.map((e, i: number) => ({
                  id: `prof-edu-${i}-${Date.now()}`,
                  period: e.period || '',
                  school: e.school || '',
                  degree: e.degree || '',
                  location: e.location || '',
                }))
              : []
            setFormData((f) => ({
              ...f,
              name: profile.full_name || f.name,
              email: contactEmail || f.email,
              phone: profile.telefon || f.phone,
              birthdate: profile.datum_narozeni || f.birthdate,
              address: profile.adresa || f.address,
              nationality: profile.nationality || f.nationality,
              driving: profile.ridicky_prukaz || f.driving,
              position: profile.pozice || f.position,
              field: profile.obor || f.field,
              experiences: structExperiences.length > 0 ? structExperiences : f.experiences,
              educations: structEducations.length > 0 ? structEducations : f.educations,
              experience_detail: structExperiences.length === 0 ? (profile.zkusenosti || f.experience_detail) : f.experience_detail,
              education: structEducations.length === 0 ? (profile.vzdelani || f.education) : f.education,
              german: profile.nemcina_uroven || f.german,
              other_languages: (Array.isArray(profile.dalsi_jazyky_struct) && profile.dalsi_jazyky_struct.length > 0)
                ? profile.dalsi_jazyky_struct.map((l) => l.level ? `${l.language}-${l.level}` : l.language).join(', ')
                : (profile.dalsi_jazyky || f.other_languages),
              skills: profile.dovednosti || f.skills,
            }))
            // Avatar jako foto na CV (pokud user nezvolil jine)
            if (profile.avatar_url && !cancelled) {
              setPhoto((p) => p || profile.avatar_url || null)
            }
          }
        } catch { /* ignore */ }
      }
    }
    init()
    return () => { cancelled = true }
  }, [router, documentId, initialTemplate])

  const updateForm = useCallback((updates: Partial<CVFormData>) => {
    setFormData((f) => ({ ...f, ...updates }))
  }, [])

  const handleSectionChange = useCallback((key: keyof CVFormData, value: unknown) => {
    setFormData((f) => ({ ...f, [key]: value }))
  }, [])

  // ─── Aktualizovat z profilu — pull latest profile data + merge do formData ───
  // Useful kdyz user otevre starsi saved CV a mezitim doplnil profil (nove experiences atd).
  // Profile data dostanou prednost — prepise existujici hodnoty ve formData.
  const handleSyncFromProfile = useCallback(async () => {
    if (!userId) return
    setSyncing(true); setError(null)
    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('full_name, telefon, datum_narozeni, adresa, nationality, ridicky_prukaz, pozice, obor, zkusenosti, vzdelani, experiences, educations, dovednosti, nemcina_uroven, dalsi_jazyky, dalsi_jazyky_struct, avatar_url')
        .eq('id', userId)
        .maybeSingle()
      // DEBUG: log Z profilu sync data (smaz po vyreseni)
      console.log('[CV Editor] Z profilu sync — profile data:', profile, 'error:', profErr)
      if (profErr) throw profErr
      if (!profile) {
        setError('Profil je prázdný. Vyplň ho v sekci Profil.')
        return
      }
      // profiles.email neexistuje → auth email
      const { data: { session } } = await supabase.auth.getSession()
      const contactEmail = session?.user?.email || ''
      const structExperiences = Array.isArray(profile.experiences)
        ? profile.experiences.map((e, i: number) => ({
            id: `sync-exp-${i}-${Date.now()}`,
            period: e.period || '',
            title: e.title || '',
            company: e.company || '',
            location: e.location || '',
            description: e.description || '',
          }))
        : []
      const structEducations = Array.isArray(profile.educations)
        ? profile.educations.map((e, i: number) => ({
            id: `sync-edu-${i}-${Date.now()}`,
            period: e.period || '',
            school: e.school || '',
            degree: e.degree || '',
            location: e.location || '',
          }))
        : []
      // Override: prefer profile data over existing formData (na rozdil od init prefill).
      setFormData((f) => ({
        ...f,
        name: profile.full_name || f.name,
        email: contactEmail || f.email,
        phone: profile.telefon || f.phone,
        birthdate: profile.datum_narozeni || f.birthdate,
        address: profile.adresa || f.address,
        nationality: profile.nationality || f.nationality,
        driving: profile.ridicky_prukaz || f.driving,
        position: profile.pozice || f.position,
        field: profile.obor || f.field,
        experiences: structExperiences.length > 0 ? structExperiences : f.experiences,
        educations: structEducations.length > 0 ? structEducations : f.educations,
        experience_detail: structExperiences.length === 0 ? (profile.zkusenosti || f.experience_detail) : f.experience_detail,
        education: structEducations.length === 0 ? (profile.vzdelani || f.education) : f.education,
        german: profile.nemcina_uroven || f.german,
        other_languages: (Array.isArray(profile.dalsi_jazyky_struct) && profile.dalsi_jazyky_struct.length > 0)
          ? profile.dalsi_jazyky_struct.map((l) => l.level ? `${l.language}-${l.level}` : l.language).join(', ')
          : (profile.dalsi_jazyky || f.other_languages),
        skills: profile.dovednosti || f.skills,
      }))
      if (!photo && profile.avatar_url) setPhoto(profile.avatar_url)
      // Reset cvData — uzivatel musi znovu kliknout "Vygenerovat AI CV" aby se preview obnovil
      setCvData(null)
      setToast('Data z profilu načtena. Klikni "Vygenerovat AI CV" pro nový náhled.')
      setTimeout(() => setToast(null), 5000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || 'Nepodařilo se načíst profil.')
    } finally {
      setSyncing(false)
    }
  }, [userId, photo])

  // ─── AI generování plnohodnotného CV ───
  const handleGenerate = async () => {
    const required: Array<keyof CVFormData> = ['name', 'birthdate', 'phone', 'email', 'position', 'field', 'german']
    const missing = required.filter((k) => !String(formData[k] || '').trim())
    const hasExp = (formData.experiences && formData.experiences.length > 0) || (formData.experience_detail && formData.experience_detail.length > 10)
    const hasEdu = (formData.educations && formData.educations.length > 0) || (formData.education && formData.education.length > 5)
    if (missing.length > 0 || !hasExp || !hasEdu) {
      setError('Pro AI generování vyplň základ, pozici, zkušenost a vzdělání.')
      setActiveSection(missing.includes('name') ? 'basics' : !hasExp ? 'experience' : !hasEdu ? 'education' : 'basics')
      return
    }
    setGenerating(true); setError(null)
    try {
      // Posilame strukturovana data primarne (experiences[], educations[]) — backend
      // je pouzije v AI promptu jako rich input. Text fallback (experience_detail,
      // education) se posila tez pro pripad ze strukt prazdne nebo legacy clients.
      const payload = {
        formData: {
          name: formData.name || '',
          birthdate: formData.birthdate || '',
          phone: formData.phone || '',
          email: formData.email || '',
          nationality: formData.nationality || '',
          address: formData.address || '',
          driving: formData.driving || '',
          position: formData.position || '',
          field: formData.field || '',
          // Structured arrays (preferovane backendem)
          experiences: formData.experiences || [],
          educations: formData.educations || [],
          // Legacy text fallback (kdyz strukt prazdne nebo z legacy zdroju)
          experience_detail: formData.experience_detail || (formData.experiences || []).map((e) => `${e.period}: ${e.title}, ${e.company}${e.description ? ' — ' + e.description : ''}`).join('\n'),
          education: formData.education || (formData.educations || []).map((e) => `${e.period}: ${e.school} ${e.degree ? '— ' + e.degree : ''}`).join('\n'),
          german: formData.german || '',
          other_languages: formData.other_languages || '',
          skills: formData.skills || '',
        },
      }
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      setCvData(data.cvData)
      setToast('AI vygenerovala profesionální CV! Náhled vpravo.')
      setTimeout(() => setToast(null), 4000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo')
    } finally {
      setGenerating(false)
    }
  }

  // ─── Uložit CV ───
  // CVPreview vola handleSave(html, pdfBlob). html zustava pro pripadny resave,
  // pdfBlob nahrajeme do cv-pdfs/{user}/{docId}.pdf pro Smart Apply attachments.
  const handleSave = async (_html?: string, pdfBlob?: Blob) => {
    if (!userId || !accessToken) return
    if (!cvData) {
      setError('Před uložením klikni na "Vygenerovat AI CV" pro plné zpracování.')
      return
    }
    setSaving(true); setError(null)
    try {
      const title = cvData.personalData?.name
        ? `${cvData.personalData.name} — ${formData.position || 'CV'}`
        : formData.position || 'Životopis'
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          id: activeDocId || undefined,
          type: 'cv',
          title,
          document_data: cvData,
          template,
          accent_color: accentColor,
          photo: photo || undefined,
        }),
      })
      if (!res.ok) throw new Error('Uložení selhalo')
      const data = await res.json()
      if (data.id) {
        setActiveDocId(data.id)
        // Upload PDF do Supabase storage (cv-pdfs bucket), aby Smart Apply send
        // ho mohl pripojit. Bez tohoto saved_documents existuje ale PDF v storage neni.
        if (pdfBlob) {
          try {
            const pdfForm = new FormData()
            pdfForm.append('file', pdfBlob, 'cv.pdf')
            pdfForm.append('documentId', String(data.id))
            await fetch('/api/cv-pdf', {
              method: 'POST',
              headers: { Authorization: `Bearer ${accessToken}` },
              body: pdfForm,
            })
          } catch { /* upload selhal ale save je OK; user upozornen v Smart Apply */ }
        }
      }
      setToast('CV uloženo. Bude se přikládat k přihláškám přes Smart Apply.')
      setTimeout(() => setToast(null), 3500)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Uložení selhalo')
    } finally {
      setSaving(false)
    }
  }

  // ─── Sdílet jako web URL ───
  const handleShare = async () => {
    if (!activeDocId) {
      setError('Nejdřív CV ulož (tlačítko 💾 Uložit), pak ho můžeš sdílet.')
      return
    }
    setPublishing(true); setError(null)
    try {
      const res = await fetch('/api/cv/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ documentId: activeDocId, action: 'publish' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publikace selhala')
      try {
        await navigator.clipboard.writeText(data.url)
        setToast(`Sdílecí odkaz zkopírovaný: ${data.url}`)
      } catch {
        setToast(`Sdílecí odkaz: ${data.url}`)
      }
      setTimeout(() => setToast(null), 6000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Sdílení selhalo')
    } finally {
      setPublishing(false)
    }
  }

  // ─── Render section content podle activeSection ───
  function renderSection() {
    const aiDropdown = userId && accessToken ? (
      <div className="flex justify-end mb-3">
        <AIDropdown
          section={activeSection}
          formData={formData}
          onUpdate={handleSectionChange}
          userToken={accessToken}
        />
      </div>
    ) : null

    switch (activeSection) {
      case 'basics':
        return (
          <>
            <SectionHeader title="Základ" subtitle="Tvoje osobní údaje. Pole označená * jsou povinná." />
            {aiDropdown}
            <BasicsSection
              formData={formData}
              onChange={handleSectionChange}
              photo={photo}
              onPhotoChange={setPhoto}
            />
          </>
        )
      case 'position':
        return (
          <>
            <SectionHeader title="Cílová pozice" subtitle="Jakou práci hledáš a v jakém oboru." />
            <PositionSection formData={formData} onChange={handleSectionChange} />
          </>
        )
      case 'experience':
        return (
          <>
            <SectionHeader title="Pracovní zkušenosti" subtitle="Přidej své pozice. Pomocí 'Vlož frázi' rychle vložíš profesionální DE bullet pointy." />
            {aiDropdown}
            <ExperienceSection formData={formData} onChange={handleSectionChange} />
          </>
        )
      case 'education':
        return (
          <>
            <SectionHeader title="Vzdělání" subtitle="Školy, výuční listy, kurzy a certifikáty." />
            {aiDropdown}
            <EducationSection formData={formData} onChange={handleSectionChange} />
          </>
        )
      case 'languages':
        return (
          <>
            <SectionHeader title="Jazyky" subtitle="Úroveň němčiny je pro CH nejdůležitější." />
            <LanguagesSection formData={formData} onChange={handleSectionChange} />
          </>
        )
      case 'skills':
        return (
          <>
            <SectionHeader title="Dovednosti" subtitle="Co konkrétně umíš. Použij 'Vlož typické dovednosti' pro tvůj obor." />
            {aiDropdown}
            <SkillsSection formData={formData} onChange={handleSectionChange} />

            {/* AI generování — visible na poslední formulářové sekci */}
            <div className="mt-8 pt-6 border-t border-white/[0.05]">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-[#fb923c] to-[#f97316] text-[#0a0a12] font-extrabold py-4 px-6 rounded-2xl transition-all disabled:opacity-30 hover:shadow-[0_4px_30px_rgba(251,146,60,0.35)] hover:scale-[1.02] active:scale-[0.98]"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="w-5 h-5 border-2 border-[#0a0a12]/30 border-t-[#0a0a12] rounded-full animate-spin" />
                    AI generuje profesionální CV...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    ✨ Vygenerovat profesionální CV s AI
                  </span>
                )}
              </button>
              <p className="text-white/30 text-xs text-center mt-2">AI přeloží do němčiny, rozšíří texty a vytvoří profesionální verzi.</p>
            </div>
          </>
        )
      default:
        return null
    }
  }

  if (!authChecked || subLoading) {
    return <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white/40 text-sm">Načítání…</div>
  }

  return (
    <PaywallOverlay isLocked={!isActive} title="AI šablony jsou součástí Premium" description="Získej profesionální CV ve švýcarském formátu">
      <CVBuilderLayout
        formData={formData}
        onFormChange={updateForm}
        photo={photo}
        onPhotoChange={setPhoto}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        template={template}
        onTemplateChange={setTemplate}
        accentColor={accentColor}
        onColorChange={setAccentColor}
        cvData={cvData}
        onSave={handleSave}
        onShare={cvData ? handleShare : undefined}
        onSyncFromProfile={handleSyncFromProfile}
        syncing={syncing}
        saving={saving || publishing}
      >
        {renderSection()}
      </CVBuilderLayout>

      {/* Toast + error */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e] text-sm px-4 py-2.5 rounded-xl backdrop-blur shadow-lg max-w-[90vw]">
          {toast}
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500/15 border border-red-500/40 text-red-300 text-sm px-4 py-2.5 rounded-xl backdrop-blur shadow-lg max-w-[90vw] flex items-center gap-2">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-red-300/60 hover:text-red-300 ml-2">×</button>
        </div>
      )}
    </PaywallOverlay>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight m-0">{title}</h1>
      {subtitle && <p className="text-white/40 text-sm mt-1.5 m-0">{subtitle}</p>}
    </div>
  )
}

export default function CVEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white/40 text-sm">Načítání…</div>}>
      <CVEditorInner />
    </Suspense>
  )
}
