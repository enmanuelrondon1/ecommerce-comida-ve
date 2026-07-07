// src/app/carrito/page.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalUSD, totalBs, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-green)] mb-4">
          TU CARRITO
        </h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          Todavía no has agregado productos.
        </p>
        <Link
          href="/productos"
          className="inline-block bg-[var(--color-red)] text-[var(--color-card)] px-6 py-3 font-semibold hover:bg-[var(--color-green)] transition-colors"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-green)] mb-8">
        TU CARRITO
      </h1>

      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantName ?? "base"}`}
            className="flex items-center gap-4 bg-[var(--color-card)] border-2 border-[var(--color-ink)] p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover bg-[var(--color-bg)] shrink-0"
            />

            <div className="flex-1 min-w-0">
              {item.brand && (
                <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase text-[var(--color-ink-soft)]">
                  {item.brand}
                </p>
              )}
              <p className="font-semibold truncate">{item.name}</p>
              {item.variantName && (
                <p className="text-sm text-[var(--color-ink-soft)]">{item.variantName}</p>
              )}
              <p className="text-sm font-[family-name:var(--font-mono)]">
                ${item.unitPrice.toFixed(2)} / {item.unit}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.variantName, item.quantity - 1)
                }
                disabled={item.quantity <= 1}
                className="w-7 h-7 border-2 border-[var(--color-ink)] flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--color-ink)] disabled:cursor-not-allowed"
                aria-label="Restar uno"
              >
                −
              </button>
              <span className="w-6 text-center font-[family-name:var(--font-mono)]">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.productId, item.variantName, item.quantity + 1)
                }
                className="w-7 h-7 border-2 border-[var(--color-ink)] flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition-colors"
                aria-label="Sumar uno"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.productId, item.variantName)}
              className="text-sm text-[var(--color-red)] hover:underline shrink-0"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-[var(--color-line)] pt-6 flex flex-col items-end gap-1">
        <p className="text-sm text-[var(--color-ink-soft)]">{totalItems} producto(s)</p>
        <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">
          Bs {new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(totalBs)}
        </p>
        <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-ink-soft)]">
          ${totalUSD.toFixed(2)}
        </p>

        <Link
          href="/checkout"
          className="mt-4 bg-[var(--color-red)] text-[var(--color-card)] px-6 py-3 font-semibold hover:bg-[var(--color-green)] transition-colors"
        >
          Finalizar pedido
        </Link>
      </div>
    </div>
  );
}
