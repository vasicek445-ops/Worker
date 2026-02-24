'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../supabase'
import PaywallOverlay from '../components/PaywallOverlay'
import ContactCard from '../components/ContactCard'
import StatCounter from '../components/StatCounter'
import Link from 'next/link'

type Contact = {
  id: string
  company: string
  position: string
  location: string
  canton: string
  salary: string
  email: string
  phone: string
  website: string
  industry: string
}

const INDUSTRIES = [
  'Vše',
  'Stavebnictví',
  'Gastronomie',
  'Zdravotnictví',
  'IT',
  'Logistika',
  'Řemesla',
  'Hotelnictví',
  'Úklid',
  'Průmysl',
  'Energetika',
  'Vzdělávání',
  'Wellness',
  'Letectví',
  'Personalistika',
  'Automobilový průmysl',
  'Zahradnictví',
  'Životní prostředí',
]

const CANTONS = [
  'Vše', 'ZH', 'BE', 'BS', 'LU', 'AG', 'SG', 'GR', 'GE', 'TG', 'SO', 'ZG', 'TI', 'SH',
]

export default function Kontakty() {
  const { isActive, loading: subLoading } = useSubscription()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('Vše')
  const [canton, setCanton] = useState('Vše')

  useEffect(() => {
    async function fetchContacts() {
      const { data, error } = await supabase
        .from('kontakty')
        .select('*')
        .order('company')
      if (data) setContacts(data)
      if (error) console.error('Error fetching contacts:', error)
      setLoading(false)
    }
    fetchContacts()
  }, [])

  const filtered = contacts.filter((c) => {
    const matchSearch =
      search === '' ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
    const matchIndustry = industry === 'Vše' || c.industry === industry
    const matchCanton = canton === 'Vše' || c.canton === canton
    return matchSearch && matchIndustry && matchCanton
  })

  const FREE_COUNT = 3

  const stats = [
    { label: 'Kontaktů celkem', value: `${contacts.length}+`, icon: '📇' },
    { label: 'Oborů', value: `${new Set(contacts.map(c => c.industry)).size}+`, icon: '🏢' },
    { label: 'Kantonů', value: `${new Set(contacts.map(c => c.canton)).size}`, icon: '📍' },
    { label: 'Aktualizace', value: 'Denně', icon: '🔄' },
  ]

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">📇 Databáze kontaktů</h1>
        <p className="text-gray-400 text-sm mb-6">
          Přímé kontakty na švýcarské zaměstnavatele – bez agentury, bez provize
        </p>

        <StatCounter stats={stats} />

        {/* Search & Filters */}
        <div className="mt-6 space-y-3">
          <input
            type="text"
            placeholder="🔍 Hledat firmu, pozici nebo město..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#E8302A] focus:outline-none text-sm"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {INDUSTRIES.slice(0, 8).map((ind) => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  industry === ind
                    ? 'bg-[#E8302A] text-white'
                    : 'bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:border-gray-600'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CANTONS.map((c) => (
              <button
                key={c}
                onClick={() => setCanton(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  canton === c
                    ? 'bg-[#E8302A] text-white'
                    : 'bg-[#1A1A1A] text-gray-400 border border-gray-800 hover:border-gray-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-500 text-xs mt-4 mb-4">
          {loading ? 'Načítám...' : `${filtered.length} kontaktů nalezeno`}
        </p>

        {/* Contact Cards */}
        <div className="space-y-4">
          {/* Free contacts (first 3) */}
          {filtered.slice(0, FREE_COUNT).map((contact) => (
            <ContactCard
              key={contact.id}
              {...contact}
              isLocked={!isActive && !subLoading}
            />
          ))}

          {/* Premium contacts behind paywall */}
          {filtered.length > FREE_COUNT && (
            <PaywallOverlay
              isLocked={!isActive && !subLoading}
              title={`Odemkni ${filtered.length}+ kontaktů`}
              description="Přímé emaily a telefony na HR oddělení švýcarských firem. Bez agentury, bez provize."
            >
              <div className="space-y-4">
                {filtered.slice(FREE_COUNT).map((contact) => (
                  <ContactCard
                    key={contact.id}
                    {...contact}
                    isLocked={false}
                  />
                ))}
              </div>
            </PaywallOverlay>
          )}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">😕 Žádné kontakty nenalezeny</p>
            <p className="text-gray-600 text-sm mt-2">Zkus změnit filtry nebo vyhledávání</p>
          </div>
        )}
      </div>
    </main>
  )
}
