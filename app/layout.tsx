import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import type { Metadata } from "next";
import "./globals.css"
import Sidebar from "./components/Sidebar";

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
      <body className="bg-[#0a0a0c]">
        <ErrorBoundary>
          <LanguageProvider><div className="flex min-h-screen"><Sidebar /><div className="flex-1 ml-0 sidebar-content">{children}</div></div></LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

