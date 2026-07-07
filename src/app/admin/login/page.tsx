// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "No se pudo iniciar sesión");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-8 flex flex-col gap-4"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-green)] mb-2">
          ADMIN
        </h1>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-bg)]"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-bg)]"
        />

        {error && <p className="text-[var(--color-red)] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--color-green)] text-[var(--color-card)] px-4 py-3 font-semibold hover:bg-[var(--color-green-dark)] transition-colors disabled:opacity-50"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
