// src/app/admin/productos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  brand?: string;
  category: { name: string };
  basePrice: number;
  baseUnit: string;
  hasVariants: boolean;
  available: boolean;
  featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products?all=true");
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function toggleAvailable(product: Product) {
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, available: !p.available } : p))
    );
    await fetch(`/api/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
  }

  async function handleDelete(productId: string) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;

    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-green)]">
          PRODUCTOS
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="bg-[var(--color-red)] text-[var(--color-card)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-green)] transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {loading ? (
        <p className="text-[var(--color-ink-soft)]">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-4 border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {product.name}
                  {product.featured && (
                    <span className="ml-2 text-xs text-[var(--color-yellow)] bg-[var(--color-ink)] px-1.5 py-0.5">
                      Destacado
                    </span>
                  )}
                </p>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  {product.category?.name} · {product.brand || "sin marca"}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm shrink-0">
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={() => toggleAvailable(product)}
                />
                Disponible
              </label>

              <Link
                href={`/admin/productos/${product._id}/editar`}
                className="text-sm border-2 border-[var(--color-ink)] px-3 py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] transition-colors shrink-0"
              >
                Editar
              </Link>

              <button
                onClick={() => handleDelete(product._id)}
                className="text-sm text-[var(--color-red)] hover:underline shrink-0"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
