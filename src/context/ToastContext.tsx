// src/context/ToastContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-xs w-full px-5 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`border-2 px-4 py-3 bg-[var(--color-card)] shadow-[3px_3px_0_var(--color-ink)] flex items-start gap-3 ${
              toast.type === "success" ? "border-[var(--color-green)]" : "border-[var(--color-red)]"
            }`}
          >
            <span
              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                toast.type === "success" ? "bg-[var(--color-green)]" : "bg-[var(--color-red)]"
              }`}
            />
            <p className="text-sm flex-1 font-[family-name:var(--font-body)]">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] text-sm shrink-0"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}
