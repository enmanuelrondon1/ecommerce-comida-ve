// src/app/pedido-confirmado/[orderNumber]/page.tsx
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Link from "next/link";
import { WHATSAPP_NUMBER, PAYMENT_INFO } from "@/lib/config";

async function getOrder(orderNumber: string) {
  await connectDB();
  const order = await Order.findOne({ orderNumber }).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
}

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-red)] mb-4">
          PEDIDO NO ENCONTRADO
        </h1>
        <p className="text-[var(--color-ink-soft)] mb-6">
          No encontramos un pedido con ese número.
        </p>
        <Link
          href="/productos"
          className="inline-block bg-[var(--color-red)] text-[var(--color-card)] px-6 py-3 font-semibold"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hola, acabo de hacer el pedido ${order.orderNumber} por Bs ${order.totalBs} ($${order.totalUSD}). Ya realicé el pago por ${PAYMENT_INFO[order.paymentMethod as keyof typeof PAYMENT_INFO].label}${order.paymentReference ? `, referencia: ${order.paymentReference}` : ""}.`
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className="text-center mb-10">
        <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-green)] mb-2">
          ¡Pedido recibido!
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-ink)]">
          {order.orderNumber}
        </h1>
      </div>

      <div className="border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-6 mb-8">
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase text-[var(--color-ink-soft)] mb-3">
          Resumen
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
                {item.variantName ? ` (${item.variantName})` : ""}
              </span>
              <span className="font-[family-name:var(--font-mono)]">
                ${item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-[var(--color-line)] pt-3 flex justify-between items-end">
          <span className="text-sm text-[var(--color-ink-soft)]">Total</span>
          <div className="text-right">
            <p className="font-[family-name:var(--font-mono)] text-xl font-semibold">
              Bs {new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(order.totalBs)}
            </p>
            <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-ink-soft)]">
              ${order.totalUSD.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-[var(--color-ink-soft)] mb-5">
        Escríbenos por WhatsApp para confirmar tu pago y coordinar la entrega.
      </p>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center bg-[var(--color-green)] text-[var(--color-card)] px-6 py-3.5 font-semibold hover:bg-[var(--color-green-dark)] transition-colors"
      >
        Contactar por WhatsApp
      </a>
    </div>
  );
}
