import { LanguageProvider } from "../lib/i18n/LanguageContext";
import type { Metadata } from "next";
import "./globals.css";

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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
