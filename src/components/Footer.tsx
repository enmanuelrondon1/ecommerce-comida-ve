// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-[var(--color-line)] bg-[var(--color-card)]">
      <div className="max-w-6xl mx-auto px-5 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[var(--color-green)] mb-2">
            LA DESPENSA
          </p>
          <p className="text-sm text-[var(--color-ink-soft)]">
            Víveres y productos de despensa, entregados en tu zona.
          </p>
        </div>

        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">
            Métodos de pago
          </p>
          <p className="text-sm">Pago Móvil · Zelle · Binance · Efectivo</p>
        </div>

        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">
            Contacto
          </p>
          <p className="text-sm">Escríbenos por WhatsApp para tu pedido</p>
        </div>
      </div>
    </footer>
  );
}
