'use client'
import { useEffect, useState } from 'react'

type Props = {
  value: string            // YYYY-MM-DD nebo DD.MM.YYYY (přijímá oboje)
  onChange: (val: string) => void
  minYear?: number
  maxYear?: number
  locale?: 'de' | 'sk' | 'cs' | 'en' | 'pl'
  required?: boolean
  // formát výstupu — Woker dnes ukládá birthdate jako '15.3.1990' (legacy text)
  // 'iso' = '1990-03-15', 'eu' = '15.3.1990'
  outputFormat?: 'iso' | 'eu'
}

const MONTH_NAMES: Record<string, string[]> = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  sk: ['január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september', 'október', 'november', 'december'],
  cs: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
}

const LABELS: Record<string, { day: string; month: string; year: string }> = {
  de: { day: 'Tag',   month: 'Monat',  year: 'Jahr' },
  sk: { day: 'Deň',   month: 'Mesiac', year: 'Rok' },
  cs: { day: 'Den',   month: 'Měsíc',  year: 'Rok' },
  en: { day: 'Day',   month: 'Month',  year: 'Year' },
  pl: { day: 'Dzień', month: 'Miesiąc', year: 'Rok' },
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

// Parsuje value: '1990-03-15' nebo '15.3.1990' / '15.03.1990' → { d, m, y }
function parseValue(v: string): { y: number; m: number; d: number } | null {
  if (!v) return null
  const isoMatch = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) return { y: +isoMatch[1], m: +isoMatch[2], d: +isoMatch[3] }
  const euMatch = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (euMatch) return { d: +euMatch[1], m: +euMatch[2], y: +euMatch[3] }
  return null
}

export default function WheelDatePicker({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear() - 15,
  locale = 'cs',
  required,
  outputFormat = 'eu',
}: Props) {
  const months = MONTH_NAMES[locale] || MONTH_NAMES.cs
  const labels = LABELS[locale] || LABELS.cs

  const [year, setYear] = useState<number | ''>('')
  const [month, setMonth] = useState<number | ''>('')
  const [day, setDay] = useState<number | ''>('')

  useEffect(() => {
    const parsed = parseValue(value)
    if (parsed) {
      setYear(parsed.y)
      setMonth(parsed.m)
      setDay(parsed.d)
    }
  }, [value])

  useEffect(() => {
    if (year && month && day) {
      const out = outputFormat === 'iso'
        ? `${year}-${pad2(month)}-${pad2(day)}`
        : `${day}.${month}.${year}`
      if (out !== value) onChange(out)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day])

  useEffect(() => {
    if (year && month && day) {
      const max = daysInMonth(year, month)
      if (day > max) setDay(max)
    }
  }, [year, month, day])

  const years: number[] = []
  for (let y = maxYear; y >= minYear; y--) years.push(y)

  const maxDays = year && month ? daysInMonth(year, month) : 31
  const daysArr: number[] = Array.from({ length: maxDays }, (_, i) => i + 1)

  const selectClass =
    'w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#fb923c]/40 appearance-none cursor-pointer'

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={day}
        onChange={(e) => setDay(e.target.value ? Number(e.target.value) : '')}
        required={required}
        className={selectClass}
        aria-label={labels.day}
      >
        <option value="" disabled className="bg-[#111120]">{labels.day}</option>
        {daysArr.map((d) => (
          <option key={d} value={d} className="bg-[#111120]">{d}</option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : '')}
        required={required}
        className={selectClass}
        aria-label={labels.month}
      >
        <option value="" disabled className="bg-[#111120]">{labels.month}</option>
        {months.map((m, i) => (
          <option key={i} value={i + 1} className="bg-[#111120]">{m}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
        required={required}
        className={selectClass}
        aria-label={labels.year}
      >
        <option value="" disabled className="bg-[#111120]">{labels.year}</option>
        {years.map((y) => (
          <option key={y} value={y} className="bg-[#111120]">{y}</option>
        ))}
      </select>
    </div>
  )
}
