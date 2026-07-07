// src/lib/adminAuth.ts

/**
 * Autenticación simple para el panel de admin: no hay tabla de usuarios,
 * solo un usuario/contraseña fijos en variables de entorno. El "token" de
 * sesión es un hash HMAC-SHA256 del usuario + secreto, así que no se puede
 * falsificar sin conocer ADMIN_SESSION_SECRET.
 *
 * Usamos Web Crypto (crypto.subtle) en vez del módulo 'crypto' de Node
 * porque el middleware de Next.js corre en el Edge Runtime, que no soporta
 * el módulo 'crypto' de Node directamente.
 */

async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateSessionToken(username: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET as string;
  return hmacSha256(username, secret);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const username = process.env.ADMIN_USERNAME as string;
  const expected = await generateSessionToken(username);
  return token === expected;
}
