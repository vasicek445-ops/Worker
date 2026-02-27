"use client";
import SharedHeader from "../components/SharedHeader";

export default function PruvodceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" backLabel="Zpět" />
      {children}
    </>
  );
}
