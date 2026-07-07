// src/app/(store)/page.tsx
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getExchangeRate } from "@/lib/exchangeRate";
import ProductCard, { ProductCardData } from "@/components/ProductCard";
import Link from "next/link";

async function getFeaturedProducts(): Promise<ProductCardData[]> {
  await connectDB();
  const products = await Product.find({ available: true, featured: true })
    .limit(4)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getCategories() {
  await connectDB();
  const categories = await Category.find({ active: true }).sort({ order: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function HomePage() {
  const [featured, categories, exchangeRate] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getExchangeRate(),
  ]);

  return (
    <>
      {/* Hero tipo anaquel: el titular vive junto a productos reales, no una ilustración genérica */}
      <section className="max-w-6xl mx-auto px-5 pt-12 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl leading-[1.05] text-[var(--color-ink)]">
              TU DESPENSA,
              <br />
              SIN HACER COLA.
            </h1>
            <p className="mt-5 text-[var(--color-ink-soft)] text-lg max-w-md">
              Harina, arroz, enlatados y más — con precio fijo en dólares y
              pago en Bs, Zelle o Binance. Pides hoy, te llega en tu zona.
            </p>
            <Link
              href="/productos"
              className="inline-block mt-7 bg-[var(--color-red)] text-[var(--color-card)] px-6 py-3 font-[family-name:var(--font-body)] font-semibold hover:bg-[var(--color-green)] transition-colors"
            >
              Ver productos
            </Link>
          </div>

          {/* Mini-anaquel: productos destacados con la etiqueta de precio, ligeramente
              desalineados entre sí, como si estuvieran acomodados a mano en un estante */}
          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((product, i) => (
              <div
                key={product._id}
                className={i % 2 === 1 ? "mt-6" : ""}
              >
                <ProductCard product={product} exchangeRate={exchangeRate} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franja de confianza */}
      <section className="twine-divider bg-[var(--color-green)] text-[var(--color-card)]">
        <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap gap-x-8 gap-y-1 justify-center text-sm font-[family-name:var(--font-mono)]">
          <span>Pago Móvil · Zelle · Binance</span>
          <span>Entrega en tu zona</span>
          <span>Precio fijo en USD</span>
        </div>
      </section>

      {/* Rail de categorías */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="font-[family-name:var(--font-display)] text-2xl mb-6 text-[var(--color-green)]">
          CATEGORÍAS
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/productos?category=${cat._id}`}
              className="shrink-0 border-2 border-[var(--color-ink)] px-4 py-2 text-sm font-[family-name:var(--font-body)] hover:bg-[var(--color-yellow)] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 pb-20">
          <h2 className="font-[family-name:var(--font-display)] text-2xl mb-6 text-[var(--color-green)]">
            DESTACADOS
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                exchangeRate={exchangeRate}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
