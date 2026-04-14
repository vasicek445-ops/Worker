import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumenty v němčině za minutu | Woker",
  description:
    "AI vygeneruje profesionální životopis, motivační dopis i Bewerbungsdossier v němčině. Zadej česky, dostaneš německy.",
  openGraph: {
    title: "Dokumenty v němčině za minutu | Woker",
    description:
      "AI životopis a motivační dopis v němčině. Zadej česky, dostaneš německy.",
    url: "https://www.gowoker.com/dokumenty-preview",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function DokumentyPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
