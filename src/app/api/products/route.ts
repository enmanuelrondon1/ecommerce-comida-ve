// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET /api/products — lista productos disponibles, con filtro opcional ?category=<id>
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const showAll = searchParams.get("all") === "true";

    const filter: Record<string, unknown> = showAll ? {} : { available: true };
    if (categoryId) {
      filter.category = categoryId;
    }

    const products = await Product.find(filter)
      .populate("category", "name slug") // trae nombre/slug de la categoría, no solo el id
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

// POST /api/products — crea un nuevo producto (uso administrativo)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      slug,
      description,
      category,
      brand,
      image,
      basePrice,
      baseUnit,
      hasVariants,
      variants,
      featured,
    } = body;

    if (!name || !slug || !description || !category || !image || !baseUnit) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category,
      brand,
      image,
      basePrice: basePrice ?? 0,
      baseUnit,
      hasVariants: hasVariants ?? false,
      variants: variants ?? [],
      featured: featured ?? false,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Ya existe un producto con ese slug" },
        { status: 409 }
      );
    }

    // Errores de validación de Mongoose (ej: hasVariants sin variantes)
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
