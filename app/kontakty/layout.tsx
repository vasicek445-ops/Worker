"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function KontaktyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" backLabel="Zpět" />
      {children}
      <BottomNav active="contacts" />
    </>
  );
}
