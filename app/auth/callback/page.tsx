"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙️</div>
        <p className="text-white font-bold">Přihlašuji...</p>
      </div>
    </main>
  );
}
