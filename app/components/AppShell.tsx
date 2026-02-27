"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const NO_SIDEBAR = ["/login", "/registrace", "/auth/callback", "/pricing", "/reset-heslo"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = NO_SIDEBAR.some(p => pathname?.startsWith(p)) || pathname === "/";

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <div style={{ marginLeft: hideSidebar ? 0 : 260, flex: 1, minHeight: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
