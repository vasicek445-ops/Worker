import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Woker",
  description: "Najdi práci v zahraničí",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="bg-[#0E0E0E]">
        {children}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 px-4 py-3 z-50">
          <div className="flex justify-around items-center max-w-2xl mx-auto">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#E8302A]">
              <span className="text-xl">🔍</span>
              <span className="text-xs font-bold">Discover</span>
            </Link>
            <Link href="/ulozene" className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
              <span className="text-xl">💾</span>
              <span className="text-xs">Uložené</span>
            </Link>
            <Link href="/pruvodce" className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
              <span className="text-xl">📋</span>
              <span className="text-xs">Průvodce</span>
            </Link>
            <Link href="/prihlasky" className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
              <span className="text-xl">📨</span>
              <span className="text-xs">Přihlášky</span>
            </Link>
            <Link href="/profil" className="flex flex-col items-center gap-1 text-gray-600 hover:text-white transition-colors">
              <span className="text-xl">👤</span>
              <span className="text-xs">Profil</span>
            </Link>
          </div>
        </nav>
        <div className="pb-20"></div>
      </body>
    </html>
  );
}