"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Home,
  Briefcase,
  Building2,
  Contact,
  MailOpen,
  FileText,
  Wrench,
  MessageCircle,
  Sparkles,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ICON_SIZE = 20;
const ICON_STROKE = 1.75;
const ACCENT = "#ff8c2b"; // orange brand for icons

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActivePath = (href: string) => pathname === href;
  const isToolsActive =
    pathname?.startsWith("/pruvodce") || pathname?.startsWith("/jazyky");

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm no-underline ${
      active
        ? "bg-[#ff8c2b]/[0.10] text-white font-semibold border border-[#ff8c2b]/20 shadow-[0_0_12px_rgba(255,140,43,0.06)]"
        : "text-white/50 hover:text-white hover:bg-white/[0.04] border border-transparent"
    }`;

  const iconColor = (active: boolean) =>
    active ? ACCENT : "rgba(255,140,43,0.7)";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 no-underline group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-[0_4px_12px_rgba(255,140,43,0.25)] group-hover:shadow-[0_4px_18px_rgba(255,140,43,0.4)] transition-all"
            style={{
              background: "linear-gradient(135deg, #ff8c2b 0%, #ff6a1f 100%)",
            }}
          >
            W
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">
            Woker
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-white/40 hover:text-white p-1 transition"
        >
          <X size={18} strokeWidth={ICON_STROKE} />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 pt-1 pb-2">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Hlavní
          </span>
        </div>

        {[
          { href: "/dashboard", icon: Home, label: "Domů" },
          { href: "/nabidky", icon: Briefcase, label: "Nabídky práce" },
          { href: "/bydleni", icon: Building2, label: "Bydlení" },
          {
            href: "/kontakty",
            icon: Contact,
            label: "Kontakty",
            badge: { text: "1007", className: "bg-[#ff8c2b]/15 text-[#ff8c2b]" },
          },
          { href: "/prihlasky", icon: MailOpen, label: "Moje přihlášky" },
          { href: "/dokumenty", icon: FileText, label: "Moje dokumenty" },
        ].map((it) => {
          const active = isActivePath(it.href);
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className={linkClass(active)}>
              <Icon
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color={iconColor(active)}
              />
              <span>{it.label}</span>
              {it.badge && (
                <span
                  className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${it.badge.className}`}
                >
                  {it.badge.text}
                </span>
              )}
            </Link>
          );
        })}

        <Link href="/pruvodce" className={linkClass(isToolsActive)}>
          <Wrench
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color={iconColor(isToolsActive)}
          />
          <span>Nástroje</span>
          <span className="ml-auto text-[9px] bg-[#ff8c2b]/15 text-[#ff8c2b] font-bold px-1.5 py-0.5 rounded-full">
            AI
          </span>
        </Link>

        <div className="px-3 pt-5 pb-2">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Další
          </span>
        </div>

        <Link
          href="/komunita"
          className={linkClass(isActivePath("/komunita"))}
        >
          <MessageCircle
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color={iconColor(isActivePath("/komunita"))}
          />
          <span>Komunita</span>
        </Link>

        <Link
          href="/dashboard#wooky"
          className={linkClass(false)}
        >
          <Sparkles
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color={iconColor(false)}
          />
          <span>Wooky AI</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-[#ff8c2b] shadow-[0_0_8px_rgba(255,140,43,0.5)]" />
        </Link>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all border border-transparent"
        >
          <LogOut
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="rgba(255,140,43,0.7)"
          />
          <span>Odhlásit se</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile-only hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-[#111120]/90 backdrop-blur-sm border border-white/[0.08] rounded-xl p-2.5 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        style={{ display: mobileOpen ? "none" : "block" }}
        aria-label="Otevřít menu"
      >
        <Menu size={20} strokeWidth={ICON_STROKE} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always visible on md+, slide on mobile */}
      <aside
        className={`
        fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-[80] overflow-y-auto
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
        style={{
          background:
            "linear-gradient(180deg, #0d0d1a 0%, #0a0a12 50%, #080812 100%)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff8c2b]/[0.04] blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-24 h-24 bg-[#ff6a1f]/[0.05] blur-[50px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col flex-1">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
