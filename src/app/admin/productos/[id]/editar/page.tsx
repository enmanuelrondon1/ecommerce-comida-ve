// src/app/admin/productos/[id]/editar/page.tsx
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
  await connectDB();
  const product = await Product.findById(id).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    brand: product.brand || "",
    image: product.image,
    basePrice: product.basePrice,
    baseUnit: product.baseUnit,
    hasVariants: product.hasVariants,
    variants: product.variants,
    available: product.available,
    featured: product.featured,
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-green)] mb-6">
        EDITAR PRODUCTO
      </h1>
      <ProductForm productId={id} initialData={initialData} />
    </div>
  );
}
