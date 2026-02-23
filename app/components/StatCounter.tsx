'use client'

interface StatCounterProps {
  stats: { label: string; value: string; icon: string }[]
}

export default function StatCounter({ stats }: StatCounterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-center"
        >
          <div className="text-2xl mb-1">{stat.icon}</div>
          <div className="text-white text-xl font-bold">{stat.value}</div>
          <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
