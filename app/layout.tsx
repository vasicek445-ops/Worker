import { ThemeProvider } from "../lib/ThemeContext";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import Script from "next/script";
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
        {/* Facebook Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','FACEBOOK_PIXEL_ID');fbq('track','PageView');
        `}</Script>
        {/* Google Ads */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=GOOGLE_ADS_ID" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());gtag('config','GOOGLE_ADS_ID');
        `}</Script>

        <ThemeProvider><ErrorBoundary><ToastProvider>
          <LanguageProvider><AppShell>{children}</AppShell></LanguageProvider>
        </ToastProvider></ErrorBoundary></ThemeProvider>
      <LeadMagnetOverlay />
            <Analytics /></body>
    </html>
  );
}

