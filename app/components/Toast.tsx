"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              animation: "toastIn 0.3s cubic-bezier(0.16,1,0.3,1)",
              whiteSpace: "nowrap",
              ...(t.type === "success"
                ? {
                    background: "rgba(57,255,110,0.15)",
                    border: "1px solid rgba(57,255,110,0.3)",
                    color: "#39ff6e",
                  }
                : t.type === "error"
                ? {
                    background: "rgba(255,59,59,0.15)",
                    border: "1px solid rgba(255,59,59,0.3)",
                    color: "#ff6b6b",
                  }
                : {
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                  }),
            }}
          >
            {t.type === "success" && "✓ "}
            {t.type === "error" && "✗ "}
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
