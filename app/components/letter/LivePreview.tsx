'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import LetterPreview from '../LetterPreview'
import { getLetterTemplateById } from '@/lib/letter/templates'
import type { LetterData, LetterFormData } from '@/lib/letter/types'

interface LivePreviewProps {
  formData: LetterFormData
  template: string
  accentColor: string
  letterData?: LetterData | null
}

// Build LetterData z form state (pred AI generovanim) tak, aby preview ukazovalo neco rozumneho hned.
function buildPreviewData(form: LetterFormData, template: string, accentColor: string): LetterData {
  const senderFullName = form.senderFullName || 'Tvé jméno'
  const opening = form.recipientContactPerson
    ? `Sehr geehrte/r ${form.recipientContactPerson},`
    : 'Sehr geehrte Damen und Herren,'
  const subject = form.jobTitle ? `Bewerbung als ${form.jobTitle}` : 'Bewerbung als …'

  return {
    sender: {
      fullName: senderFullName,
      address: form.senderAddress,
      postalCode: form.senderPostalCode,
      city: form.senderCity,
      phone: form.senderPhone,
      email: form.senderEmail,
    },
    recipient: {
      company: form.recipientCompany || 'Název firmy',
      contactPerson: form.recipientContactPerson,
      address: form.recipientAddress,
      postalCode: form.recipientPostalCode,
      city: form.recipientCity,
    },
    meta: {
      place: form.place,
      date: form.date,
      subject,
      reference: form.jobReference,
      jobSource: form.jobSource,
    },
    body: {
      opening,
      paragraphs: [
        {
          id: 'p-placeholder',
          type: 'motivation',
          text:
            form.motivation ||
            'Tvoje motivace pro tuto pozici se objeví zde. Klikni na "Vygenerovat AI dopis" pro automatické dopsání obsahu.',
        },
      ],
      signOff: 'Freundliche Grüsse',
    },
    design: {
      templateId: (template as LetterData['design']['templateId']) || 'klassisch',
      accentColor,
    },
  }
}

export default function LivePreview({ formData, template, accentColor, letterData }: LivePreviewProps) {
  const [debouncedForm, setDebouncedForm] = useState(formData)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedForm(formData), 200)
    return () => clearTimeout(t)
  }, [formData])

  const previewData = useMemo<LetterData>(() => {
    if (letterData) return letterData
    return buildPreviewData(debouncedForm, template, accentColor)
  }, [debouncedForm, template, accentColor, letterData])

  const tpl = getLetterTemplateById(template)
  const effectiveColor = accentColor || tpl?.defaultColor || '#1a1a1a'

  const SCALE = 0.55
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState<number>(0)

  useEffect(() => {
    if (!innerRef.current) return
    const el = innerRef.current
    const update = () => setInnerHeight(el.scrollHeight * SCALE)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [previewData, template, accentColor])

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl overflow-hidden live-preview-letter mx-auto"
      style={{ width: `${210 * SCALE}mm`, maxWidth: '100%', height: innerHeight ? `${innerHeight}px` : 'auto' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .live-preview-letter .flex.gap-3.mb-6 { display: none !important; }
        .live-preview-letter p.text-gray-500.text-xs.text-center.mt-4 { display: none !important; }
      ` }} />
      <div
        ref={innerRef}
        style={{
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          width: `${100 / SCALE}%`,
          pointerEvents: 'none',
        }}
      >
        <LetterPreview data={previewData} template={template} accentColor={effectiveColor} />
      </div>
    </div>
  )
}
