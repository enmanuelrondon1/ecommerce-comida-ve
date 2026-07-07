// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Redondea a 2 decimales evitando errores de precisión de punto flotante (ej: 1.2 * 3 = 3.5999999999999996)
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Genera el siguiente número de orden legible, ej: "ORD-0001", "ORD-0002"
async function generateOrderNumber(): Promise<string> {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });

  if (!lastOrder) {
    return "ORD-0001";
  }

  const lastNumber = parseInt(lastOrder.orderNumber.replace("ORD-", ""), 10);
  const nextNumber = lastNumber + 1;

  return `ORD-${String(nextNumber).padStart(4, "0")}`;
}

// GET /api/orders — lista órdenes, con filtro opcional ?status=<estado> (uso admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las órdenes" },
      { status: 500 }
    );
  }
}

// POST /api/orders — crea una nueva orden desde el checkout del cliente
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { customer, items, paymentMethod, paymentReference, paymentProofUrl, exchangeRate } =
      body;

    // Validaciones básicas de entrada
    if (!customer || !customer.name || !customer.phone || !customer.deliveryZone || !customer.address) {
      return NextResponse.json(
        { success: false, error: "Faltan datos del cliente" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "La orden debe tener al menos un producto" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "El método de pago es obligatorio" },
        { status: 400 }
      );
    }

    // El pago manual (todo excepto efectivo) requiere número de referencia
    if (paymentMethod !== "efectivo" && !paymentReference) {
      return NextResponse.json(
        { success: false, error: "El número de referencia del pago es obligatorio" },
        { status: 400 }
      );
    }

    if (!exchangeRate || exchangeRate <= 0) {
      return NextResponse.json(
        { success: false, error: "La tasa de cambio es obligatoria" },
        { status: 400 }
      );
    }

    // Recalculamos cada item consultando el precio real en la base de datos,
    // en vez de confiar en el precio que venga del cliente (evita manipulación de precios)
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, variantName, quantity } = item;

      if (!productId || !quantity || quantity < 1) {
        return NextResponse.json(
          { success: false, error: "Cada producto debe tener un id y cantidad válida" },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);

      if (!product || !product.available) {
        return NextResponse.json(
          { success: false, error: `El producto ${productId} no está disponible` },
          { status: 400 }
        );
      }

      let unitPrice: number;
      let unit: string;

      if (product.hasVariants) {
        const variant = product.variants.find((v) => v.name === variantName);
        if (!variant) {
          return NextResponse.json(
            { success: false, error: `La presentación "${variantName}" no existe para ${product.name}` },
            { status: 400 }
          );
        }
        unitPrice = variant.price;
        unit = variant.unit;
      } else {
        unitPrice = product.basePrice;
        unit = product.baseUnit;
      }

      const itemSubtotal = round2(unitPrice * quantity);
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        brand: product.brand,
        variantName: product.hasVariants ? variantName : undefined,
        unit,
        unitPrice,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    const totalUSD = round2(subtotal);
    const totalBs = round2(totalUSD * exchangeRate);
    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer,
      items: orderItems,
      subtotal: round2(subtotal),
      exchangeRate,
      totalUSD,
      totalBs,
      paymentMethod,
      paymentReference,
      paymentProofUrl,
      status: "pendiente_pago",
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Error al crear orden:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la orden" },
      { status: 500 }
    );
  }
}