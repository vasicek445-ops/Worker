"use client";
import { usePathname } from "next/navigation";
import SharedHeader from "../components/SharedHeader";
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

  // AppShell (in root layout) already renders the global <Sidebar />, including for /profil.
  // We only need ProfileShell which provides the tabs nav + content + readiness sidebar.
  return <ProfileShell>{children}</ProfileShell>;
}
