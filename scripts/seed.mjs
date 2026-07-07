// scripts/seed.mjs
import mongoose from "mongoose";
import { config } from "dotenv";

config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

// Schemas simplificados solo para el seed (no dependemos de los .ts compilados)
const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    order: Number,
    active: Boolean,
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,
    image: String,
    basePrice: Number,
    baseUnit: String,
    hasVariants: Boolean,
    variants: [{ name: String, unit: String, price: Number, _id: false }],
    available: Boolean,
    featured: Boolean,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

const categoriesData = [
  { name: "Granos y Cereales", slug: "granos-cereales", order: 1, active: true },
  { name: "Enlatados", slug: "enlatados", order: 2, active: true },
  { name: "Lácteos y Huevos", slug: "lacteos-huevos", order: 3, active: true },
  { name: "Panadería", slug: "panaderia", order: 4, active: true },
  { name: "Aseo Personal", slug: "aseo-personal", order: 5, active: true },
  { name: "Limpieza del Hogar", slug: "limpieza-hogar", order: 6, active: true },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("❌ No se encontró MONGODB_URI en .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiamos datos previos para poder correr el seed varias veces sin duplicar
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🧹 Colecciones limpiadas");

    const categories = await Category.insertMany(categoriesData);
    console.log(`📁 ${categories.length} categorías creadas`);

    const findCat = (slug) => categories.find((c) => c.slug === slug)._id;

    const productsData = [
      {
        name: "Harina P.A.N.",
        slug: "harina-pan",
        description: "Harina de maíz precocida, blanca, ideal para arepas.",
        category: findCat("granos-cereales"),
        brand: "P.A.N.",
        image: "https://via.placeholder.com/400x400?text=Harina+PAN",
        basePrice: 0,
        baseUnit: "kg",
        hasVariants: true,
        variants: [
          { name: "500g", unit: "g", price: 0.9 },
          { name: "1kg", unit: "kg", price: 1.6 },
        ],
        available: true,
        featured: true,
      },
      {
        name: "Arroz Mary",
        slug: "arroz-mary",
        description: "Arroz blanco de grano largo, tipo 1.",
        category: findCat("granos-cereales"),
        brand: "Mary",
        image: "https://via.placeholder.com/400x400?text=Arroz+Mary",
        basePrice: 1.4,
        baseUnit: "kg",
        hasVariants: false,
        variants: [],
        available: true,
        featured: false,
      },
      {
        name: "Atún Margarita",
        slug: "atun-margarita",
        description: "Atún en trozos, en aceite vegetal, lata de 170g.",
        category: findCat("enlatados"),
        brand: "Margarita",
        image: "https://via.placeholder.com/400x400?text=Atun+Margarita",
        basePrice: 1.2,
        baseUnit: "unidad",
        hasVariants: false,
        variants: [],
        available: true,
        featured: true,
      },
      {
        name: "Leche en Polvo Nido",
        slug: "leche-nido",
        description: "Leche completa en polvo, fortificada.",
        category: findCat("lacteos-huevos"),
        brand: "Nido",
        image: "https://via.placeholder.com/400x400?text=Leche+Nido",
        basePrice: 0,
        baseUnit: "g",
        hasVariants: true,
        variants: [
          { name: "400g", unit: "g", price: 5.5 },
          { name: "800g", unit: "g", price: 10.2 },
        ],
        available: true,
        featured: false,
      },
      {
        name: "Huevos",
        slug: "huevos",
        description: "Huevos frescos tipo A.",
        category: findCat("lacteos-huevos"),
        brand: "",
        image: "https://via.placeholder.com/400x400?text=Huevos",
        basePrice: 0.25,
        baseUnit: "unidad",
        hasVariants: false,
        variants: [],
        available: true,
        featured: false,
      },
      {
        name: "Pan de Sándwich",
        slug: "pan-sandwich",
        description: "Pan de molde blanco, rebanado.",
        category: findCat("panaderia"),
        brand: "Holsum",
        image: "https://via.placeholder.com/400x400?text=Pan+Sandwich",
        basePrice: 2.0,
        baseUnit: "paquete",
        hasVariants: false,
        variants: [],
        available: true,
        featured: false,
      },
      {
        name: "Papel Higiénico Rosal",
        slug: "papel-higienico-rosal",
        description: "Papel higiénico doble hoja.",
        category: findCat("aseo-personal"),
        brand: "Rosal",
        image: "https://via.placeholder.com/400x400?text=Papel+Higienico",
        basePrice: 0,
        baseUnit: "paquete",
        hasVariants: true,
        variants: [
          { name: "Paquete x4", unit: "paquete", price: 2.5 },
          { name: "Paquete x12", unit: "paquete", price: 6.8 },
        ],
        available: true,
        featured: false,
      },
      {
        name: "Detergente Ariel",
        slug: "detergente-ariel",
        description: "Detergente en polvo para ropa.",
        category: findCat("limpieza-hogar"),
        brand: "Ariel",
        image: "https://via.placeholder.com/400x400?text=Detergente+Ariel",
        basePrice: 3.5,
        baseUnit: "kg",
        hasVariants: false,
        variants: [],
        available: true,
        featured: false,
      },
    ];

    const products = await Product.insertMany(productsData);
    console.log(`🛒 ${products.length} productos creados`);

    console.log("✅ Seed completado con éxito");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en el seed:", error.message);
    process.exit(1);
  }
}

seed();
