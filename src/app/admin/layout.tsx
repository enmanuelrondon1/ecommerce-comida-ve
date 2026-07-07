// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // El login tiene su propio layout visual (pantalla completa centrada), sin nav de admin
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="border-b-2 border-[var(--color-line)] bg-[var(--color-card)]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-[family-name:var(--font-display)] text-lg text-[var(--color-green)]">
              ADMIN
            </span>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/admin"
                className={pathname === "/admin" ? "font-semibold" : "text-[var(--color-ink-soft)]"}
              >
                Pedidos
              </Link>
              <Link
                href="/admin/productos"
                className={
                  pathname.startsWith("/admin/productos")
                    ? "font-semibold"
                    : "text-[var(--color-ink-soft)]"
                }
              >
                Productos
              </Link>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border-2 border-[var(--color-ink)] px-3 py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
