"use client";
import SharedHeader from "../components/SharedHeader";
import BottomNav from "../components/BottomNav";

export default function JazykyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" />
      {children}
      <BottomNav active="guide" />
    </>
  );
}
