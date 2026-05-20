'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import CVPreview from '../CVPreview'
import { getTemplateById } from '@/lib/cv/templates'
import type { CVData, CVFormData } from '@/lib/cv/types'

interface LivePreviewProps {
  formData: CVFormData
  photo: string | null
  template: string
  accentColor: string
  cvData?: CVData | null  // pokud AI vygenerovala plnohodnotné CV — má přednost
}

// Build CVData z form state (před AI generování) tak, aby preview ukazovalo něco rozumného hned.
function buildPreviewData(form: CVFormData, photo: string | null): CVData {
  return {
    profil: form.position || undefined,
    personalData: {
      name: form.name || 'Tvé jméno',
      birthdate: form.birthdate || '',
      nationality: form.nationality || '',
      address: form.address || '',
      phone: form.phone || '',
      email: form.email || '',
      drivingLicense: form.driving || undefined,
    },
    experience: (form.experiences && form.experiences.length > 0)
      ? form.experiences.map((e) => ({
          period: e.period,
          title: e.title,
          company: e.company,
          location: e.location,
          tasks: e.description ? e.description.split('\n').filter(Boolean) : [],
        }))
      : (form.experience_detail
          ? [{ period: '', title: form.position || '', company: '', tasks: form.experience_detail.split('\n').filter(Boolean) }]
          : []),
    education: (form.educations && form.educations.length > 0)
      ? form.educations.map((e) => ({
          period: e.period,
          school: e.school,
          degree: e.degree,
          location: e.location,
        }))
      : (form.education
          ? [{ period: '', school: form.education, degree: '' }]
          : []),
    languages: [
      ...(form.german ? [{ language: 'Němčina', level: form.german }] : []),
      ...(form.other_languages ? form.other_languages.split(',').map((l) => {
        const parts = l.trim().split('-')
        return { language: parts[0]?.trim() || l.trim(), level: parts[1]?.trim() || '' }
      }) : []),
    ],
    skills: {
      technical: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      soft: [],
    },
  }
}

// Debounced live preview — minimalizuje rerendery při psaní.
export default function LivePreview({ formData, photo, template, accentColor, cvData }: LivePreviewProps) {
  const [debouncedForm, setDebouncedForm] = useState(formData)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedForm(formData), 200)
    return () => clearTimeout(t)
  }, [formData])

  const previewData = useMemo(() => {
    return cvData || buildPreviewData(debouncedForm, photo)
  }, [debouncedForm, photo, cvData])

  const tpl = getTemplateById(template)
  const effectiveColor = accentColor || tpl?.defaultColor || '#1e293b'

  const SCALE = 0.55
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = useState<number>(0)

  // Měřit reálnou výšku obsahu po každém renderu a propagovat na container.
  useEffect(() => {
    if (!innerRef.current) return
    const el = innerRef.current
    const update = () => setInnerHeight(el.scrollHeight * SCALE)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [previewData, template, accentColor, photo])

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl overflow-hidden live-preview-cv"
      style={{ width: '100%', height: innerHeight ? `${innerHeight}px` : 'auto' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .live-preview-cv .flex.gap-3.mb-6 { display: none !important; }
        .live-preview-cv p.text-gray-500.text-xs.text-center.mt-4 { display: none !important; }
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
        <CVPreview data={previewData} photo={photo} template={template} accentColor={effectiveColor} />
      </div>
    </div>
  )
}
