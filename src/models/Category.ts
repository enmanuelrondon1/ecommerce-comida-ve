// src/models/Category.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es obligatorio"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0, // controla el orden de aparición en el menú
    },
    active: {
      type: Boolean,
      default: true, // permite ocultar categorías sin borrarlas
    },
  },
  { timestamps: true }
);

// Evita el error "OverwriteModelError" en hot-reload de Next.js
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;