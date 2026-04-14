import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bydlení ve Švýcarsku | Woker",
  description:
    "3188 ubytování ve Švýcarsku. Penziony, ubytovny, byty i kláštery ve 26 kantonech. Najdi si ubytování ještě před odletem.",
  openGraph: {
    title: "Bydlení ve Švýcarsku | Woker",
    description:
      "3188 ubytování ve Švýcarsku. Penziony, ubytovny, byty ve 26 kantonech.",
    url: "https://www.gowoker.com/bydleni-preview",
    siteName: "Woker",
    locale: "cs_CZ",
    type: "website",
  },
};

export default function BydleniPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
