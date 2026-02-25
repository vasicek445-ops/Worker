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
