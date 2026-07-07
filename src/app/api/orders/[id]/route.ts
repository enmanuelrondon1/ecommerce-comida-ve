// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

const VALID_STATUSES = [
  "pendiente_pago",
  "pago_reportado",
  "confirmado",
  "en_preparacion",
  "en_camino",
  "entregado",
  "cancelado",
];

// PATCH /api/orders/:id — actualiza el estado de una orden (uso admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Estado inválido" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la orden" },
      { status: 500 }
    );
  }
}
