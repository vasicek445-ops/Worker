"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
const NO_SIDEBAR = ["/login", "/registrace", "/auth/callback", "/pricing", "/reset-heslo", "/podminky", "/ochrana-udaju", "/blog", "/pro", "/cenik", "/zdarma", "/prace", "/bydleni-preview", "/dokumenty-preview", "/kontakty-preview"];
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = NO_SIDEBAR.some(p => pathname?.startsWith(p)) || pathname === "/";
  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <div className={`flex-1 min-h-screen ${hideSidebar ? '' : 'md:ml-[260px]'}`}>
        {children}
      </div>
    </div>
  );
}
