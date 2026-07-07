// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// GET /api/categories — lista todas las categorías activas, ordenadas
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({ active: true }).sort({ order: 1 });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

// POST /api/categories — crea una nueva categoría (uso administrativo)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, slug, order } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "El nombre y el slug son obligatorios" },
        { status: 400 }
      );
    }

    const category = await Category.create({ name, slug, order: order ?? 0 });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    // Error 11000 = violación de índice único (slug repetido)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Ya existe una categoría con ese slug" },
        { status: 409 }
      );
    }

    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}