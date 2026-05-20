"use client";
import { usePathname } from "next/navigation";
import SharedHeader from "../components/SharedHeader";
import WokerSidebar from "./_components/WokerSidebar";
import ProfileShell from "./_components/ProfileShell";

// Paths under /profil that should NOT be wrapped in the ProfileShell.
// (Standalone flows with their own layout/UX.)
const STANDALONE_PATHS = ["/profil/nastaveni/predplatne/zrusit"];

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + "/"),
  );

  if (standalone) {
    return (
      <>
        <SharedHeader backHref="/dashboard" />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#0a0a12" }}>
      <WokerSidebar />
      <div className="flex-1 min-w-0">
        <ProfileShell>{children}</ProfileShell>
      </div>
    </div>
  );
}
