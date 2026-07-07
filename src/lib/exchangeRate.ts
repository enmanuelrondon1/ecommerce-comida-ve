// src/lib/exchangeRate.ts

const CONVERSOR_API_URL =
  process.env.CONVERSOR_API_URL ||
  "https://conversor-venezuela-2025.vercel.app/api/rates";

// Se usa solo si la API de conversor-venezuela falla o no responde a tiempo
const FALLBACK_RATE = 145.5;

interface ExchangeRateEntry {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

/**
 * Obtiene la tasa oficial BCV desde el proyecto conversor-venezuela.
 * Si falla por cualquier razón (caída del servicio, timeout, formato
 * inesperado), devuelve un valor de respaldo fijo para que la tienda
 * nunca se rompa por esto.
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const res = await fetch(CONVERSOR_API_URL, {
      // Next.js cachea esta respuesta 5 minutos en el servidor,
      // igual que el caché interno que ya tiene conversor-venezuela
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Respuesta no exitosa: ${res.status}`);
    }

    const rates: ExchangeRateEntry[] = await res.json();
    const oficial = rates.find((r) => r.fuente === "oficial");

    if (!oficial || !oficial.promedio) {
      throw new Error("No se encontró la tasa 'oficial' en la respuesta");
    }

    return oficial.promedio;
  } catch (error) {
    console.error(
      "⚠️ No se pudo obtener la tasa de conversor-venezuela, usando valor de respaldo:",
      error
    );
    return FALLBACK_RATE;
  }
}