// src/models/Product.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Unidades de venta comunes en una despensa venezolana
export type ProductUnit = "unidad" | "kg" | "g" | "litro" | "ml" | "paquete";

// Presentación: ej. "1kg", "500g", "Docena" — cada una con su propio precio y unidad
interface IVariant {
  name: string; // ej: "1kg", "500g", "Docena", "Paquete x6"
  unit: ProductUnit;
  price: number; // precio en USD para esta presentación específica
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  brand?: string; // marca en texto libre, ej: "P.A.N.", "Margarita", "Robin Hood"
  image: string;
  basePrice: number; // precio en USD, usado si hasVariants es false
  baseUnit: ProductUnit; // unidad de venta cuando no hay variantes
  hasVariants: boolean;
  variants: IVariant[];
  available: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    name: { type: String, required: true, trim: true },
    unit: {
      type: String,
      enum: ["unidad", "kg", "g", "litro", "ml", "paquete"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    brand: {
      type: String,
      trim: true,
      // opcional: no todos los productos tienen marca relevante (ej: verduras a granel)
    },
    image: {
      type: String,
      required: [true, "La imagen del producto es obligatoria"],
    },
    basePrice: {
      type: Number,
      required: [true, "El precio base es obligatorio"],
      min: 0,
    },
    baseUnit: {
      type: String,
      enum: ["unidad", "kg", "g", "litro", "ml", "paquete"],
      required: [true, "La unidad de venta es obligatoria"],
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: {
      type: [VariantSchema],
      default: [],
      // Solo validamos que existan variantes si hasVariants es true
      validate: {
        validator: function (this: any, variants: IVariant[]) {
          const hasVariants = (this as IProduct).hasVariants;
          if (hasVariants) {
            return variants.length > 0;
          }
          return true;
        },
        message: "Si el producto tiene variantes, debe incluir al menos una",
      },
    },
    available: {
      type: Boolean,
      default: true, // disponible / agotado
    },
    featured: {
      type: Boolean,
      default: false, // útil para destacar productos en el home
    },
  },
  { timestamps: true }
);

// Índice para acelerar filtrado por categoría + disponibilidad (uso muy común en el menú)
ProductSchema.index({ category: 1, available: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;