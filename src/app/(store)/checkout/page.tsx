// src/app/checkout/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { PAYMENT_INFO, PaymentMethodKey } from "@/lib/config";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, exchangeRate, totalUSD, totalBs, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("pago_movil");
  const [paymentReference, setPaymentReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-green)] mb-4">
          CHECKOUT
        </h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          Tu carrito está vacío, agrega productos antes de continuar.
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !phone || !deliveryZone || !address) {
      setError("Completa todos los datos de entrega.");
      return;
    }

    if (paymentMethod !== "efectivo" && !paymentReference) {
      setError("Ingresa el número de referencia del pago.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, deliveryZone, address, notes: notes || undefined },
          items: items.map((i) => ({
            productId: i.productId,
            variantName: i.variantName,
            quantity: i.quantity,
          })),
          paymentMethod,
          paymentReference: paymentMethod === "efectivo" ? undefined : paymentReference,
          exchangeRate,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Ocurrió un error al crear tu orden.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/pedido-confirmado/${data.data.orderNumber}`);
    } catch {
      setError("No pudimos conectar con el servidor. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-green)] mb-8">
        CHECKOUT
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Datos de entrega */}
        <fieldset className="flex flex-col gap-4">
          <legend className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-wide text-[var(--color-ink-soft)] mb-1">
            Datos de entrega
          </legend>

          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
          />
          <input
            type="tel"
            placeholder="Teléfono (ej: 0414-1234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
          />
          <input
            type="text"
            placeholder="Zona de entrega (ej: Chacao, Caracas)"
            value={deliveryZone}
            onChange={(e) => setDeliveryZone(e.target.value)}
            className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
          />
          <textarea
            placeholder="Dirección detallada"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)] resize-none"
          />
          <textarea
            placeholder="Notas adicionales (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="border-2 border-[var(--color-line)] px-4 py-2.5 bg-[var(--color-card)] resize-none"
          />
        </fieldset>

        {/* Método de pago */}
        <fieldset className="flex flex-col gap-3">
          <legend className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-wide text-[var(--color-ink-soft)] mb-1">
            Método de pago
          </legend>

          {(Object.keys(PAYMENT_INFO) as PaymentMethodKey[]).map((key) => (
            <label
              key={key}
              className={`border-2 p-4 cursor-pointer transition-colors ${
                paymentMethod === key
                  ? "border-[var(--color-green)] bg-[var(--color-card)]"
                  : "border-[var(--color-line)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={key}
                  checked={paymentMethod === key}
                  onChange={() => setPaymentMethod(key)}
                />
                <span className="font-semibold">{PAYMENT_INFO[key].label}</span>
              </div>

              {paymentMethod === key && (
                <div className="mt-3 ml-6 text-sm text-[var(--color-ink-soft)] font-[family-name:var(--font-mono)]">
                  {PAYMENT_INFO[key].details.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              )}
            </label>
          ))}

          {paymentMethod !== "efectivo" && (
            <input
              type="text"
              placeholder="Número de referencia del pago"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)] mt-1"
            />
          )}
        </fieldset>

        {/* Resumen de totales */}
        <div className="border-t-2 border-[var(--color-line)] pt-4 flex flex-col items-end gap-1">
          <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold">
            Bs {new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(totalBs)}
          </p>
          <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-ink-soft)]">
            ${totalUSD.toFixed(2)}
          </p>
        </div>

        {error && (
          <p className="text-[var(--color-red)] text-sm font-medium border-2 border-[var(--color-red)] px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[var(--color-red)] text-[var(--color-card)] px-6 py-3.5 font-semibold hover:bg-[var(--color-green)] transition-colors disabled:opacity-50"
        >
          {submitting ? "Enviando pedido..." : "Confirmar pedido"}
        </button>
      </form>
    </div>
  );
}
