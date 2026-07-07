// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json(
      { success: false, error: "Falta configurar ADMIN_USERNAME/ADMIN_PASSWORD en .env.local" },
      { status: 500 }
    );
  }

  if (username !== validUsername || password !== validPassword) {
    return NextResponse.json(
      { success: false, error: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }

  const token = await generateSessionToken(username);
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", token, {
    httpOnly: true, // no accesible desde JavaScript del navegador, protege contra XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });

  return response;
}
