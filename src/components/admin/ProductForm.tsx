// src/components/admin/ProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

interface Category {
  _id: string;
  name: string;
}

interface Variant {
  name: string;
  unit: string;
  price: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  image: string;
  basePrice: number;
  baseUnit: string;
  hasVariants: boolean;
  variants: Variant[];
  available: boolean;
  featured: boolean;
}

const UNITS = ["unidad", "kg", "g", "litro", "ml", "paquete"];

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  category: "",
  brand: "",
  image: "",
  basePrice: 0,
  baseUnit: "unidad",
  hasVariants: false,
  variants: [],
  available: true,
  featured: false,
};

interface ProductFormProps {
  productId?: string; // si viene, es modo edición
  initialData?: ProductFormData;
}

// Convierte "Harina P.A.N." en "harina-p-a-n" automáticamente
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Valida que el texto sea un número parcial válido mientras se escribe,
// aceptando tanto punto como coma como separador decimal
function isValidPriceInput(val: string): boolean {
  return /^\d*[.,]?\d*$/.test(val);
}

// Convierte el texto escrito (con coma o punto) a número real
function parsePriceInput(val: string): number {
  if (val === "") return 0;
  const normalized = val.replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>(initialData ?? EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slugEditedManually, setSlugEditedManually] = useState(!!initialData);

  // Guardamos el texto TAL COMO SE ESCRIBE para los precios, separado del
  // número ya convertido. Así el campo nunca se "reformatea" a mitad de
  // escritura (lo que antes borraba la coma o el 0).
  const [basePriceText, setBasePriceText] = useState<string>(
    initialData?.basePrice ? String(initialData.basePrice) : ""
  );
  const [variantPriceTexts, setVariantPriceTexts] = useState<string[]>(
    initialData?.variants.map((v) => String(v.price)) ?? []
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugEditedManually ? prev.slug : slugify(name),
    }));
  }

  function handleBasePriceChange(val: string) {
    if (!isValidPriceInput(val)) return;
    setBasePriceText(val);
    setForm((prev) => ({ ...prev, basePrice: parsePriceInput(val) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Falta configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local"
      );
      return;
    }

    setUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary no devolvió una URL válida");
      }

      setForm((prev) => ({ ...prev, image: data.secure_url }));
      showToast("Imagen subida ✓", "success");
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
      showToast("No se pudo subir la imagen", "error");
    } finally {
      setUploadingImage(false);
    }
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", unit: "unidad", price: 0 }],
    }));
    setVariantPriceTexts((prev) => [...prev, ""]);
  }

  function updateVariant(index: number, field: keyof Variant, value: string | number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  function handleVariantPriceChange(index: number, val: string) {
    if (!isValidPriceInput(val)) return;
    setVariantPriceTexts((prev) => prev.map((t, i) => (i === index ? val : t)));
    updateVariant(index, "price", parsePriceInput(val));
  }

  function removeVariant(index: number) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    setVariantPriceTexts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Limpiamos espacios accidentales al inicio/final antes de validar y enviar
    const cleanName = form.name.trim();
    const cleanDescription = form.description.trim();
    const cleanBrand = form.brand.trim();
    const cleanImage = form.image.trim();
    const cleanSlug = slugify(form.slug.trim()); // normaliza mayúsculas/espacios aunque se haya editado a mano

    if (!cleanName || !cleanSlug || !cleanDescription || !form.category || !cleanImage) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (form.hasVariants) {
      if (form.variants.length === 0) {
        setError("Agrega al menos una presentación o desactiva 'Tiene variantes'.");
        return;
      }
      const invalidVariant = form.variants.find(
        (v) => !v.name.trim() || v.price <= 0
      );
      if (invalidVariant) {
        setError("Cada presentación necesita un nombre y un precio mayor a 0.");
        return;
      }
    } else if (form.basePrice <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      name: cleanName,
      slug: cleanSlug,
      description: cleanDescription,
      brand: cleanBrand,
      image: cleanImage,
      variants: form.variants.map((v) => ({ ...v, name: v.name.trim() })),
    };

    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Ocurrió un error al guardar el producto.");
        showToast(data.error || "Ocurrió un error al guardar el producto.", "error");
        setSubmitting(false);
        return;
      }

      showToast(
        productId ? "Producto actualizado ✓" : "Producto creado ✓",
        "success"
      );
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor.");
      showToast("No pudimos conectar con el servidor.", "error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
      <div>
        <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
          Nombre del producto
        </label>
        <input
          type="text"
          placeholder="Nombre del producto"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
        />
      </div>

      <div>
        <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
          Slug (URL amigable)
        </label>
        <input
          type="text"
          placeholder="Slug (URL amigable)"
          value={form.slug}
          onChange={(e) => {
            setSlugEditedManually(true);
            setForm((prev) => ({ ...prev, slug: e.target.value }));
          }}
          className="w-full border-2 border-[var(--color-line)] px-4 py-2.5 bg-[var(--color-card)] font-[family-name:var(--font-mono)] text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
          Descripción
        </label>
        <textarea
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)] resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
            Categoría
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
          >
            <option value="">Selecciona categoría</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
            Marca (opcional)
          </label>
          <input
            type="text"
            placeholder="Marca (opcional)"
            value={form.brand}
            onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
            className="w-full border-2 border-[var(--color-line)] px-4 py-2.5 bg-[var(--color-card)]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
          Imagen del producto
        </label>

        {form.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.image}
            alt="Vista previa"
            className="w-24 h-24 object-cover border-2 border-[var(--color-ink)] mb-2"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploadingImage}
          className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)] text-sm file:mr-3 file:border-0 file:bg-[var(--color-green)] file:text-[var(--color-card)] file:px-3 file:py-1.5 file:font-medium"
        />

        {uploadingImage && (
          <p className="text-xs text-[var(--color-ink-soft)] mt-1">Subiendo imagen...</p>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.hasVariants}
          onChange={(e) => setForm((prev) => ({ ...prev, hasVariants: e.target.checked }))}
        />
        Tiene varias presentaciones (ej: 500g / 1kg)
      </label>

      {form.hasVariants ? (
        <div className="flex flex-col gap-2 border-2 border-[var(--color-line)] p-4">
          <p className="text-xs text-[var(--color-ink-soft)] mb-1">
            Presentaciones (nombre, unidad y precio en USD de cada una)
          </p>
          {form.variants.map((variant, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nombre (ej: 1kg)"
                value={variant.name}
                onChange={(e) => updateVariant(i, "name", e.target.value)}
                className="flex-1 border-2 border-[var(--color-line)] px-3 py-1.5 bg-[var(--color-bg)] text-sm"
              />
              <select
                value={variant.unit}
                onChange={(e) => updateVariant(i, "unit", e.target.value)}
                className="border-2 border-[var(--color-line)] px-2 py-1.5 bg-[var(--color-bg)] text-sm"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Precio USD"
                value={variantPriceTexts[i] ?? ""}
                onChange={(e) => handleVariantPriceChange(i, e.target.value)}
                className="w-28 border-2 border-[var(--color-line)] px-3 py-1.5 bg-[var(--color-bg)] text-sm"
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-[var(--color-red)] text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-[var(--color-green)] underline self-start"
          >
            + Agregar presentación
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
              Precio (USD)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Precio (USD)"
              value={basePriceText}
              onChange={(e) => handleBasePriceChange(e.target.value)}
              className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-ink-soft)] mb-1 block">
              Unidad de venta
            </label>
            <select
              value={form.baseUnit}
              onChange={(e) => setForm((prev) => ({ ...prev, baseUnit: e.target.value }))}
              className="w-full border-2 border-[var(--color-ink)] px-4 py-2.5 bg-[var(--color-card)]"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
          />
          Disponible
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
          />
          Destacado en home
        </label>
      </div>

      {error && (
        <p className="text-[var(--color-red)] text-sm border-2 border-[var(--color-red)] px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || uploadingImage}
        className="bg-[var(--color-green)] text-[var(--color-card)] px-6 py-3 font-semibold hover:bg-[var(--color-green-dark)] transition-colors disabled:opacity-50 self-start"
      >
        {submitting ? "Guardando..." : productId ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}