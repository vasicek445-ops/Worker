import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nabídky práce ve Švýcarsku | Woker",
  description:
    "Aktuální nabídky práce ve Švýcarsku pro české a slovenské pracovníky. 1007 ověřených agentur, nové pozice každý den. Bez poplatků.",
  openGraph: {
    title: "Nabídky práce ve Švýcarsku | Woker",
    description:
      "Aktuální nabídky práce ve Švýcarsku. 1007 ověřených agentur, nové pozice každý den.",
    url: "https://www.gowoker.com/prace",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function PraceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
