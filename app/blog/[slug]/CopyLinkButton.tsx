"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "rgba(57,255,110,0.15)" : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "8px 16px",
        color: copied ? "#39ff6e" : "rgba(255,255,255,0.55)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {copied ? "✓ Zkopírováno" : "Kopírovat odkaz"}
    </button>
  );
}
