"use client";
import SharedHeader from "../components/SharedHeader";

export default function KontaktyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" backLabel="Zpět" />
      {children}
    </>
  );
}
