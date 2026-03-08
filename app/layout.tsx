import { ThemeProvider } from "../lib/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import type { Metadata } from "next";
import "./globals.css"
import AppShell from "./components/AppShell";
import LeadMagnetOverlay from "./components/LeadMagnetOverlay";

export const metadata: Metadata = {
  title: {
    default: "Woker – AI průvodce prací ve Švýcarsku",
    template: "%s | Woker",
  },
  description: "1 007 kontaktů na firmy, 10 AI nástrojů, průvodce povolením, daněmi i bydlením. Vše v jedné appce.",
  metadataBase: new URL("https://www.gowoker.com"),
  openGraph: {
    title: "Woker – AI průvodce prací ve Švýcarsku",
    description: "1 007 kontaktů na švýcarské firmy a agentury. AI životopis, motivační dopis, příprava na pohovor. Průvodce od A do Z.",
    url: "https://www.gowoker.com",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Woker – AI průvodce prací ve Švýcarsku",
    description: "1 007 kontaktů na švýcarské firmy. 10 AI nástrojů. Průvodce od A do Z.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a12" />
      </head>
      <body className="bg-[#0a0a0c]">
        <ThemeProvider><ErrorBoundary><ToastProvider>
          <LanguageProvider><AppShell>{children}</AppShell></LanguageProvider>
        </ToastProvider></ErrorBoundary></ThemeProvider>
      <LeadMagnetOverlay />
            <Analytics /></body>
    </html>
  );
}

