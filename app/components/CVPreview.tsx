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
  template: string
  accentColor: string
}

/* ═══ PARAMETRIC TEMPLATE SYSTEM ═══ */
interface TplConfig {
  layout: 'sidebar-l' | 'sidebar-r' | 'top' | 'two-col' | 'single'
  headerBg: 'dark' | 'accent' | 'gradient' | 'light' | 'white'
  photoShape: 'circle' | 'square' | 'rounded'
  font: 'sans' | 'serif' | 'modern'
  sectionStyle: 'underline' | 'dot' | 'border-left' | 'card' | 'plain' | 'gradient-line'
  sidebarW?: string
  compact?: boolean
  darkMode?: boolean
  headerHeight?: 'tall' | 'normal' | 'slim'
  taskBullet?: string
}

const PARAM_TEMPLATES: Record<string, TplConfig> = {
  // Professional series
  'pro-classic': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'pro-light': { layout: 'sidebar-l', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'pro-serif': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'serif', sectionStyle: 'underline' },
  'pro-square': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'square', font: 'sans', sectionStyle: 'underline' },
  'pro-rounded': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'rounded', font: 'sans', sectionStyle: 'underline' },
  'pro-gradient': { layout: 'sidebar-l', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'pro-compact': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', compact: true },
  'pro-cards': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'card' },
  'pro-dots': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'dot' },
  'pro-slim': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', headerHeight: 'slim' },
  // Right sidebar series
  'right-classic': { layout: 'sidebar-r', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'right-dark': { layout: 'sidebar-r', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'right-serif': { layout: 'sidebar-r', headerBg: 'light', photoShape: 'rounded', font: 'serif', sectionStyle: 'border-left' },
  'right-gradient': { layout: 'sidebar-r', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line' },
  'right-modern': { layout: 'sidebar-r', headerBg: 'light', photoShape: 'square', font: 'modern', sectionStyle: 'plain' },
  'right-compact': { layout: 'sidebar-r', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', compact: true },
  'right-cards': { layout: 'sidebar-r', headerBg: 'accent', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'right-dots': { layout: 'sidebar-r', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'dot' },
  // Top header series
  'top-dark': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'top-gradient': { layout: 'top', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'top-accent': { layout: 'top', headerBg: 'accent', photoShape: 'rounded', font: 'sans', sectionStyle: 'border-left' },
  'top-serif': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'serif', sectionStyle: 'plain' },
  'top-modern': { layout: 'top', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'top-compact': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', compact: true },
  'top-cards': { layout: 'top', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'card' },
  'top-light': { layout: 'top', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'top-slim': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', headerHeight: 'slim' },
  'top-dots': { layout: 'top', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'dot' },
  // Two column series
  'twin-classic': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'twin-dark': { layout: 'two-col', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'twin-serif': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'border-left' },
  'twin-modern': { layout: 'two-col', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'twin-compact': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', compact: true },
  'twin-cards': { layout: 'two-col', headerBg: 'light', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'twin-accent': { layout: 'two-col', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'plain' },
  'twin-dots': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'dot' },
  // Single column series
  'single-classic': { layout: 'single', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'single-dark': { layout: 'single', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'single-serif': { layout: 'single', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'border-left' },
  'single-modern': { layout: 'single', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'single-compact': { layout: 'single', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', compact: true },
  'single-cards': { layout: 'single', headerBg: 'light', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'single-gradient': { layout: 'single', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'underline' },
  'single-accent': { layout: 'single', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'plain' },
  // Dark mode series
  'dark-sidebar': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', darkMode: true },
  'dark-right': { layout: 'sidebar-r', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', darkMode: true },
  'dark-top': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line', darkMode: true },
  'dark-twin': { layout: 'two-col', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', darkMode: true },
  'dark-single': { layout: 'single', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', darkMode: true },
  'dark-serif': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'serif', sectionStyle: 'border-left', darkMode: true },
  'dark-modern': { layout: 'top', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line', darkMode: true },
  'dark-compact': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', darkMode: true, compact: true },
  'dark-cards': { layout: 'top', headerBg: 'dark', photoShape: 'rounded', font: 'sans', sectionStyle: 'card', darkMode: true },
  'dark-gradient': { layout: 'sidebar-r', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line', darkMode: true },
  // Serif series
  'serif-classic': { layout: 'sidebar-l', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'plain' },
  'serif-top': { layout: 'top', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'plain' },
  'serif-single': { layout: 'single', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'underline' },
  'serif-dark': { layout: 'sidebar-l', headerBg: 'dark', photoShape: 'rounded', font: 'serif', sectionStyle: 'border-left' },
  'serif-twin': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'plain' },
  // Modern series
  'modern-square': { layout: 'top', headerBg: 'light', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'modern-dark': { layout: 'top', headerBg: 'dark', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'modern-sidebar': { layout: 'sidebar-l', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'card' },
  'modern-twin': { layout: 'two-col', headerBg: 'light', photoShape: 'square', font: 'modern', sectionStyle: 'gradient-line' },
  'modern-single': { layout: 'single', headerBg: 'gradient', photoShape: 'square', font: 'modern', sectionStyle: 'plain' },
  // Card series
  'card-light': { layout: 'top', headerBg: 'light', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'card-dark': { layout: 'top', headerBg: 'dark', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'card-sidebar': { layout: 'sidebar-l', headerBg: 'accent', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'card-single': { layout: 'single', headerBg: 'light', photoShape: 'rounded', font: 'sans', sectionStyle: 'card' },
  'card-serif': { layout: 'top', headerBg: 'light', photoShape: 'rounded', font: 'serif', sectionStyle: 'card' },
  // Gradient series
  'grad-sidebar': { layout: 'sidebar-l', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line' },
  'grad-top': { layout: 'top', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line' },
  'grad-right': { layout: 'sidebar-r', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line' },
  'grad-twin': { layout: 'two-col', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line' },
  'grad-serif': { layout: 'sidebar-l', headerBg: 'gradient', photoShape: 'circle', font: 'serif', sectionStyle: 'gradient-line' },
  'grad-dark': { layout: 'top', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line', darkMode: true },
  // Compact series
  'compact-sidebar': { layout: 'sidebar-l', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'plain', compact: true },
  'compact-top': { layout: 'top', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'plain', compact: true },
  'compact-twin': { layout: 'two-col', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'plain', compact: true },
  'compact-dark-top': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'plain', compact: true },
  'compact-single': { layout: 'single', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'plain', compact: true },
  // Dot bullet series
  'dots-sidebar': { layout: 'sidebar-l', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'dot', taskBullet: '●' },
  'dots-top': { layout: 'top', headerBg: 'light', photoShape: 'circle', font: 'sans', sectionStyle: 'dot', taskBullet: '●' },
  'dots-serif': { layout: 'sidebar-l', headerBg: 'light', photoShape: 'circle', font: 'serif', sectionStyle: 'dot', taskBullet: '●' },
  'dots-dark': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'dot', taskBullet: '●', darkMode: true },
  // Arrow bullet series
  'arrow-top': { layout: 'top', headerBg: 'accent', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', taskBullet: '→' },
  'arrow-sidebar': { layout: 'sidebar-l', headerBg: 'gradient', photoShape: 'circle', font: 'sans', sectionStyle: 'underline', taskBullet: '→' },
  'arrow-dark': { layout: 'top', headerBg: 'dark', photoShape: 'circle', font: 'sans', sectionStyle: 'gradient-line', taskBullet: '→', darkMode: true },
}

const FONTS: Record<string, string> = {
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: "'Georgia', 'Times New Roman', serif",
  modern: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
}

/* eslint-disable react-hooks/static-components */
function ParametricT({ data, photo, c, cfg }: { data: CVData; photo: string | null; c: string; cfg: TplConfig }) {
  const p = data.personalData
  const dark = cfg.darkMode
  const bg = dark ? '#1a1a2e' : '#fff'
  const text = dark ? '#e0e0e0' : '#333'
  const textMuted = dark ? 'rgba(255,255,255,0.5)' : '#888'
  const textLight = dark ? 'rgba(255,255,255,0.35)' : '#aaa'
  const border = dark ? 'rgba(255,255,255,0.08)' : '#eee'
  const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#fafbfc'
  const fs = cfg.compact ? '8.5pt' : '9.5pt'
  const lh = cfg.compact ? '1.35' : '1.45'
  const pad = cfg.compact ? '22px' : '28px'
  const fontFamily = FONTS[cfg.font]
  const photoR = cfg.photoShape === 'circle' ? '50%' : cfg.photoShape === 'rounded' ? '12px' : '4px'
  const photoSize = cfg.compact ? '70px' : '90px'

  const headerBgColor = cfg.headerBg === 'dark' ? (dark ? '#0d0d1a' : '#1a1a2e')
    : cfg.headerBg === 'accent' ? c
    : cfg.headerBg === 'gradient' ? undefined : (dark ? '#1a1a2e' : '#fff')
  const headerBgGrad = cfg.headerBg === 'gradient' ? `linear-gradient(135deg, ${c}, ${hexToRgba(c, 0.7)})` : undefined
  const headerTextColor = (cfg.headerBg === 'dark' || cfg.headerBg === 'accent' || cfg.headerBg === 'gradient') ? '#fff' : (dark ? '#fff' : '#1a1a1a')
  const headerMuted = (cfg.headerBg === 'dark' || cfg.headerBg === 'accent' || cfg.headerBg === 'gradient') ? 'rgba(255,255,255,0.6)' : textMuted

  const bullet = cfg.taskBullet || (cfg.sectionStyle === 'dot' ? '●' : cfg.sectionStyle === 'card' ? '▸' : '–')

  // Section header renderer
  const SH = ({ t }: { t: string }) => {
    if (cfg.sectionStyle === 'gradient-line') return <div style={{ marginBottom: cfg.compact ? '6px' : '12px', marginTop: cfg.compact ? '10px' : '16px' }}><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 700, color: dark ? c : c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2px', background: `linear-gradient(90deg, ${c}, transparent)`, width: '60px' }} /></div>
    if (cfg.sectionStyle === 'card') return <div style={{ marginBottom: cfg.compact ? '6px' : '10px', marginTop: cfg.compact ? '10px' : '14px' }}><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 700, color: dark ? '#fff' : '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '25px', borderRadius: '2px' }} /></div>
    if (cfg.sectionStyle === 'dot') return <div style={{ marginBottom: cfg.compact ? '6px' : '10px', marginTop: cfg.compact ? '10px' : '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c }} /><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 700, color: dark ? '#fff' : '#1a1a1a', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t}</h2></div>
    if (cfg.sectionStyle === 'border-left') return <div style={{ marginBottom: cfg.compact ? '6px' : '12px', marginTop: cfg.compact ? '10px' : '16px', paddingLeft: '10px', borderLeft: `3px solid ${c}` }}><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 700, color: dark ? '#fff' : '#1a1a1a', textTransform: 'uppercase', letterSpacing: '2px' }}>{t}</h2></div>
    if (cfg.sectionStyle === 'plain') return <div style={{ marginBottom: cfg.compact ? '6px' : '10px', marginTop: cfg.compact ? '10px' : '16px' }}><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 600, color: c, textTransform: 'uppercase', letterSpacing: '3px' }}>{t}</h2></div>
    // default: underline
    return <div style={{ marginBottom: cfg.compact ? '6px' : '12px', marginTop: cfg.compact ? '10px' : '16px' }}><h2 style={{ fontSize: cfg.compact ? '8pt' : '10pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '35px' }} /></div>
  }

  // Photo component
  const Photo = ({ size, light }: { size?: string; light?: boolean }) => {
    const s = size || photoSize
    if (!photo) return light ? <div style={{ width: s, height: s, borderRadius: photoR, backgroundColor: 'rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '24pt', color: 'rgba(255,255,255,0.3)' }}>👤</span></div> : null
    return <div style={{ width: s, height: s, borderRadius: photoR, overflow: 'hidden', border: `2px solid ${light ? 'rgba(255,255,255,0.3)' : hexToRgba(c, 0.4)}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
  }

  // Experience list
  const Exps = () => <>{data.experience.map((exp, i) => (
    <div key={i} style={{ marginBottom: cfg.compact ? '10px' : '16px', ...(cfg.sectionStyle === 'card' ? { padding: cfg.compact ? '8px 10px' : '12px 14px', backgroundColor: cardBg, borderRadius: '6px', border: `1px solid ${border}` } : cfg.sectionStyle === 'border-left' ? { paddingLeft: '12px', borderLeft: `2px solid ${i === 0 ? c : border}` } : {}) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: cfg.compact ? '9pt' : '10.5pt', fontWeight: 700, margin: 0, color: dark ? '#fff' : '#2c3e50' }}>{exp.title}</h3>
        <span style={{ fontSize: cfg.compact ? '7pt' : '8pt', color: c, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.period}</span>
      </div>
      <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: textMuted, margin: '1px 0 5px', fontStyle: 'italic' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
      {exp.tasks.map((t, j) => <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '2px' }}><span style={{ color: c, fontSize: cfg.compact ? '6pt' : '7pt', marginTop: '3px', flexShrink: 0 }}>{bullet}</span><span style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: dark ? 'rgba(255,255,255,0.65)' : '#555' }}>{t}</span></div>)}
    </div>
  ))}</>

  const Edus = () => <>{data.education.map((edu, i) => (
    <div key={i} style={{ marginBottom: cfg.compact ? '6px' : '12px', ...(cfg.sectionStyle === 'border-left' ? { paddingLeft: '12px', borderLeft: `2px solid ${border}` } : {}) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: cfg.compact ? '9pt' : '10.5pt', fontWeight: 700, margin: 0, color: dark ? '#fff' : '#2c3e50' }}>{edu.degree}</h3>
        <span style={{ fontSize: cfg.compact ? '7pt' : '8pt', color: c, whiteSpace: 'nowrap' }}>{edu.period}</span>
      </div>
      <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: textMuted, margin: '1px 0 0' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
    </div>
  ))}</>

  // Sidebar content
  const SidebarContent = ({ light }: { light?: boolean }) => (
    <div style={{ padding: `${pad} 20px` }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Photo size={cfg.compact ? '70px' : '90px'} light={light} />
        {cfg.layout === 'sidebar-l' || cfg.layout === 'sidebar-r' ? <>
          <h1 style={{ fontSize: cfg.compact ? '14pt' : '17pt', fontWeight: 700, margin: '10px 0 2px', color: light ? '#fff' : text }}>{p.name}</h1>
          <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? 'rgba(255,255,255,0.6)' : c, margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500 }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </> : null}
      </div>
      <div style={{ height: '1px', backgroundColor: light ? 'rgba(255,255,255,0.1)' : border, margin: '0 0 14px' }} />
      <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: light ? 'rgba(255,255,255,0.4)' : textLight, margin: '0 0 8px' }}>Kontakt</p>
      {p.address && <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? '#ddd' : '#666', margin: '0 0 4px' }}>{p.address}</p>}
      <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? '#ddd' : '#666', margin: '0 0 4px' }}>{p.phone}</p>
      <p style={{ fontSize: cfg.compact ? '7pt' : '8pt', color: light ? '#ddd' : '#666', margin: '0 0 12px', wordBreak: 'break-all' }}>{p.email}</p>
      <div style={{ height: '1px', backgroundColor: light ? 'rgba(255,255,255,0.1)' : border, margin: '0 0 14px' }} />
      <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: light ? 'rgba(255,255,255,0.4)' : textLight, margin: '0 0 8px' }}>Info</p>
      <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? '#ddd' : '#666', margin: '0 0 3px' }}>{p.birthdate}</p>
      <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? '#ddd' : '#666', margin: '0 0 10px' }}>{p.nationality}</p>
      {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: light ? '#ddd' : '#666', margin: '0 0 10px' }}>Führerschein: {p.drivingLicense}</p>}
      <div style={{ height: '1px', backgroundColor: light ? 'rgba(255,255,255,0.1)' : border, margin: '0 0 14px' }} />
      <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: light ? 'rgba(255,255,255,0.4)' : textLight, margin: '0 0 8px' }}>Sprachen</p>
      <LangBars langs={data.languages} c={c} light={light} />
      {data.skills.soft.length > 0 && <>
        <div style={{ height: '1px', backgroundColor: light ? 'rgba(255,255,255,0.1)' : border, margin: '10px 0 14px' }} />
        <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: light ? 'rgba(255,255,255,0.4)' : textLight, margin: '0 0 8px' }}>Kompetenzen</p>
        <SoftList skills={data.skills.soft} c={c} light={light} />
      </>}
    </div>
  )

  // Main content (experience, education, skills)
  const MainContent = () => (
    <div style={{ padding: `${pad} ${pad} ${pad} ${cfg.layout === 'sidebar-l' ? '26px' : pad}` }}>
      {data.profil && <><SH t="Profil" /><p style={{ fontSize: cfg.compact ? '8pt' : '9pt', color: dark ? 'rgba(255,255,255,0.6)' : '#666', lineHeight: '1.6', marginBottom: cfg.compact ? '14px' : '20px' }}>{data.profil}</p></>}
      <SH t="Berufserfahrung" /><Exps />
      <SH t="Ausbildung" /><Edus />
      {data.skills.technical.length > 0 && <><SH t="Fachkenntnisse" /><SkillPills skills={data.skills.technical} c={c} /><div style={{ marginBottom: cfg.compact ? '10px' : '20px' }} /></>}
      {data.certifications && data.certifications.length > 0 && <><SH t="Zertifikate" />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: dark ? 'rgba(255,255,255,0.5)' : '#555', margin: '0 0 3px' }}>{bullet} {x}</p>)}</>}
      <p style={{ fontSize: '8pt', color: dark ? 'rgba(255,255,255,0.2)' : '#ccc', fontStyle: 'italic', marginTop: '16px' }}>Referenzen auf Anfrage erhältlich</p>
    </div>
  )

  // Header for top/two-col/single layouts
  const TopHeader = () => (
    <div style={{ padding: `${cfg.headerHeight === 'slim' ? '18px' : pad} 35px`, backgroundColor: headerBgColor, background: headerBgGrad, display: 'flex', alignItems: 'center', gap: '20px' }}>
      <Photo light={cfg.headerBg !== 'light' && cfg.headerBg !== 'white'} />
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: cfg.compact ? '20pt' : '24pt', fontWeight: 700, color: headerTextColor, margin: '0 0 2px' }}>{p.name}</h1>
        <p style={{ fontSize: cfg.compact ? '9pt' : '10pt', color: cfg.headerBg === 'light' || cfg.headerBg === 'white' ? c : 'rgba(255,255,255,0.8)', margin: '0 0 8px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: headerMuted }}>
          {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
          <span>{p.birthdate} · {p.nationality}</span>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <span>Kat. {p.drivingLicense}</span>}
        </div>
      </div>
    </div>
  )

  const sideW = cfg.sidebarW || (cfg.compact ? '68mm' : '75mm')
  const isLightSidebar = cfg.headerBg === 'light' || cfg.headerBg === 'white'
  const sidebarBg = isLightSidebar ? hexToRgba(c, 0.05) : c

  // LAYOUT: sidebar left
  if (cfg.layout === 'sidebar-l') return (
    <div style={{ width: W, minHeight: '297mm', display: 'flex', fontFamily, fontSize: fs, lineHeight: lh }}>
      <div style={{ width: sideW, backgroundColor: sidebarBg, flexShrink: 0 }}><SidebarContent light={!isLightSidebar} /></div>
      <div style={{ flex: 1, backgroundColor: bg }}><MainContent /></div>
    </div>
  )

  // LAYOUT: sidebar right
  if (cfg.layout === 'sidebar-r') return (
    <div style={{ width: W, minHeight: '297mm', display: 'flex', fontFamily, fontSize: fs, lineHeight: lh }}>
      <div style={{ flex: 1, backgroundColor: bg }}><MainContent /></div>
      <div style={{ width: sideW, backgroundColor: sidebarBg, flexShrink: 0 }}><SidebarContent light={!isLightSidebar} /></div>
    </div>
  )

  // LAYOUT: two columns
  if (cfg.layout === 'two-col') return (
    <div style={{ width: W, minHeight: '297mm', fontFamily, fontSize: fs, lineHeight: lh, backgroundColor: bg }}>
      <TopHeader />
      {cfg.headerBg !== 'white' && <div style={{ height: '3px', backgroundColor: c }} />}
      {data.profil && <div style={{ padding: `12px 35px`, backgroundColor: cardBg }}><p style={{ fontSize: cfg.compact ? '8pt' : '9pt', color: dark ? 'rgba(255,255,255,0.6)' : '#666', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
      <div style={{ display: 'flex', padding: `20px 35px`, gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <SH t="Berufserfahrung" /><Exps />
          {data.certifications && data.certifications.length > 0 && <><SH t="Zertifikate" />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: dark ? 'rgba(255,255,255,0.5)' : '#555', margin: '0 0 3px' }}>{bullet} {x}</p>)}</>}
        </div>
        <div style={{ width: '1px', backgroundColor: border }} />
        <div style={{ flex: 1 }}>
          <SH t="Ausbildung" /><Edus />
          <SH t="Sprachen" /><LangBars langs={data.languages} c={c} light={dark} />
          {data.skills.technical.length > 0 && <><SH t="Fachkenntnisse" /><SkillPills skills={data.skills.technical} c={c} /><div style={{ marginBottom: '14px' }} /></>}
          {data.skills.soft.length > 0 && <><SH t="Kompetenzen" /><SoftList skills={data.skills.soft} c={c} light={dark} /></>}
        </div>
      </div>
    </div>
  )

  // LAYOUT: single column
  if (cfg.layout === 'single') return (
    <div style={{ width: W, minHeight: '297mm', fontFamily, fontSize: fs, lineHeight: lh, backgroundColor: bg }}>
      <TopHeader />
      {cfg.headerBg !== 'white' && <div style={{ height: '2px', backgroundColor: c }} />}
      <div style={{ padding: `20px 35px` }}>
        {data.profil && <><SH t="Profil" /><p style={{ fontSize: cfg.compact ? '8pt' : '9.5pt', color: dark ? 'rgba(255,255,255,0.6)' : '#666', lineHeight: '1.65', marginBottom: '18px' }}>{data.profil}</p></>}
        <SH t="Berufserfahrung" /><Exps />
        <SH t="Ausbildung" /><Edus />
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}><SH t="Sprachen" /><LangBars langs={data.languages} c={c} light={dark} /></div>
          {data.skills.technical.length > 0 && <div style={{ flex: 1 }}><SH t="Fachkenntnisse" /><SkillPills skills={data.skills.technical} c={c} /></div>}
          {data.skills.soft.length > 0 && <div style={{ flex: 1 }}><SH t="Kompetenzen" /><SoftList skills={data.skills.soft} c={c} light={dark} /></div>}
        </div>
        {data.certifications && data.certifications.length > 0 && <><SH t="Zertifikate" />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: dark ? 'rgba(255,255,255,0.5)' : '#555', margin: '0 0 3px' }}>{bullet} {x}</p>)}</>}
        <p style={{ fontSize: '8pt', color: dark ? 'rgba(255,255,255,0.2)' : '#ccc', fontStyle: 'italic', marginTop: '16px' }}>Referenzen auf Anfrage erhältlich</p>
      </div>
    </div>
  )

  // LAYOUT: top (default) - top header + two-part body
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily, fontSize: fs, lineHeight: lh, backgroundColor: bg }}>
      <TopHeader />
      {cfg.headerBg !== 'white' && <div style={{ height: '3px', backgroundColor: c }} />}
      {data.profil && <div style={{ padding: '14px 35px', backgroundColor: cardBg, borderBottom: `1px solid ${border}` }}><p style={{ fontSize: cfg.compact ? '8pt' : '9.5pt', color: dark ? 'rgba(255,255,255,0.6)' : '#555', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
      <div style={{ display: 'flex', padding: `20px 35px`, gap: '28px' }}>
        <div style={{ flex: 1 }}>
          <SH t="Berufserfahrung" /><Exps />
          <SH t="Ausbildung" /><Edus />
          {data.certifications && data.certifications.length > 0 && <><SH t="Zertifikate" />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: cfg.compact ? '7.5pt' : '8.5pt', color: dark ? 'rgba(255,255,255,0.5)' : '#555', margin: '0 0 3px' }}>{bullet} {x}</p>)}</>}
        </div>
        <div style={{ width: '155px', flexShrink: 0 }}>
          <SH t="Sprachen" /><LangBars langs={data.languages} c={c} light={dark} />
          {data.skills.technical.length > 0 && <><SH t="Fachkenntnisse" /><SkillPills skills={data.skills.technical} c={c} /></>}
          {data.skills.soft.length > 0 && <><SH t="Kompetenzen" /><SoftList skills={data.skills.soft} c={c} light={dark} /></>}
          <div style={{ marginTop: '12px', fontSize: '7.5pt', color: textLight }}>{p.birthdate}<br />{p.nationality}</div>
        </div>
      </div>
    </div>
  )
}

/* eslint-enable react-hooks/static-components */

/* ═══ HELPERS ═══ */
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

  const handcrafted: Record<string, React.FC<{data: CVData; photo: string | null; c: string}>> = { klassisch: KlassischT, modern: ModernT, kreativ: KreativT, elegant: ElegantT, minimal: MinimalT, executive: ExecutiveT, swiss: SwissT, timeline: TimelineT, corporate: CorporateT, bold: BoldT, compact: CompactT, dark: DarkT, infographic: InfographicT, zweispaltig: ZweispaltigT, nordic: NordicT }
  const HandcraftedTemplate = handcrafted[template]
  const paramCfg = PARAM_TEMPLATES[template]

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={handleDownload} disabled={downloading} className="flex-1 bg-[#E8302A] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {downloading ? (<span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generuji PDF...</span>) : '📥 Stáhnout jako PDF'}
        </button>
      </div>
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ overflowX: 'auto' }}>
        <div ref={cvRef}>
          {HandcraftedTemplate ? <HandcraftedTemplate data={data} photo={photo} c={accentColor} />
          : paramCfg ? <ParametricT data={data} photo={photo} c={accentColor} cfg={paramCfg} />
          : <KlassischT data={data} photo={photo} c={accentColor} />}
        </div>
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

/* ═══ TEMPLATE 11: COMPACT – dense, fits more on one page ═══ */
function CompactT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '8.5pt', lineHeight: '1.35', backgroundColor: '#fff', padding: '22px 28px' }}>
      {/* Compact header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
        {photo && <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{p.name}</h1>
          <p style={{ fontSize: '9pt', color: c, margin: '1px 0 0', fontWeight: 600 }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '7.5pt', color: '#888' }}>
          <p style={{ margin: '0 0 1px' }}>{p.phone} · {p.email}</p>
          {p.address && <p style={{ margin: '0 0 1px' }}>{p.address}</p>}
          <p style={{ margin: 0 }}>{p.birthdate} · {p.nationality}</p>
        </div>
      </div>
      <div style={{ height: '1.5px', backgroundColor: c, marginBottom: '10px' }} />
      {/* Profile */}
      {data.profil && <p style={{ fontSize: '8pt', color: '#666', lineHeight: '1.5', margin: '0 0 10px' }}>{data.profil}</p>}
      {/* Two columns */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <CompH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '9pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{exp.title}</h3>
                <span style={{ fontSize: '7pt', color: c, fontWeight: 600 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '7.5pt', color: '#999', margin: '0 0 3px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '7.5pt', color: '#555', margin: '0 0 1px', paddingLeft: '8px' }}>· {t}</p>)}
            </div>
          ))}
          <CompH t="Ausbildung" c={c} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '9pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{edu.degree}</h3>
                <span style={{ fontSize: '7pt', color: c }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '7.5pt', color: '#999', margin: 0 }}>{edu.school}</p>
            </div>
          ))}
          {data.certifications && data.certifications.length > 0 && <><CompH t="Zertifikate" c={c} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{data.certifications.map((x, i) => <span key={i} style={{ fontSize: '7pt', backgroundColor: hexToRgba(c, 0.08), color: c, padding: '2px 8px', borderRadius: '10px' }}>{x}</span>)}</div></>}
        </div>
        <div style={{ width: '140px', flexShrink: 0 }}>
          <CompH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
          {data.skills.technical.length > 0 && <><CompH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /></>}
          {data.skills.soft.length > 0 && <><CompH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '7pt', color: '#999', marginTop: '8px' }}>Führerschein: {p.drivingLicense}</p>}
        </div>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 12: DARK – dark theme ═══ */
function DarkT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#1a1a2e', color: '#e0e0e0' }}>
      {/* Header */}
      <div style={{ padding: '30px 35px 24px', display: 'flex', alignItems: 'center', gap: '22px', borderBottom: `2px solid ${c}` }}>
        {photo && <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        <div>
          <h1 style={{ fontSize: '26pt', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{p.name}</h1>
          <p style={{ fontSize: '10pt', color: c, margin: '0 0 8px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)' }}>
            {p.address && <span>{p.address}</span>}<span>{p.phone}</span><span>{p.email}</span>
          </div>
        </div>
      </div>
      {data.profil && <div style={{ padding: '16px 35px', backgroundColor: 'rgba(255,255,255,0.03)' }}><p style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
      <div style={{ display: 'flex', padding: '24px 35px', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <DarkH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `2px solid ${i === 0 ? c : 'rgba(255,255,255,0.1)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#fff' }}>{exp.title}</h3>
                <span style={{ fontSize: '8pt', color: c }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.4)', margin: '1px 0 6px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}><span style={{ color: c, fontSize: '7pt', marginTop: '3px', flexShrink: 0 }}>●</span><span style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.65)' }}>{t}</span></div>)}
            </div>
          ))}
          <DarkH t="Ausbildung" c={c} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '10.5pt', fontWeight: 700, margin: 0, color: '#fff' }}>{edu.degree}</h3>
                <span style={{ fontSize: '8pt', color: c }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.4)', margin: '1px 0 0' }}>{edu.school}{edu.location ? ` · ${edu.location}` : ''}</p>
            </div>
          ))}
          {data.certifications && data.certifications.length > 0 && <><DarkH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>• {x}</p>)}</>}
        </div>
        <div style={{ width: '155px', flexShrink: 0 }}>
          <DarkH t="Persönliche Daten" c={c} />
          <p style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', margin: '0 0 3px' }}>{p.birthdate}</p>
          <p style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>{p.nationality}</p>
          <DarkH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} light />
          {data.skills.technical.length > 0 && <><DarkH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} filled /></>}
          {data.skills.soft.length > 0 && <><DarkH t="Soft Skills" c={c} /><SoftList skills={data.skills.soft} c={c} light /></>}
        </div>
      </div>
      <div style={{ padding: '10px 35px', borderTop: '1px solid rgba(255,255,255,0.06)' }}><p style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.2)', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 13: INFOGRAPHIC – visual bars and charts ═══ */
function InfographicT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', display: 'flex', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45' }}>
      {/* Left sidebar with infographic elements */}
      <div style={{ width: '80mm', background: `linear-gradient(180deg, ${c}, ${hexToRgba(c, 0.85)})`, flexShrink: 0, color: '#fff' }}>
        <div style={{ padding: '28px 22px 20px', textAlign: 'center' }}>
          {photo ? <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', margin: '0 auto 14px', border: '3px solid rgba(255,255,255,0.3)' }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          : <div style={{ width: '100px', height: '100px', borderRadius: '16px', margin: '0 auto 14px', backgroundColor: 'rgba(255,255,255,0.1)' }} />}
          <h1 style={{ fontSize: '16pt', fontWeight: 700, margin: '0 0 2px' }}>{p.name}</h1>
          <p style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
        </div>
        <div style={{ padding: '0 22px' }}>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />
          {/* Contact icons */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>Kontakt</p>
            {p.address && <p style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.85)', margin: '0 0 5px' }}>{p.address}</p>}
            <p style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.85)', margin: '0 0 5px' }}>{p.phone}</p>
            <p style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)', margin: '0 0 5px', wordBreak: 'break-all' }}>{p.email}</p>
          </div>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '16px' }} />
          {/* Languages with big circular indicators */}
          <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>Sprachen</p>
          {data.languages.map((l, i) => {
            const lv = getLvl(l.level)
            const pct = (lv / 5) * 100
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', position: 'relative', background: `conic-gradient(rgba(255,255,255,0.9) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '8pt', fontWeight: 700 }}>{lv}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '8.5pt', fontWeight: 600 }}>{l.language}</span>
                  <p style={{ fontSize: '6.5pt', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{l.level}</p>
                </div>
              </div>
            )
          })}
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '6px 0 16px' }} />
          {/* Skills as progress bars */}
          {data.skills.technical.length > 0 && <>
            <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>Fachkenntnisse</p>
            {data.skills.technical.map((s, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '7.5pt', color: 'rgba(255,255,255,0.85)' }}>{s}</span>
                <div style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginTop: '2px' }}>
                  <div style={{ height: '100%', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.7)', width: `${70 + (i % 4) * 8}%` }} />
                </div>
              </div>
            ))}
          </>}
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', margin: '10px 0 16px' }} />
          <p style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>Info</p>
          <p style={{ fontSize: '8pt', margin: '0 0 3px', color: 'rgba(255,255,255,0.7)' }}>{p.birthdate}</p>
          <p style={{ fontSize: '8pt', margin: '0 0 3px', color: 'rgba(255,255,255,0.7)' }}>{p.nationality}</p>
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '8pt', margin: 0, color: 'rgba(255,255,255,0.7)' }}>Kat. {p.drivingLicense}</p>}
        </div>
      </div>
      {/* Right content */}
      <div style={{ flex: 1, padding: '28px 28px 20px 26px', backgroundColor: '#fff' }}>
        {data.profil && <><InfH t="Profil" c={c} /><p style={{ fontSize: '9pt', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>{data.profil}</p></>}
        <InfH t="Berufserfahrung" c={c} /><ExpList data={data} c={c} />
        <InfH t="Ausbildung" c={c} /><EduList data={data} c={c} />
        {data.skills.soft.length > 0 && <><InfH t="Kompetenzen" c={c} /><SkillPills skills={data.skills.soft} c={c} /><div style={{ marginBottom: '20px' }} /></>}
        {data.certifications && data.certifications.length > 0 && <><InfH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: '8.5pt', color: '#555', margin: '0 0 4px' }}>• {x}</p>)}</>}
        <p style={{ fontSize: '8pt', color: '#ccc', fontStyle: 'italic', marginTop: '16px' }}>Referenzen auf Anfrage erhältlich</p>
      </div>
    </div>
  )
}

/* ═══ TEMPLATE 14: ZWEISPALTIG – equal two columns ═══ */
function ZweispaltigT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: F, fontSize: '9.5pt', lineHeight: '1.45', backgroundColor: '#fff' }}>
      {/* Full width header */}
      <div style={{ padding: '28px 35px 20px', borderBottom: `3px solid ${c}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {photo && <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${c}`, flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24pt', fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{p.name}</h1>
            <p style={{ fontSize: '10pt', color: c, margin: 0, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#888' }}>
            {p.address && <p style={{ margin: '0 0 2px' }}>{p.address}</p>}
            <p style={{ margin: '0 0 2px' }}>{p.phone}</p>
            <p style={{ margin: '0 0 2px' }}>{p.email}</p>
            <p style={{ margin: 0 }}>{p.birthdate} · {p.nationality}</p>
          </div>
        </div>
      </div>
      {/* Profile full width */}
      {data.profil && <div style={{ padding: '14px 35px', backgroundColor: hexToRgba(c, 0.04) }}><p style={{ fontSize: '9pt', color: '#666', lineHeight: '1.6', margin: 0 }}>{data.profil}</p></div>}
      {/* Two equal columns */}
      <div style={{ display: 'flex', padding: '20px 35px', gap: '24px' }}>
        {/* Left column */}
        <div style={{ flex: 1 }}>
          <ZweiH t="Berufserfahrung" c={c} />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{exp.title}</h3>
                <span style={{ fontSize: '7.5pt', color: c, fontWeight: 600 }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '8pt', color: '#999', margin: '1px 0 4px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
              {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8pt', color: '#555', margin: '0 0 2px', paddingLeft: '10px' }}>– {t}</p>)}
            </div>
          ))}
          {data.certifications && data.certifications.length > 0 && <><ZweiH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <p key={i} style={{ fontSize: '8pt', color: '#555', margin: '0 0 3px' }}>– {x}</p>)}</>}
        </div>
        {/* Divider */}
        <div style={{ width: '1px', backgroundColor: hexToRgba(c, 0.15) }} />
        {/* Right column */}
        <div style={{ flex: 1 }}>
          <ZweiH t="Ausbildung" c={c} />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>{edu.degree}</h3>
                <span style={{ fontSize: '7.5pt', color: c }}>{edu.period}</span>
              </div>
              <p style={{ fontSize: '8pt', color: '#999', margin: '1px 0 0' }}>{edu.school}</p>
            </div>
          ))}
          <ZweiH t="Sprachen" c={c} /><LangBars langs={data.languages} c={c} />
          {data.skills.technical.length > 0 && <><ZweiH t="Fachkenntnisse" c={c} /><SkillPills skills={data.skills.technical} c={c} /><div style={{ marginBottom: '14px' }} /></>}
          {data.skills.soft.length > 0 && <><ZweiH t="Kompetenzen" c={c} /><SoftList skills={data.skills.soft} c={c} /></>}
          {p.drivingLicense && p.drivingLicense !== 'žádný' && <p style={{ fontSize: '8pt', color: '#999', marginTop: '10px' }}>Führerschein: {p.drivingLicense}</p>}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 35px', borderTop: `1px solid ${hexToRgba(c, 0.15)}` }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
    </div>
  )
}

/* ═══ TEMPLATE 15: NORDIC – clean Scandinavian style ═══ */
function NordicT({ data, photo, c }: { data: CVData; photo: string | null; c: string }) {
  const p = data.personalData
  return (
    <div style={{ width: W, minHeight: '297mm', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '9.5pt', lineHeight: '1.55', backgroundColor: '#fafafa', padding: '40px 42px' }}>
      {/* Minimal header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '32pt', fontWeight: 300, color: '#222', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{p.name}</h1>
            <p style={{ fontSize: '10pt', color: c, margin: 0, fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase' }}>{data.experience[0]?.title || 'Fachkraft'}</p>
          </div>
          {photo && <div style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}><img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
        </div>
        {/* Contact as minimal line */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '14px', fontSize: '8pt', color: '#999' }}>
          {p.address && <span>{p.address}</span>}{p.address && <span style={{ color: '#ddd' }}>|</span>}
          <span>{p.phone}</span><span style={{ color: '#ddd' }}>|</span>
          <span>{p.email}</span><span style={{ color: '#ddd' }}>|</span>
          <span>{p.birthdate}</span><span style={{ color: '#ddd' }}>|</span>
          <span>{p.nationality}</span>
        </div>
      </div>
      {/* Thin rule */}
      <div style={{ height: '1px', backgroundColor: '#e0e0e0', marginBottom: '20px' }} />
      {/* Profile */}
      {data.profil && <p style={{ fontSize: '9.5pt', color: '#777', lineHeight: '1.7', margin: '0 0 24px', maxWidth: '90%' }}>{data.profil}</p>}
      {/* Experience */}
      <NordH t="Berufserfahrung" c={c} />
      {data.experience.map((exp, i) => (
        <div key={i} style={{ marginBottom: '18px', display: 'flex', gap: '20px' }}>
          <div style={{ width: '80px', flexShrink: 0 }}>
            <span style={{ fontSize: '8pt', color: '#aaa', fontWeight: 500 }}>{exp.period}</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 600, margin: 0, color: '#222' }}>{exp.title}</h3>
            <p style={{ fontSize: '8.5pt', color: '#aaa', margin: '2px 0 6px' }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p>
            {exp.tasks.map((t, j) => <p key={j} style={{ fontSize: '8.5pt', color: '#666', margin: '0 0 2px' }}>{t}</p>)}
          </div>
        </div>
      ))}
      {/* Education */}
      <NordH t="Ausbildung" c={c} />
      {data.education.map((edu, i) => (
        <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '20px' }}>
          <div style={{ width: '80px', flexShrink: 0 }}>
            <span style={{ fontSize: '8pt', color: '#aaa' }}>{edu.period}</span>
          </div>
          <div>
            <h3 style={{ fontSize: '10.5pt', fontWeight: 600, margin: 0, color: '#222' }}>{edu.degree}</h3>
            <p style={{ fontSize: '8.5pt', color: '#aaa', margin: '1px 0 0' }}>{edu.school}</p>
          </div>
        </div>
      ))}
      {/* Bottom grid */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
        <div style={{ flex: 1 }}>
          <NordH t="Sprachen" c={c} />
          {data.languages.map((l, i) => {
            const lv = getLvl(l.level)
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '8.5pt', fontWeight: 500, color: '#444', width: '80px' }}>{l.language}</span>
              <div style={{ display: 'flex', gap: '3px' }}>{[1,2,3,4,5].map(d => <div key={d} style={{ width: '18px', height: '3px', backgroundColor: d <= lv ? c : '#e0e0e0' }} />)}</div>
              <span style={{ fontSize: '7pt', color: '#bbb' }}>{l.level}</span>
            </div>
          })}
        </div>
        <div style={{ flex: 1 }}>
          {data.skills.technical.length > 0 && <><NordH t="Fachkenntnisse" c={c} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{data.skills.technical.map((s, i) => <span key={i} style={{ fontSize: '8pt', color: '#666', padding: '3px 10px', border: '1px solid #e0e0e0', borderRadius: '3px' }}>{s}</span>)}</div></>}
        </div>
        <div style={{ flex: 1 }}>
          {data.skills.soft.length > 0 && <><NordH t="Kompetenzen" c={c} />{data.skills.soft.map((s, i) => <p key={i} style={{ fontSize: '8pt', color: '#888', margin: '0 0 3px' }}>{s}</p>)}</>}
        </div>
      </div>
      {data.certifications && data.certifications.length > 0 && <div style={{ marginTop: '14px' }}><NordH t="Zertifikate" c={c} />{data.certifications.map((x, i) => <span key={i} style={{ fontSize: '8pt', color: '#888', marginRight: '12px' }}>{x}</span>)}</div>}
      <div style={{ marginTop: '24px' }}><p style={{ fontSize: '8pt', color: '#ccc', margin: 0 }}>Referenzen auf Anfrage erhältlich</p></div>
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
function CompH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '6px', marginTop: '10px' }}><h2 style={{ fontSize: '8.5pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '3px' }}>{t}</h2><div style={{ height: '1.5px', backgroundColor: c, width: '20px' }} /></div>
}
function DarkH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '16px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '5px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '30px' }} /></div>
}
function InfH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '14px' }}><h2 style={{ fontSize: '10pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '2px', backgroundColor: c, width: '35px', borderRadius: '1px' }} /></div>
}
function ZweiH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '10px', marginTop: '14px' }}><h2 style={{ fontSize: '9pt', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>{t}</h2><div style={{ height: '1.5px', backgroundColor: hexToRgba(c, 0.3), width: '100%' }} /></div>
}
function NordH({ t, c }: { t: string; c: string }) {
  return <div style={{ marginBottom: '12px', marginTop: '18px' }}><h2 style={{ fontSize: '8pt', fontWeight: 500, color: c, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>{t}</h2><div style={{ height: '1px', backgroundColor: '#e0e0e0', width: '100%' }} /></div>
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
