// src/app/admin/productos/nuevo/page.tsx
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-green)] mb-6">
        NUEVO PRODUCTO
      </h1>
      <ProductForm />
    </div>
  );
}
