#!/bin/bash
echo "🔧 Adding shared header + nav to all pages..."

# 1. SharedHeader
cat > app/components/SharedHeader.tsx << 'SHEOF'
"use client";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

export default function SharedHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <div className="relative z-10 px-5 pt-6 pb-2">
      <div className="flex items-center justify-between">
        <div>
          {backHref ? (
            <Link href={backHref} className="text-gray-500 text-sm hover:text-gray-400 transition-colors">
              ← {backLabel || "Zpět"}
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <span className="text-red-500 font-bold text-lg tracking-tight">Woker</span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/profil" className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-500/30">W</Link>
        </div>
      </div>
    </div>
  );
}
SHEOF
echo "  ✅ SharedHeader.tsx"

# 2. BottomNav
cat > app/components/BottomNav.tsx << 'BNEOF'
"use client";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";

export default function BottomNav({ active }: { active: "home" | "contacts" | "guide" | "jobs" | "profile" }) {
  const { t } = useLanguage();
  const items = [
    { icon: "🏠", label: t.nav.overview, href: "/dashboard", id: "home" as const },
    { icon: "📇", label: t.nav.contacts, href: "/kontakty", id: "contacts" as const },
    { icon: "📖", label: t.nav.guide, href: "/pruvodce", id: "guide" as const },
    { icon: "💼", label: t.nav.jobs, href: "/nabidka", id: "jobs" as const },
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
BNEOF
echo "  ✅ BottomNav.tsx"

# 3. Pruvodce layout
cat > app/pruvodce/layout.tsx << 'PLEOF'
"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function PruvodceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" backLabel="Zpět" />
      {children}
      <BottomNav active="guide" />
    </>
  );
}
PLEOF
echo "  ✅ Pruvodce layout"

# 4. Kontakty layout
cat > app/kontakty/layout.tsx << 'KLEOF'
"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function KontaktyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" backLabel="Zpět" />
      {children}
      <BottomNav active="contacts" />
    </>
  );
}
KLEOF
echo "  ✅ Kontakty layout"

# 5. Profil layout
mkdir -p app/profil
cat > app/profil/layout.tsx << 'PREOF'
"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" />
      {children}
      <BottomNav active="profile" />
    </>
  );
}
PREOF
echo "  ✅ Profil layout"

# 6. Jazyky layout
mkdir -p app/jazyky
cat > app/jazyky/layout.tsx << 'JLEOF'
"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function JazykyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" />
      {children}
      <BottomNav active="guide" />
    </>
  );
}
JLEOF
echo "  ✅ Jazyky layout"

echo ""
echo "═══════════════════════════════════════"
echo "✅ All done! Shared header + nav ready."
echo "═══════════════════════════════════════"
echo ""
echo "🚀 Now run:"
echo "  git add -A && git commit -m 'feat: shared header + nav on all pages' && git push"
