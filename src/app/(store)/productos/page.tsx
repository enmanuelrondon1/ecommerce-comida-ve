// src/app/productos/page.tsx
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getExchangeRate } from "@/lib/exchangeRate";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

async function getCategories() {
  await connectDB();
  const categories = await Category.find({ active: true }).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

async function getProducts(categoryId?: string): Promise<ProductCardData[]> {
  await connectDB();
  const filter: Record<string, unknown> = { available: true };
  if (categoryId) filter.category = categoryId;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [categories, products, exchangeRate] = await Promise.all([
    getCategories(),
    getProducts(category),
    getExchangeRate(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-green)] mb-8">
        PRODUCTOS
      </h1>

      {/* Filtro de categorías */}
      <div className="flex gap-3 overflow-x-auto pb-6 mb-6 border-b-2 border-[var(--color-line)]">
        <Link
          href="/productos"
          className={`shrink-0 border-2 px-4 py-2 text-sm font-[family-name:var(--font-body)] transition-colors ${
            !category
              ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
              : "border-[var(--color-ink)] hover:bg-[var(--color-yellow)]"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat: any) => (
          <Link
            key={cat._id}
            href={`/productos?category=${cat._id}`}
            className={`shrink-0 border-2 px-4 py-2 text-sm font-[family-name:var(--font-body)] transition-colors ${
              category === cat._id
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                : "border-[var(--color-ink)] hover:bg-[var(--color-yellow)]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Grid de productos, o estado vacío */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              exchangeRate={exchangeRate}
            />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-[var(--color-line)] py-16 text-center">
          <p className="font-[family-name:var(--font-body)] text-[var(--color-ink-soft)]">
            No hay productos disponibles en esta categoría todavía.
          </p>
        </div>
      )}
    </div>
  );
}
