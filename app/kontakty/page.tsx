'use client'

import { useSubscription } from '../../hooks/useSubscription'
import PaywallOverlay from '../components/PaywallOverlay'
import ContactCard from '../components/ContactCard'
import StatCounter from '../components/StatCounter'
import Link from 'next/link'

const SAMPLE_CONTACTS = [
  {
    company: 'Helvetia Bau AG',
    position: 'Stavbyvedoucí / Bauleiter',
    location: 'Zürich, ZH',
    salary: '6 500 CHF',
    email: 'hr@helvetiabau.ch',
    phone: '+41 44 123 4567',
    website: 'https://helvetiabau.ch/karriere',
  },
  {
    company: 'Swiss Gastro Group',
    position: 'Kuchař / Koch',
    location: 'Bern, BE',
    salary: '4 800 CHF',
    email: 'jobs@swissgastro.ch',
    phone: '+41 31 987 6543',
    website: 'https://swissgastro.ch/jobs',
  },
  {
    company: 'Alpine Care AG',
    position: 'Zdravotní sestra / Pflegefachfrau',
    location: 'Basel, BS',
    salary: '7 200 CHF',
    email: 'karriere@alpinecare.ch',
    phone: '+41 61 555 1234',
    website: 'https://alpinecare.ch',
  },
  {
    company: 'LogiSwiss Transport',
    position: 'Řidič kamiónu / LKW-Fahrer',
    location: 'Luzern, LU',
    salary: '5 800 CHF',
    email: 'fahrer@logiswiss.ch',
    phone: '+41 41 333 7890',
    website: 'https://logiswiss.ch/stellen',
  },
  {
    company: 'TechHub Zürich',
    position: 'Frontend Developer',
    location: 'Zürich, ZH',
    salary: '9 500 CHF',
    email: 'talent@techhub.ch',
    phone: '+41 44 777 2345',
    website: 'https://techhub.ch/careers',
  },
  {
    company: 'Reinigung Plus GmbH',
    position: 'Vedoucí úklidu / Reinigungsleiter',
    location: 'Winterthur, ZH',
    salary: '4 600 CHF',
    email: 'personal@reinigungplus.ch',
    phone: '+41 52 444 5678',
    website: 'https://reinigungplus.ch',
  },
]

const STATS = [
  { label: 'Kontaktů celkem', value: '200+', icon: '📇' },
  { label: 'Firem', value: '85+', icon: '🏢' },
  { label: 'Kantonů', value: '12', icon: '📍' },
  { label: 'Aktualizace', value: 'Denně', icon: '🔄' },
]

export default function Kontakty() {
  const { isActive, loading } = useSubscription()

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-gray-500 hover:text-white mb-6 inline-block text-sm">
          ← Zpět
        </Link>

        <h1 className="text-white text-2xl font-bold mb-2">📇 Databáze kontaktů</h1>
        <p className="text-gray-400 text-sm mb-6">
          Přímé kontakty na švýcarské zaměstnavatele – bez agentury
        </p>

        <StatCounter stats={STATS} />

        <div className="mt-8 space-y-4">
          {/* First 2 cards always visible (locked contacts) */}
          {SAMPLE_CONTACTS.slice(0, 2).map((contact) => (
            <ContactCard key={contact.company} {...contact} isLocked={!isActive && !loading} />
          ))}

          {/* Rest behind paywall */}
          <PaywallOverlay
            isLocked={!isActive && !loading}
            title="Odemkni 200+ kontaktů"
            description="Přímé emaily a telefony na HR oddělení švýcarských firem. Bez agentury, bez provize."
          >
            <div className="space-y-4">
              {SAMPLE_CONTACTS.slice(2).map((contact) => (
                <ContactCard key={contact.company} {...contact} isLocked={false} />
              ))}
            </div>
          </PaywallOverlay>
        </div>
      </div>
    </main>
  )
}
