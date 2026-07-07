// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-bg)] border-b-2 border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--color-green)]"
        >
          LA DESPENSA
        </Link>

        <nav className="hidden sm:flex items-center gap-6 font-[family-name:var(--font-body)] text-sm">
          <Link href="/" className="hover:text-[var(--color-red)] transition-colors">
            Inicio
          </Link>
          <Link
            href="/productos"
            className="hover:text-[var(--color-red)] transition-colors"
          >
            Productos
          </Link>
        </nav>

        <Link
          href="/carrito"
          aria-label="Ver carrito"
          className="relative inline-block border-2 border-[var(--color-ink)] px-3 py-1.5 text-sm font-[family-name:var(--font-mono)] hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition-colors"
        >
          Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-[var(--color-red)] text-[var(--color-card)] text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
