"use client";
import SharedHeader from "../components/SharedHeader";

export default function JazykyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SharedHeader backHref="/dashboard" />
      {children}
    </>
  );
}
