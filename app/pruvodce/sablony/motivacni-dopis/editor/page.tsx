'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../../supabase'
import { useSubscription } from '../../../../../hooks/useSubscription'
import PaywallOverlay from '../../../../components/PaywallOverlay'
import LetterBuilderLayout from '../../../../components/letter/LetterBuilderLayout'
import LetterPreview from '../../../../components/LetterPreview'
import SenderSection from '../../../../components/letter/sections/SenderSection'
import RecipientSection from '../../../../components/letter/sections/RecipientSection'
import SubjectSection from '../../../../components/letter/sections/SubjectSection'
import BodySection from '../../../../components/letter/sections/BodySection'
import ClosingSection from '../../../../components/letter/sections/ClosingSection'
import DesignSection from '../../../../components/letter/sections/DesignSection'
import { getLetterTemplateById } from '../../../../../lib/letter/templates'
import { buildLetterPdfBlob } from '../../../../../lib/letter/pdf-client'
import type { LetterData, LetterFormData, LetterSectionId } from '../../../../../lib/letter/types'

function LetterEditorInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initialTemplate = (params.get('template') as 'klassisch' | 'modern' | 'minimal') || 'klassisch'
  const documentId = params.get('documentId')

  const { isActive, loading: subLoading } = useSubscription()

  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string>('')
  const [authChecked, setAuthChecked] = useState(false)

  const [formData, setFormData] = useState<LetterFormData>({})
  const [template, setTemplate] = useState<'klassisch' | 'modern' | 'minimal'>(initialTemplate)
  const [accentColor, setAccentColor] = useState<string>(() => getLetterTemplateById(initialTemplate)?.defaultColor || '#1a1a1a')
  const [activeSection, setActiveSection] = useState<LetterSectionId>('sender')
  // Drzime celou LetterData (s sender/recipient/meta/design) — sekce ji pouzivaji
  // pro inline editaci, a body se separatne menime po AI generate.
  const [letterData, setLetterData] = useState<LetterData | null>(null)
  const [activeDocId, setActiveDocId] = useState<string | null>(documentId)

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Off-screen render target pro PDF generaci. Pri handleSave se z neho udela
  // html2canvas snapshot → jsPDF blob → upload do storage.
  const pdfRef = useRef<HTMLDivElement>(null)

  // Auth + load
  useEffect(() => {
    let cancelled = false
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.replace(`/prihlaseni?next=/pruvodce/sablony/motivacni-dopis/editor?template=${initialTemplate}`)
        return
      }
      if (cancelled) return
      setUserId(session.user.id)
      setAccessToken(session.access_token)
      setAuthChecked(true)

      // Profile fetch — sender info autofill + permit/german pro AI
      const profilePromise = supabase
        .from('profiles')
        .select('full_name, telefon, datum_narozeni, adresa, nationality, pozice, obor, zkusenosti, vzdelani, experiences, dovednosti, nemcina_uroven, work_permit_status, preferovany_kanton')
        .eq('id', session.user.id)
        .maybeSingle()

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
            if (doc?.document_data && !cancelled) {
              const ld: LetterData = doc.document_data
              setLetterData(ld)
              if (doc.template) setTemplate(doc.template as 'klassisch' | 'modern' | 'minimal')
              if (doc.accent_color) setAccentColor(doc.accent_color)
              // Mapuj LetterData -> LetterFormData
              setFormData((f) => ({
                ...f,
                senderFullName: ld.sender?.fullName || profile?.full_name || f.senderFullName,
                senderAddress: ld.sender?.address || profile?.adresa || f.senderAddress,
                senderPostalCode: ld.sender?.postalCode || f.senderPostalCode,
                senderCity: ld.sender?.city || profile?.preferovany_kanton || f.senderCity,
                senderPhone: ld.sender?.phone || profile?.telefon || f.senderPhone,
                senderEmail: ld.sender?.email || session.user.email || f.senderEmail,
                recipientCompany: ld.recipient?.company || f.recipientCompany,
                recipientContactPerson: ld.recipient?.contactPerson || f.recipientContactPerson,
                recipientAddress: ld.recipient?.address || f.recipientAddress,
                recipientPostalCode: ld.recipient?.postalCode || f.recipientPostalCode,
                recipientCity: ld.recipient?.city || f.recipientCity,
                jobTitle: f.jobTitle,
                jobReference: ld.meta?.reference || f.jobReference,
                jobSource: ld.meta?.jobSource || f.jobSource,
                place: ld.meta?.place || f.place,
                date: ld.meta?.date || f.date,
                germanLevel: profile?.nemcina_uroven || f.germanLevel,
                permitStatus: profile?.work_permit_status || f.permitStatus,
                experiences: Array.isArray(profile?.experiences) ? profile.experiences : f.experiences,
                templateId: (doc.template as 'klassisch' | 'modern' | 'minimal') || f.templateId,
                accentColor: doc.accent_color || f.accentColor,
              }))
            }
          }
        } catch { /* ignore */ }
      } else {
        // Prefill z profilu pro novy dopis
        try {
          const { data: profile } = await profilePromise
          if (profile && !cancelled) {
            const contactEmail = session.user.email || ''
            setFormData((f) => ({
              ...f,
              senderFullName: profile.full_name || f.senderFullName,
              senderEmail: contactEmail || f.senderEmail,
              senderPhone: profile.telefon || f.senderPhone,
              senderAddress: profile.adresa || f.senderAddress,
              senderCity: profile.preferovany_kanton || f.senderCity,
              germanLevel: profile.nemcina_uroven || f.germanLevel,
              permitStatus: profile.work_permit_status || f.permitStatus,
              experiences: Array.isArray(profile.experiences) ? profile.experiences : f.experiences,
              place: profile.preferovany_kanton || f.place,
              date: f.date || new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }),
            }))
          }
        } catch { /* ignore */ }
      }
    }
    init()
    return () => { cancelled = true }
  }, [router, documentId, initialTemplate])

  // Section components volaji onChange(key, value) — pro vetsi flexibilitu.
  // updateForm akceptuje obe formy: bud (key, value) nebo (Partial<form>).
  const handleSectionChange = useCallback(
    (key: keyof LetterFormData, value: LetterFormData[keyof LetterFormData]) => {
      setFormData((f) => ({ ...f, [key]: value }))
    },
    []
  )
  // Bulk update (pouziva se v init prefill + sync from profile)
  const updateForm = useCallback((updates: Partial<LetterFormData>) => {
    setFormData((f) => ({ ...f, ...updates }))
  }, [])

  // ─── Aktualizovat z profilu (force refresh sender + context fields) ───
  const handleSyncFromProfile = useCallback(async () => {
    if (!userId) return
    setSyncing(true); setError(null)
    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('full_name, telefon, adresa, nationality, nemcina_uroven, work_permit_status, experiences, dovednosti, preferovany_kanton')
        .eq('id', userId)
        .maybeSingle()
      if (profErr) throw profErr
      if (!profile) {
        setError('Profil je prázdný. Vyplň ho v sekci Profil.')
        return
      }
      // profiles.email neexistuje v DB → pouzij auth.user.email
      const { data: { session } } = await supabase.auth.getSession()
      const contactEmail = session?.user?.email || ''
      setFormData((f) => ({
        ...f,
        senderFullName: profile.full_name || f.senderFullName,
        senderEmail: contactEmail || f.senderEmail,
        senderPhone: profile.telefon || f.senderPhone,
        senderAddress: profile.adresa || f.senderAddress,
        senderCity: profile.preferovany_kanton || f.senderCity,
        germanLevel: profile.nemcina_uroven || f.germanLevel,
        permitStatus: profile.work_permit_status || f.permitStatus,
        experiences: Array.isArray(profile.experiences) ? profile.experiences : f.experiences,
      }))
      setToast('Data z profilu načtena.')
      setTimeout(() => setToast(null), 3000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || 'Nepodařilo se načíst profil.')
    } finally {
      setSyncing(false)
    }
  }, [userId])

  // ─── AI generování dopisu ───
  const handleGenerate = useCallback(async () => {
    const required: Array<keyof LetterFormData> = ['senderFullName', 'recipientCompany', 'jobTitle']
    const missing = required.filter((k) => !String(formData[k] || '').trim())
    if (missing.length > 0) {
      setError('Pro generování potřebuji: tvoje jméno, název firmy a pozici.')
      const targetSection: LetterSectionId =
        missing.includes('senderFullName') ? 'sender'
        : missing.includes('recipientCompany') ? 'recipient'
        : 'subject'
      setActiveSection(targetSection)
      return
    }
    setGenerating(true); setError(null)
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          company: formData.recipientCompany,
          contactPerson: formData.recipientContactPerson,
          jobDescription: formData.jobDescription,
          jobSource: formData.jobSource,
          jobReference: formData.jobReference,
          customMotivation: formData.motivation,
          language: 'de',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generování selhalo')
      // /api/generate-letter vraci jen body cast — wrap do plne LetterData se sender/recipient/meta
      // z formData aby sections mohli editovat in-line
      const aiBody = data.letterData as LetterData['body']
      const fullLd: LetterData = {
        sender: {
          fullName: formData.senderFullName || '',
          address: formData.senderAddress,
          postalCode: formData.senderPostalCode,
          city: formData.senderCity,
          phone: formData.senderPhone,
          email: formData.senderEmail,
        },
        recipient: {
          company: formData.recipientCompany || '',
          contactPerson: formData.recipientContactPerson,
          address: formData.recipientAddress,
          postalCode: formData.recipientPostalCode,
          city: formData.recipientCity,
        },
        meta: {
          place: formData.place,
          date: formData.date,
          subject: aiBody.opening ? `Bewerbung als ${formData.jobTitle}` : `Bewerbung als ${formData.jobTitle}`,
          reference: formData.jobReference,
          jobSource: formData.jobSource,
        },
        body: aiBody,
        design: { templateId: template, accentColor },
      }
      setLetterData(fullLd)
      setToast('AI vygenerovala dopis! Pokračuj v sekci Tělo dopisu a uprav co chceš.')
      setActiveSection('body')
      setTimeout(() => setToast(null), 5000)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo')
    } finally {
      setGenerating(false)
    }
  }, [accessToken, formData])

  // ─── Uložit dopis ───
  const handleSave = useCallback(async () => {
    if (!userId || !accessToken) return
    if (!letterData) {
      setError('Před uložením vygeneruj dopis tlačítkem "Vygenerovat AI dopis".')
      return
    }
    setSaving(true); setError(null)
    try {
      const title = formData.jobTitle && formData.recipientCompany
        ? `${formData.jobTitle} — ${formData.recipientCompany}`
        : formData.jobTitle || 'Motivační dopis'

      // Refresh sender/recipient/meta ze soucasneho formData, body + opening/signOff
      // zustavaji z letterData (uzivatel je mohl editovat v BodySection).
      const fullLetterData: LetterData = {
        ...letterData,
        sender: {
          fullName: formData.senderFullName || '',
          address: formData.senderAddress,
          postalCode: formData.senderPostalCode,
          city: formData.senderCity,
          phone: formData.senderPhone,
          email: formData.senderEmail,
        },
        recipient: {
          company: formData.recipientCompany || '',
          contactPerson: formData.recipientContactPerson,
          address: formData.recipientAddress,
          postalCode: formData.recipientPostalCode,
          city: formData.recipientCity,
        },
        meta: {
          ...letterData.meta,
          place: formData.place,
          date: formData.date,
          reference: formData.jobReference,
          jobSource: formData.jobSource,
        },
        design: { templateId: template, accentColor },
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          id: activeDocId || undefined,
          type: 'letter',
          title,
          document_data: fullLetterData,
          template,
          accent_color: accentColor,
        }),
      })
      if (!res.ok) throw new Error('Uložení selhalo')
      const data = await res.json()
      if (!data.id) throw new Error('Uložení selhalo')
      setActiveDocId(data.id)
      // PDF MUSI skoncit ve Storage, jinak Smart Apply dostane no_letter_pdf. Drive byl
      // upload v silent try/catch → pri chybe se metadata ulozila bez PDF a user to nevedel.
      if (!pdfRef.current) throw new Error('Náhled dopisu se nestihl připravit. Klikni Uložit ještě jednou.')
      const pdfBlob = await buildLetterPdfBlob(pdfRef.current)
      const pdfForm = new FormData()
      pdfForm.append('file', pdfBlob, 'letter.pdf')
      pdfForm.append('documentId', String(data.id))
      const pdfRes = await fetch('/api/letter-pdf', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: pdfForm,
      })
      if (!pdfRes.ok) throw new Error('Dopis se uložil, ale PDF se nepodařilo nahrát. Klikni Uložit ještě jednou.')
      setToast('Dopis uložen. Najdeš ho v Moje dokumenty.')
      setTimeout(() => setToast(null), 3500)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Uložení selhalo')
    } finally {
      setSaving(false)
    }
  }, [userId, accessToken, letterData, formData, template, accentColor, activeDocId])

  // ─── Render section content ───
  function renderSection() {
    switch (activeSection) {
      case 'sender':
        return <SenderSection formData={formData} onChange={handleSectionChange} />
      case 'recipient':
        return <RecipientSection formData={formData} onChange={handleSectionChange} />
      case 'subject':
        return <SubjectSection formData={formData} onChange={handleSectionChange} />
      case 'body':
        return (
          <BodySection
            formData={formData}
            onChange={handleSectionChange}
            letterData={letterData}
            onLetterDataChange={setLetterData}
            onGenerate={handleGenerate}
            generating={generating}
          />
        )
      case 'closing':
        return (
          <ClosingSection
            formData={formData}
            onChange={handleSectionChange}
            letterData={letterData}
            onLetterDataChange={setLetterData}
          />
        )
      case 'design':
        return (
          <DesignSection
            template={template}
            onTemplateChange={(id) => setTemplate(id as 'klassisch' | 'modern' | 'minimal')}
            accentColor={accentColor}
            onColorChange={setAccentColor}
          />
        )
      default:
        return null
    }
  }

  if (!authChecked || subLoading) {
    return <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white/40 text-sm">Načítání…</div>
  }

  return (
    <PaywallOverlay isLocked={!isActive} title="AI motivační dopisy jsou součástí Premium" description="Získej AI Anschreiben pro švýcarský trh">
      <LetterBuilderLayout
        formData={formData}
        onFormChange={updateForm}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        template={template}
        onTemplateChange={(id) => setTemplate(id as 'klassisch' | 'modern' | 'minimal')}
        accentColor={accentColor}
        onColorChange={setAccentColor}
        letterData={letterData}
        onSave={handleSave}
        onSyncFromProfile={handleSyncFromProfile}
        saving={saving || publishing}
        syncing={syncing}
      >
        {renderSection()}
      </LetterBuilderLayout>

      {/* Off-screen full-size LetterPreview pro PDF generaci — html2canvas
          potrebuje rendrovany DOM v 1:1 sirce A4 (210mm). aria-hidden +
          fixed pozice mimo viewport. */}
      {letterData && (
        <div
          ref={pdfRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: -99999,
            top: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
          }}
        >
          <LetterPreview data={letterData} template={template} accentColor={accentColor} />
        </div>
      )}

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

export default function LetterEditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a12] flex items-center justify-center text-white/40 text-sm">Načítání…</div>}>
      <LetterEditorInner />
    </Suspense>
  )
}
