'use client'

interface ContactCardProps {
  company: string
  position: string
  location: string
  salary?: string
  email?: string
  phone?: string
  website?: string
  isLocked: boolean
}

export default function ContactCard({
  company,
  position,
  location,
  salary,
  email,
  phone,
  website,
  isLocked,
}: ContactCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{position}</h3>
          <p className="text-gray-400 text-sm">{company}</p>
        </div>
        {salary && (
          <span className="bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
            {salary}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
        <span>📍</span>
        <span>{location}</span>
      </div>

      {isLocked ? (
        <div className="bg-[#0E0E0E] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-gray-400 text-sm font-medium">Kontakt zamčený</p>
              <p className="text-gray-600 text-xs">Email, telefon a web firmy</p>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="bg-[#0E0E0E] rounded-xl p-4 border border-gray-800 space-y-2">
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
              <span>📧</span> {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300">
              <span>📞</span> {phone}
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300">
              <span>🌐</span> {website}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
