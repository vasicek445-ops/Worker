"use client";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
export default function BottomNav({ active }: { active: "home" | "jobs" | "contacts" | "tools" | "community" | "profile" }) {
  const { t } = useLanguage();
  const items = [
    { icon: "🏠", label: t.nav.overview, href: "/dashboard", id: "home" as const },
    { icon: "💼", label: "Nabídky", href: "/nabidky", id: "jobs" as const },
    { icon: "🛠️", label: "Nástroje", href: "/pruvodce", id: "tools" as const },
    { icon: "💬", label: t.nav.community, href: "/komunita", id: "community" as const },
    { icon: "👤", label: t.nav.profile, href: "/profil", id: "profile" as const },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/85 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2 pb-3 z-[100]">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-[10px] transition-all duration-150 ${active === item.id ? "bg-red-500/[0.08]" : ""}`}>
            <span className={`text-xl transition-all duration-150 ${active === item.id ? "" : "grayscale opacity-50"}`}>{item.icon}</span>
            <span className={`text-[10px] tracking-wide transition-all duration-150 ${active === item.id ? "text-red-500 font-semibold" : "text-gray-600 font-medium"}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
