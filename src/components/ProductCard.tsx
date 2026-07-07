// src/components/ProductCard.tsx
"use client";

import { useState } from "react";
import PriceTag from "./PriceTag";
import { useCart } from "@/context/CartContext";

// Tipo mínimo necesario para renderizar la tarjeta — evita acoplarse al tipo completo de Mongoose
export interface ProductCardData {
  _id: string;
  name: string;
  brand?: string;
  image: string;
  basePrice: number;
  baseUnit: string;
  hasVariants: boolean;
  variants: { name: string; unit: string; price: number }[];
}

interface ProductCardProps {
  product: ProductCardData;
  exchangeRate: number;
}

export default function ProductCard({ product, exchangeRate }: ProductCardProps) {
  const { addItem } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.hasVariants ? product.variants[0]?.name : undefined
  );
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant = product.hasVariants
    ? product.variants.find((v) => v.name === selectedVariant)
    : undefined;

  const displayPrice = product.hasVariants
    ? activeVariant?.price ?? product.variants[0]?.price ?? 0
    : product.basePrice;

  const displayUnit = product.hasVariants ? activeVariant?.unit : product.baseUnit;

  function handleAddToCart() {
    addItem({
      productId: product._id,
      name: product.name,
      brand: product.brand,
      variantName: product.hasVariants ? selectedVariant : undefined,
      unit: displayUnit ?? "unidad",
      unitPrice: displayPrice,
      image: product.image,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="bg-[var(--color-card)] border-2 border-[var(--color-ink)] p-4 flex flex-col gap-3 hover:-translate-y-1 transition-transform">
      <div className="aspect-square bg-[var(--color-bg)] flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1">
        {product.brand && (
          <p className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wide text-[var(--color-ink-soft)]">
            {product.brand}
          </p>
        )}
        <h3 className="font-[family-name:var(--font-body)] font-semibold leading-snug">
          {product.name}
        </h3>

        {product.hasVariants && (
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="mt-1.5 text-xs border-2 border-[var(--color-line)] px-2 py-1 bg-[var(--color-bg)] w-full"
          >
            {product.variants.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <PriceTag usd={displayPrice} bs={displayPrice * exchangeRate} unit={displayUnit} />

        <button
          onClick={handleAddToCart}
          disabled={justAdded}
          className={`border-2 text-sm px-3 py-1.5 font-[family-name:var(--font-body)] font-medium transition-colors ${
            justAdded
              ? "border-[var(--color-green)] bg-[var(--color-green)] text-[var(--color-card)]"
              : "border-[var(--color-green)] text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-[var(--color-card)]"
          }`}
        >
          {justAdded ? "Agregado ✓" : "Agregar"}
        </button>
      </div>
    </article>
  );
}
