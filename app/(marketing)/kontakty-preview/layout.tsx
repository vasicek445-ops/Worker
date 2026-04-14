import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1007 ověřených pracovních agentur | Woker",
  description:
    "Přímé kontakty na švýcarské pracovní agentury. Telefonní čísla, e-maily, adresy. Adecco, Manpower, Randstad a další.",
  openGraph: {
    title: "1007 ověřených pracovních agentur | Woker",
    description:
      "Přímé kontakty na švýcarské pracovní agentury. Telefon, email, adresa.",
    url: "https://www.gowoker.com/kontakty-preview",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function KontaktyPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
