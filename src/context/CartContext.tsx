// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  brand?: string;
  variantName?: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

interface CartContextValue {
  items: CartItem[];
  exchangeRate: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantName?: string) => void;
  updateQuantity: (
    productId: string,
    variantName: string | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalUSD: number;
  totalBs: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "la-despensa-cart";

// Redondea a 2 decimales evitando errores de precisión de punto flotante
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sameItem(
  a: { productId: string; variantName?: string },
  b: { productId: string; variantName?: string }
) {
  return a.productId === b.productId && a.variantName === b.variantName;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  // Al montar: cargamos el carrito guardado y la tasa de cambio actual
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // si el JSON guardado está corrupto, simplemente empezamos con carrito vacío
      }
    }
    setHydrated(true);

    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((data) => setExchangeRate(data.rate))
      .catch(() => setExchangeRate(145.5)); // valor de respaldo si falla el fetch
  }, []);

  // Persistimos en localStorage cada vez que cambia el carrito
  // (solo después de hidratar, para no sobrescribir con [] al cargar la página)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => sameItem(i, item));
      if (existing) {
        return prev.map((i) =>
          sameItem(i, item) ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(productId: string, variantName?: string) {
    setItems((prev) => prev.filter((i) => !sameItem(i, { productId, variantName })));
  }

  function updateQuantity(
    productId: string,
    variantName: string | undefined,
    quantity: number
  ) {
    if (quantity < 1) {
      removeItem(productId, variantName);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (sameItem(i, { productId, variantName }) ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalUSD = round2(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
  const totalBs = round2(totalUSD * exchangeRate);

  return (
    <CartContext.Provider
      value={{
        items,
        exchangeRate,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalUSD,
        totalBs,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
}
