import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Woker - Práce a bydlení ve Švýcarsku",
  description:
    "Nabídky práce, bydlení po celém Švýcarsku a dokumenty v němčině. 3188 ubytování, 1007 agentur. Bez poplatků.",
  openGraph: {
    title: "Woker - Práce a bydlení ve Švýcarsku",
    description:
      "Nabídky práce, bydlení a dokumenty v němčině. 3188 ubytování, 1007 agentur.",
    url: "https://www.gowoker.com",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
