"use client";
import { useEffect } from "react";

// Woker Landing Page – plná verze s efekty
// Nejjednodušší integrace: vložíme HTML jako statickou stránku

export default function LandingPage() {
  useEffect(() => {
    // Redirect to static HTML landing page
    // Alternativa: použij /public/landing.html přímo
  }, []);

  return (
    <iframe
      src="/landing.html"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
      title="Woker Landing"
    />
  );
}
