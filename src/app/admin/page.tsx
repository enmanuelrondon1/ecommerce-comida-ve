// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

interface OrderItem {
  name: string;
  brand?: string;
  variantName?: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string; deliveryZone: string; address: string };
  items: OrderItem[];
  totalUSD: number;
  totalBs: number;
  paymentMethod: string;
  paymentReference?: string;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pago_reportado: "Pago reportado",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function loadOrders() {
    setLoading(true);
    const url = statusFilter ? `/api/orders?status=${statusFilter}` : "/api/orders";
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(orderId: string, newStatus: string) {
    // Actualización optimista: cambiamos en pantalla antes de que responda el servidor
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Si falla, recargamos para revertir al estado real
      loadOrders();
      showToast("No se pudo actualizar el estado", "error");
    } else {
      showToast(`Estado actualizado a "${STATUS_LABELS[newStatus]}"`, "success");
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-green)] mb-6">
        PEDIDOS
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        <button
          onClick={() => setStatusFilter("")}
          className={`shrink-0 border-2 px-3 py-1.5 text-sm ${
            statusFilter === ""
              ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
              : "border-[var(--color-line)]"
          }`}
        >
          Todos
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`shrink-0 border-2 px-3 py-1.5 text-sm whitespace-nowrap ${
              statusFilter === status
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                : "border-[var(--color-line)]"
            }`}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--color-ink-soft)]">Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-[var(--color-ink-soft)]">No hay pedidos en este estado.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border-2 border-[var(--color-ink)] bg-[var(--color-card)] p-5"
            >
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-[family-name:var(--font-mono)] font-semibold text-lg">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {new Date(order.createdAt).toLocaleString("es-VE")}
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="border-2 border-[var(--color-ink)] px-3 py-1.5 text-sm bg-[var(--color-bg)]"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="text-[var(--color-ink-soft)]">{order.customer.phone}</p>
                  <p className="text-[var(--color-ink-soft)]">
                    {order.customer.deliveryZone} — {order.customer.address}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="text-[var(--color-ink-soft)]">Pago: </span>
                    {order.paymentMethod}
                    {order.paymentReference ? ` (ref: ${order.paymentReference})` : ""}
                  </p>
                  <p className="font-[family-name:var(--font-mono)] font-semibold mt-1">
                    Bs {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(order.totalBs)}
                    {" · "}${order.totalUSD.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t-2 border-[var(--color-line)] pt-3 text-sm">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.quantity}x {item.name}
                    {item.variantName ? ` (${item.variantName})` : ""}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
