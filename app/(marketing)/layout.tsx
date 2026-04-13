import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Woker - Prace a bydleni ve Svycarsku",
  description:
    "Nabidky prace, bydleni po celem Svycarsku a dokumenty v nemcine. 3188 ubytovani, 1007 agentur. Bez poplatku.",
  openGraph: {
    title: "Woker - Prace a bydleni ve Svycarsku",
    description:
      "Nabidky prace, bydleni a dokumenty v nemcine. 3188 ubytovani, 1007 agentur.",
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
