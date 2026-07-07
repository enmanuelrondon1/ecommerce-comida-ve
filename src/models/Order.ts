// src/models/Order.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// Métodos de pago manuales disponibles en Venezuela
export type PaymentMethod = "pago_movil" | "zelle" | "binance" | "efectivo";

// Estados del ciclo de vida de una orden
export type OrderStatus =
  | "pendiente_pago" // orden creada, esperando que el cliente pague y reporte
  | "pago_reportado" // cliente reportó el pago, esperando confirmación del admin
  | "confirmado" // admin verificó el pago
  | "en_preparacion"
  | "en_camino"
  | "entregado"
  | "cancelado";

// Snapshot de cada producto comprado — se guarda tal como estaba al momento de la compra,
// para que cambios futuros en el catálogo no alteren órdenes ya creadas
interface IOrderItem {
  product: mongoose.Types.ObjectId; // referencia al producto original, por si se quiere consultar
  name: string;
  brand?: string;
  variantName?: string; // ej: "1kg" — solo si el producto tenía variantes
  unit: string; // ej: "kg", "unidad"
  unitPrice: number; // precio en USD al momento de la compra
  quantity: number;
  subtotal: number; // unitPrice * quantity
}

interface ICustomer {
  name: string;
  phone: string;
  deliveryZone: string; // ej: "Chacao, Caracas" — zona/municipio, no código postal
  address: string; // dirección detallada dentro de la zona
  notes?: string; // referencias adicionales para la entrega
}

export interface IOrder extends Document {
  orderNumber: string; // identificador corto y legible, ej: "ORD-0001"
  customer: ICustomer;
  items: IOrderItem[];
  subtotal: number; // suma de todos los items, en USD
  exchangeRate: number; // tasa Bs/USD aplicada al momento de la orden
  totalUSD: number;
  totalBs: number; // totalUSD * exchangeRate, calculado y guardado (no recalculado después)
  paymentMethod: PaymentMethod;
  paymentReference?: string; // número de referencia del pago (Pago Móvil/Zelle/Binance)
  paymentProofUrl?: string; // URL de Cloudinary con la captura del comprobante
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    brand: { type: String },
    variantName: { type: String },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: [true, "El nombre del cliente es obligatorio"], trim: true },
    phone: { type: String, required: [true, "El teléfono es obligatorio"], trim: true },
    deliveryZone: { type: String, required: [true, "La zona de entrega es obligatoria"], trim: true },
    address: { type: String, required: [true, "La dirección es obligatoria"], trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "La orden debe tener al menos un producto",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRate: {
      type: Number,
      required: [true, "La tasa de cambio aplicada es obligatoria"],
      min: 0,
    },
    totalUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    totalBs: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["pago_movil", "zelle", "binance", "efectivo"],
      required: [true, "El método de pago es obligatorio"],
    },
    paymentReference: {
      type: String,
      trim: true,
      // no es 'required' a nivel de schema porque en pago 'efectivo' no aplica;
      // esa validación condicional se hace mejor en la API route
    },
    paymentProofUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "pendiente_pago",
        "pago_reportado",
        "confirmado",
        "en_preparacion",
        "en_camino",
        "entregado",
        "cancelado",
      ],
      default: "pendiente_pago",
    },
  },
  { timestamps: true }
);

// Acelera las consultas del panel admin: filtrar por estado, ordenar por fecha
OrderSchema.index({ status: 1, createdAt: -1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;